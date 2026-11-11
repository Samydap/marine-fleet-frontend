import type { ApiResponse } from '../models/api-response';
import { PAGINA_VACIA, type PageResult } from '../models/page-result';
import { apiUrlInterceptor } from './api-url.interceptor';
import { authInterceptor } from './auth.interceptor';
import { errorInterceptor } from './error.interceptor';
import { loadingInterceptor } from './loading.interceptor';
import { componer, type Interceptor, type Peticion } from './types';

type ValorParametro = string | number | boolean | undefined | null;

/**
 * El ORDEN importa: en la peticion se ejecutan de arriba abajo y en la
 * respuesta al revés, asi que errorInterceptor queda por dentro y ve el estado
 * HTTP real antes de que nadie mas lo toque.
 */
const INTERCEPTORES: readonly Interceptor[] = [
  apiUrlInterceptor,
  authInterceptor,
  loadingInterceptor,
  errorInterceptor,
];

const ejecutar = componer(INTERCEPTORES, ({ url, init }: Peticion) => fetch(url, init));

/** Omite los parametros vacios: evita '?estado=' y '?q=undefined' en la URL. */
function construirQuery(params?: Record<string, ValorParametro>): string {
  if (!params) return '';
  const query = new URLSearchParams();
  for (const [clave, valor] of Object.entries(params)) {
    if (valor !== undefined && valor !== null && valor !== '') {
      query.set(clave, String(valor));
    }
  }
  const texto = query.toString();
  return texto ? `?${texto}` : '';
}

async function pedir<T>(
  metodo: string,
  ruta: string,
  opciones: { cuerpo?: unknown; params?: Record<string, ValorParametro> } = {},
): Promise<ApiResponse<T>> {
  const init: RequestInit = { method: metodo };

  if (opciones.cuerpo !== undefined) {
    init.body = JSON.stringify(opciones.cuerpo);
    init.headers = { 'Content-Type': 'application/json' };
  }

  const respuesta = await ejecutar({ url: `${ruta}${construirQuery(opciones.params)}`, init });

  if (respuesta.status === 204) {
    return { success: true, data: undefined as T };
  }

  return (await respuesta.json()) as ApiResponse<T>;
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
  async get<T>(ruta: string, params?: Record<string, ValorParametro>): Promise<T> {
    return (await pedir<T>('GET', ruta, { params })).data;
  },

  /** GET de un listado paginado: devuelve datos y metainformacion juntos. */
  async getPage<T>(ruta: string, params?: Record<string, ValorParametro>): Promise<PageResult<T>> {
    const respuesta = await pedir<T[]>('GET', ruta, { params });
    return { data: respuesta.data, meta: respuesta.meta ?? PAGINA_VACIA };
  },

  async post<T>(ruta: string, cuerpo?: unknown): Promise<T> {
    return (await pedir<T>('POST', ruta, { cuerpo })).data;
  },

  async put<T>(ruta: string, cuerpo?: unknown): Promise<T> {
    return (await pedir<T>('PUT', ruta, { cuerpo })).data;
  },

  async patch<T>(ruta: string, cuerpo?: unknown): Promise<T> {
    return (await pedir<T>('PATCH', ruta, { cuerpo })).data;
  },

  async delete<T>(ruta: string): Promise<T> {
    return (await pedir<T>('DELETE', ruta)).data;
  },
};
