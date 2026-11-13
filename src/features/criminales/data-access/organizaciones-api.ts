import { apiClient } from '@core/http/api-client';
import type { PageResult } from '@core/models/page-result';
import type {
  ActualizarOrganizacionPayload,
  CrearOrganizacionPayload,
  FiltroOrganizaciones,
  Organizacion,
  OrganizacionDetalle,
} from '../models/criminal';

const RUTA = '/organizaciones';

/** OrganizacionesController: tripulaciones, organizaciones y bandas. */
export const organizacionesApi = {
  listar(filtro: FiltroOrganizaciones): Promise<PageResult<Organizacion>> {
    return apiClient.getPage<Organizacion>(RUTA, { ...filtro }, { sinAviso: true });
  },

  /** `historicos` incluye a los miembros que ya salieron. */
  obtener(id: string, historicos = false, silencioso = false): Promise<OrganizacionDetalle> {
    return apiClient.get<OrganizacionDetalle>(
      `${RUTA}/${encodeURIComponent(id)}`,
      { historicos: historicos || undefined },
      { silencioso, sinAviso: true },
    );
  },

  crear(payload: CrearOrganizacionPayload): Promise<Organizacion> {
    return apiClient.post<Organizacion>(RUTA, payload);
  },

  actualizar(id: string, payload: ActualizarOrganizacionPayload): Promise<Organizacion> {
    return apiClient.patch<Organizacion>(`${RUTA}/${encodeURIComponent(id)}`, payload);
  },
};
