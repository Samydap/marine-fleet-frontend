import { apiClient, type ArchivoDescargado } from '@core/http/api-client';
import type { PageResult } from '@core/models/page-result';
import type {
  Cartel,
  CriminalEnCartel,
  FiltroGaleria,
  FormatoCartel,
  ResultadoRegeneracion,
} from '../models/cartel';

const RUTA = '/carteles';
const id = (valor: string): string => encodeURIComponent(valor);

/** CartelesController (RF-2). Rutas relativas: apiUrlInterceptor pone /api/v1. */
export const cartelesApi = {
  vigente(criminalId: string, silencioso = false): Promise<Cartel> {
    return apiClient.get<Cartel>(`${RUTA}/criminal/${id(criminalId)}`, undefined, {
      silencioso,
      sinAviso: true,
    });
  },

  /** Todas las versiones, de la mas reciente a la mas antigua. */
  versiones(criminalId: string, silencioso = false): Promise<Cartel[]> {
    return apiClient.get<Cartel[]>(`${RUTA}/criminal/${id(criminalId)}/versiones`, undefined, {
      silencioso,
      sinAviso: true,
    });
  },

  /** PDF para imprimir o SVG como imagen, con el token y los errores de siempre. */
  descargar(cartelId: string, formato: FormatoCartel, nombre: string): Promise<ArchivoDescargado> {
    return apiClient.descargar(`${RUTA}/${id(cartelId)}/descargar`, { formato }, nombre);
  },

  /** Emite a mano una version nueva (CARTELES_GENERAR). */
  generar(criminalId: string): Promise<Cartel> {
    return apiClient.post<Cartel>(`${RUTA}/criminal/${id(criminalId)}/generar`);
  },

  /** Emite el cartel inicial de los criminales que aun no tienen uno. */
  emitirFaltantes(): Promise<ResultadoRegeneracion> {
    return apiClient.post<ResultadoRegeneracion>(`${RUTA}/regenerar-todos`);
  },

  /**
   * La galeria: no existe GET /carteles (listado de vigentes), asi que se
   * recorre el archivo criminal por contrato (GET /criminales) y cada cartel se
   * abre por criminal. Ver el bloqueo reportado a backend.
   */
  criminales(filtro: FiltroGaleria, silencioso = false): Promise<PageResult<CriminalEnCartel>> {
    return apiClient.getPage<CriminalEnCartel>(
      '/criminales',
      { ...filtro },
      { silencioso, sinAviso: true },
    );
  },
};
