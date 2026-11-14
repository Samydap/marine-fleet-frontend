import { apiClient } from '@core/http/api-client';
import type { PageResult } from '@core/models/page-result';
import type {
  CerrarIncidentePayload,
  FiltroIncidentes,
  Incidente,
  OperativoOpcion,
  RegistrarIncidentePayload,
} from '../models/incidente';

const RUTA = '/incidentes';
const id = (valor: string): string => encodeURIComponent(valor);

/**
 * RF-6. Contrato: modules/incidentes/presentation/incidentes.controller.ts.
 * GET /incidentes acepta criminal, base y operativo combinables; las rutas
 * por-criminal, por-base y por-operativo son atajos del mismo listado.
 */
export const incidentesApi = {
  listar(filtro: FiltroIncidentes = {}): Promise<PageResult<Incidente>> {
    return apiClient.getPage<Incidente>(RUTA, { ...filtro }, { sinAviso: true });
  },

  obtener(incidenteId: string): Promise<Incidente> {
    return apiClient.get<Incidente>(`${RUTA}/${id(incidenteId)}`, undefined, { sinAviso: true });
  },

  registrar(payload: RegistrarIncidentePayload): Promise<Incidente> {
    return apiClient.post<Incidente>(RUTA, payload);
  },

  /** Concurrencia optimista: 409 si otra base lo modifico despues de leerlo. */
  vincularOperativo(incidenteId: string, operativoId: string, version: number): Promise<Incidente> {
    return apiClient.patch<Incidente>(
      `${RUTA}/${id(incidenteId)}/operativo`,
      { operativoId, version },
      { sinAviso: 'conflicto' },
    );
  },

  cerrar(incidenteId: string, payload: CerrarIncidentePayload): Promise<Incidente> {
    return apiClient.post<Incidente>(`${RUTA}/${id(incidenteId)}/cierre`, payload, {
      sinAviso: 'conflicto',
    });
  },

  // --- Fronteras con criminales y operativos: el endpoint, nunca un import ----

  /** Los operativos que ve el usuario (el backend filtra por su base). */
  async listarOperativosOpciones(): Promise<OperativoOpcion[]> {
    const pagina = await apiClient.getPage<OperativoOpcion>(
      '/operativos',
      { limit: 100, order: 'DESC' },
      { silencioso: true },
    );
    return pagina.data;
  },

  obtenerOperativo(operativoId: string): Promise<OperativoOpcion> {
    return apiClient.get<OperativoOpcion>(`/operativos/${id(operativoId)}`, undefined, {
      silencioso: true,
    });
  },
};
