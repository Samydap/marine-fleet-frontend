import { apiClient } from '@core/http/api-client';
import type { PageResult } from '@core/models/page-result';
import type {
  Avistamiento,
  AvistamientoPayload,
  CriminalOpcion,
  FiltroAvistamientos,
} from '../models/avistamiento';

const RUTA = '/avistamientos';

/**
 * RF-3. Portado de la v1 (frontend/src/App.tsx), donde estas cuatro llamadas
 * estaban escritas a mano con `fetch` dentro del componente.
 *
 * Lo que cambia respecto a la v1:
 *  - las URL ya no llevan el host ni el prefijo: los pone apiUrlInterceptor
 *  - el manejo de errores ya no se repite: lo hace errorInterceptor
 *  - el sobre { success, data } lo desenvuelve apiClient
 */
export const inteligenciaApi = {
  listarAvistamientos(filtro: FiltroAvistamientos = {}): Promise<PageResult<Avistamiento>> {
    return apiClient.getPage<Avistamiento>(RUTA, { ...filtro });
  },

  crearAvistamiento(payload: AvistamientoPayload): Promise<Avistamiento> {
    return apiClient.post<Avistamiento>(RUTA, payload);
  },

  actualizarAvistamiento(id: string, payload: AvistamientoPayload): Promise<Avistamiento> {
    return apiClient.put<Avistamiento>(`${RUTA}/${encodeURIComponent(id)}`, payload);
  },

  eliminarAvistamiento(id: string): Promise<void> {
    return apiClient.delete<void>(`${RUTA}/${encodeURIComponent(id)}`);
  },

  /**
   * Opciones del selector de criminales. Consume el endpoint publico de
   * criminales en lugar de importar nada de features/criminales.
   */
  async listarCriminalesParaSelector(): Promise<CriminalOpcion[]> {
    const pagina = await apiClient.getPage<CriminalOpcion>('/criminales', {
      limit: 100,
      order: 'DESC',
    });
    return pagina.data;
  },
};
