import { apiClient } from '@core/http/api-client';
import type { PageResult } from '@core/models/page-result';
import type {
  Avistamiento,
  AvistamientoPayload,
  FiltroAvistamientos,
} from '../models/avistamiento';
import type {
  FiltroReportes,
  NuevoReporteCiudadano,
  ReporteCiudadano,
  ReporteRecibido,
  ReporteRevisado,
  RevisionReporte,
} from '../models/reporte';

const AVISTAMIENTOS = '/avistamientos';
const REPORTES = '/reportes-ciudadanos';
const id = (valor: string): string => encodeURIComponent(valor);

/**
 * RF-3. Contrato: modules/inteligencia/presentation (AvistamientosController y
 * ReportesCiudadanosController). Todo pasa por apiClient: la URL base, el token
 * y los avisos de error los ponen los interceptores.
 */
export const inteligenciaApi = {
  // --- Avistamientos ---------------------------------------------------------

  listarAvistamientos(filtro: FiltroAvistamientos = {}): Promise<PageResult<Avistamiento>> {
    return apiClient.getPage<Avistamiento>(AVISTAMIENTOS, { ...filtro }, { sinAviso: true });
  },

  crearAvistamiento(payload: AvistamientoPayload): Promise<Avistamiento> {
    return apiClient.post<Avistamiento>(AVISTAMIENTOS, payload);
  },

  actualizarAvistamiento(
    avistamientoId: string,
    payload: AvistamientoPayload,
  ): Promise<Avistamiento> {
    return apiClient.put<Avistamiento>(`${AVISTAMIENTOS}/${id(avistamientoId)}`, payload);
  },

  verificarAvistamiento(
    avistamientoId: string,
    estado: 'VERIFICADO' | 'DESCARTADO',
  ): Promise<Avistamiento> {
    return apiClient.patch<Avistamiento>(`${AVISTAMIENTOS}/${id(avistamientoId)}/verificacion`, {
      estado,
    });
  },

  eliminarAvistamiento(avistamientoId: string): Promise<void> {
    return apiClient.delete<void>(`${AVISTAMIENTOS}/${id(avistamientoId)}`);
  },

  // --- Reportes ciudadanos ---------------------------------------------------

  listarReportes(filtro: FiltroReportes = {}): Promise<PageResult<ReporteCiudadano>> {
    return apiClient.getPage<ReporteCiudadano>(REPORTES, { ...filtro }, { sinAviso: true });
  },

  /** Cuantos esperan revision (contador de la pestaña). Peticion de fondo. */
  async contarReportesPendientes(): Promise<number> {
    const pagina = await apiClient.getPage<ReporteCiudadano>(
      REPORTES,
      { estado: 'PENDIENTE', limit: 1 },
      { silencioso: true },
    );
    return pagina.meta.total;
  },

  revisarReporte(reporteId: string, revision: RevisionReporte): Promise<ReporteRevisado> {
    return apiClient.patch<ReporteRevisado>(`${REPORTES}/${id(reporteId)}/revision`, revision);
  },

  /** Publico (@Public, maximo 5 por minuto por IP): lo usa /reportar sin sesion. */
  enviarReporteCiudadano(reporte: NuevoReporteCiudadano): Promise<ReporteRecibido> {
    return apiClient.post<ReporteRecibido>(REPORTES, reporte);
  },
};
