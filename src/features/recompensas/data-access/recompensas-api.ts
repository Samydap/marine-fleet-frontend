import { apiClient, type ArchivoDescargado } from '@core/http/api-client';
import type { PageResult } from '@core/models/page-result';
import type {
  DecisionValidacion,
  FiltroRecompensas,
  RangoAmenaza,
  Recompensa,
  SolicitudRecompensa,
} from '../models/recompensa';
import type { FormatoExportacion, ReporteRecompensasPorMar } from '../models/reporte-mensual';

/**
 * Contrato: recompensas.controller.ts y reportes.controller.ts del backend.
 * Todo pasa por apiClient (token, errores y barra de carga los ponen los
 * interceptores).
 */
export const recompensasApi = {
  /** GET /recompensas (CRIMINALES_LEER). */
  listar(filtro: FiltroRecompensas): Promise<PageResult<Recompensa>> {
    return apiClient.getPage<Recompensa>('/recompensas', { ...filtro }, { sinAviso: true });
  },

  /** GET /recompensas/pendientes (RECOMPENSAS_VALIDAR): bandeja del Almirante. */
  pendientes(page: number, limit = 20): Promise<PageResult<Recompensa>> {
    return apiClient.getPage<Recompensa>(
      '/recompensas/pendientes',
      { page, limit },
      { sinAviso: true },
    );
  },

  /** GET /recompensas/criminal/:id: historial completo de un criminal. */
  historialDeCriminal(criminalId: string): Promise<Recompensa[]> {
    return apiClient.get<Recompensa[]>(`/recompensas/criminal/${encodeURIComponent(criminalId)}`);
  },

  /** POST /recompensas (RECOMPENSAS_SOLICITAR). */
  solicitar(cuerpo: SolicitudRecompensa): Promise<Recompensa> {
    return apiClient.post<Recompensa>('/recompensas', cuerpo);
  },

  /** PATCH /recompensas/:id/validacion (RECOMPENSAS_VALIDAR). */
  validar(id: string, decision: DecisionValidacion): Promise<Recompensa> {
    return apiClient.patch<Recompensa>(
      `/recompensas/${encodeURIComponent(id)}/validacion`,
      decision,
    );
  },

  /** GET /amenaza/criterios (CRIMINALES_LEER): para anticipar el nivel del monto. */
  criteriosAmenaza(): Promise<RangoAmenaza[]> {
    return apiClient.get<RangoAmenaza[]>('/amenaza/criterios', undefined, { silencioso: true });
  },

  /** GET /reportes/recompensas-por-mar (REPORTES_LEER). */
  reporteMensual(periodo: string): Promise<ReporteRecompensasPorMar> {
    return apiClient.get<ReporteRecompensasPorMar>(
      '/reportes/recompensas-por-mar',
      { periodo },
      { sinAviso: true },
    );
  },

  /** GET /reportes/recompensas-por-mar/exportar: PDF o CSV. */
  exportarReporteMensual(periodo: string, formato: FormatoExportacion): Promise<ArchivoDescargado> {
    return apiClient.descargar(
      '/reportes/recompensas-por-mar/exportar',
      { periodo, formato },
      `recompensas-por-mar-${periodo}.${formato}`,
    );
  },
};
