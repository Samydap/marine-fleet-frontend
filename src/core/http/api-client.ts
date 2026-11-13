import type { ApiResponse } from '../models/api-response';
import { PAGINA_VACIA, type PageResult } from '../models/page-result';
import { apiUrlInterceptor } from './api-url.interceptor';
import { authInterceptor } from './auth.interceptor';
import { errorInterceptor } from './error.interceptor';
import { loadingInterceptor } from './loading.interceptor';
import { sesionInterceptor } from './sesion.interceptor';
import { componer, type Interceptor, type Peticion } from './types';

export type ValorParametro = string | number | boolean | undefined | null;
export type ParametrosConsulta = Record<string, ValorParametro | readonly string[]>;

/** Opciones por peticion. */
export interface OpcionesPeticion {
  /** Peticion de fondo: sin barra de carga ni aviso de error (ver Peticion). */
  readonly silencioso?: boolean;
  /**
   * La pantalla pinta el error en linea (ver Peticion.sinAviso). Las lecturas
   * que terminan en EstadoError van con `true`; las escrituras con `version`
   * que resuelven el 409 con AlertaConflicto, con `'conflicto'`.
   */
  readonly sinAviso?: boolean | 'conflicto';
}

interface OpcionesEnvio extends OpcionesPeticion {
  readonly cuerpo?: unknown;
  readonly params?: ParametrosConsulta;
}

/** Archivo binario devuelto por los endpoints de exportacion y descarga. */
export interface ArchivoDescargado {
  readonly blob: Blob;
  /** Tomado de Content-Disposition; si no viene, el nombre sugerido. */
  readonly nombre: string;
}

/**
 * El ORDEN importa: en la peticion se ejecutan de arriba abajo y en la
 * respuesta al revés, asi que errorInterceptor queda por dentro y ve el estado
 * HTTP real antes de que nadie mas lo toque, y sesionInterceptor queda por
 * fuera de authInterceptor para que el reintento tras renovar lleve el token
 * nuevo.
 */
const INTERCEPTORES: readonly Interceptor[] = [
  apiUrlInterceptor,
  sesionInterceptor,
  authInterceptor,
  loadingInterceptor,
  errorInterceptor,
];

const ejecutar = componer(INTERCEPTORES, ({ url, init }: Peticion) => fetch(url, init));

/**
 * Omite los parametros vacios: evita '?estado=' y '?q=undefined' en la URL.
 * Los arreglos se repiten (`?bases=a&bases=b`), que es lo que espera Nest.
 */
export function construirQuery(params?: ParametrosConsulta): string {
  if (!params) return '';
  const query = new URLSearchParams();
  for (const [clave, valor] of Object.entries(params)) {
    if (Array.isArray(valor)) {
      for (const item of valor as readonly string[]) query.append(clave, item);
    } else if (valor !== undefined && valor !== null && valor !== '') {
      query.set(clave, String(valor));
    }
  }
  const texto = query.toString();
  return texto ? `?${texto}` : '';
}

async function enviar(
  metodo: string,
  ruta: string,
  opciones: OpcionesEnvio = {},
): Promise<Response> {
  const init: RequestInit = { method: metodo };

  if (opciones.cuerpo !== undefined) {
    init.body = JSON.stringify(opciones.cuerpo);
    init.headers = { 'Content-Type': 'application/json' };
  }

  return ejecutar({
    url: `${ruta}${construirQuery(opciones.params)}`,
    init,
    silencioso: opciones.silencioso,
    sinAviso: opciones.sinAviso,
  });
}

async function pedir<T>(
  metodo: string,
  ruta: string,
  opciones: OpcionesEnvio = {},
): Promise<ApiResponse<T>> {
  const respuesta = await enviar(metodo, ruta, opciones);

  if (respuesta.status === 204) {
    return { success: true, data: undefined as T };
  }

  return (await respuesta.json()) as ApiResponse<T>;
}

/** `attachment; filename="cartel-luffy-v3.pdf"` -> `cartel-luffy-v3.pdf`. */
export function nombreDesdeDisposicion(cabecera: string | null, porDefecto: string): string {
  if (!cabecera) return porDefecto;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(cabecera);
  if (utf8?.[1]) return decodeURIComponent(utf8[1]);
  const simple = /filename="?([^";]+)"?/i.exec(cabecera);
  return simple?.[1]?.trim() || porDefecto;
}

/**
 * Cliente HTTP: desenvuelve el sobre { success, data, meta } para que ningun
 * servicio de feature tenga que repetirlo.
 *
 * Deliberadamente NO tiene metodos de negocio: cada feature pone los suyos en
 * su propio '*-api.ts'. Un cliente global con cuarenta metodos seria un archivo
 * compartido por seis personas, es decir, un foco de conflictos.
 */
export const apiClient = {
  async get<T>(ruta: string, params?: ParametrosConsulta, opciones?: OpcionesPeticion): Promise<T> {
    return (await pedir<T>('GET', ruta, { ...opciones, params })).data;
  },

  /** GET de un listado paginado: devuelve datos y metainformacion juntos. */
  async getPage<T>(
    ruta: string,
    params?: ParametrosConsulta,
    opciones?: OpcionesPeticion,
  ): Promise<PageResult<T>> {
    const respuesta = await pedir<T[]>('GET', ruta, { ...opciones, params });
    return { data: respuesta.data, meta: respuesta.meta ?? PAGINA_VACIA };
  },

  async post<T>(ruta: string, cuerpo?: unknown, opciones?: OpcionesPeticion): Promise<T> {
    return (await pedir<T>('POST', ruta, { ...opciones, cuerpo })).data;
  },

  async put<T>(ruta: string, cuerpo?: unknown, opciones?: OpcionesPeticion): Promise<T> {
    return (await pedir<T>('PUT', ruta, { ...opciones, cuerpo })).data;
  },

  async patch<T>(ruta: string, cuerpo?: unknown, opciones?: OpcionesPeticion): Promise<T> {
    return (await pedir<T>('PATCH', ruta, { ...opciones, cuerpo })).data;
  },

  async delete<T>(ruta: string, opciones?: OpcionesPeticion): Promise<T> {
    return (await pedir<T>('DELETE', ruta, opciones)).data;
  },

  /**
   * Descarga binaria (PDF, CSV, SVG) con el token y el manejo de errores de
   * siempre. Para guardarla en disco: `guardarArchivo` de shared/utils/archivo.
   *
   *   const archivo = await apiClient.descargar('/reportes/tendencias/exportar', { formato: 'csv' });
   */
  async descargar(
    ruta: string,
    params?: ParametrosConsulta,
    nombrePorDefecto = 'descarga',
  ): Promise<ArchivoDescargado> {
    const respuesta = await enviar('GET', ruta, { params });
    return {
      blob: await respuesta.blob(),
      nombre: nombreDesdeDisposicion(
        respuesta.headers.get('Content-Disposition'),
        nombrePorDefecto,
      ),
    };
  },
};
