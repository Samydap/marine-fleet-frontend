import { apiClient } from '@core/http/api-client';
import type { PageResult } from '@core/models/page-result';
import type {
  Criminal,
  CrearCriminalPayload,
  EstadoCriminal,
  FiltroCriminales,
} from '../models/criminal';

const RUTA = '/criminales';

/**
 * MODULO HTTP DE REFERENCIA.
 *
 * Vive dentro de la feature a proposito: el dueno de Criminales es el unico que
 * lo toca. Un 'api.ts' global con los endpoints de los siete modulos seria un
 * archivo compartido por seis personas.
 *
 * Las rutas son relativas: apiUrlInterceptor les pone el prefijo /api/v1.
 */
export const criminalesApi = {
  listar(filtro: FiltroCriminales): Promise<PageResult<Criminal>> {
    return apiClient.getPage<Criminal>(RUTA, { ...filtro });
  },

  obtener(id: string): Promise<Criminal> {
    return apiClient.get<Criminal>(`${RUTA}/${encodeURIComponent(id)}`);
  },

  crear(payload: CrearCriminalPayload): Promise<Criminal> {
    return apiClient.post<Criminal>(RUTA, payload);
  },

  /** `version` viaja para que el backend detecte ediciones concurrentes (409). */
  cambiarEstado(id: string, estado: EstadoCriminal, version: number): Promise<Criminal> {
    return apiClient.patch<Criminal>(`${RUTA}/${encodeURIComponent(id)}/estado`, {
      estado,
      version,
    });
  },
};
