import { apiClient } from '@core/http/api-client';
import type { PageResult } from '@core/models/page-result';
import type {
  BaseAsignadaPayload,
  CrearOperativoPayload,
  DetalleOperativo,
  EstadoOperativo,
  FiltroOperativos,
  Operativo,
  PrioridadOperativo,
  ResponsablePayload,
  ResultadoOperativo,
  UsuarioDeBase,
} from '../models/operativo';

const RUTA = '/operativos';
const ruta = (id: string, resto = ''): string => `${RUTA}/${encodeURIComponent(id)}${resto}`;

/**
 * HTTP de operativos (RF-4). Todo pasa por apiClient: el prefijo /api/v1, el
 * token y los avisos de error los ponen los interceptores.
 *
 * Los cambios de estado, prioridad y el cierre llevan la `version` leida: si
 * otra base modifico el operativo, el backend responde 409.
 */
export const operativosApi = {
  listar(filtro: FiltroOperativos, silencioso = false): Promise<PageResult<Operativo>> {
    return apiClient.getPage<Operativo>(RUTA, { ...filtro }, { silencioso, sinAviso: true });
  },

  obtener(id: string, silencioso = false): Promise<DetalleOperativo> {
    return apiClient.get<DetalleOperativo>(ruta(id), undefined, { silencioso, sinAviso: true });
  },

  crear(payload: CrearOperativoPayload): Promise<Operativo> {
    return apiClient.post<Operativo>(RUTA, payload);
  },

  asignarBases(id: string, bases: BaseAsignadaPayload[]): Promise<Operativo> {
    return apiClient.post<Operativo>(ruta(id, '/bases'), { bases });
  },

  asignarResponsables(id: string, responsables: ResponsablePayload[]): Promise<Operativo> {
    return apiClient.post<Operativo>(ruta(id, '/responsables'), { responsables });
  },

  /** EN_CURSO para iniciarlo, ABORTADO para abortarlo. Completar va por `cerrar`. */
  cambiarEstado(id: string, estado: EstadoOperativo, version: number): Promise<Operativo> {
    return apiClient.patch<Operativo>(
      ruta(id, '/estado'),
      { estado, version },
      { sinAviso: 'conflicto' },
    );
  },

  cambiarPrioridad(id: string, prioridad: PrioridadOperativo, version: number): Promise<Operativo> {
    return apiClient.patch<Operativo>(
      ruta(id, '/prioridad'),
      { prioridad, version },
      { sinAviso: 'conflicto' },
    );
  },

  cerrar(
    id: string,
    resultado: ResultadoOperativo,
    observaciones: string | undefined,
    version: number,
  ): Promise<Operativo> {
    return apiClient.post<Operativo>(
      ruta(id, '/cierre'),
      { resultado, observaciones, version },
      { sinAviso: 'conflicto' },
    );
  },

  /**
   * Usuarios de una base (para elegir responsables). Es el unico listado de
   * usuarios que el Coordinador puede leer: GET /usuarios exige
   * USUARIOS_ADMINISTRAR.
   */
  async usuariosDeBase(baseId: string): Promise<UsuarioDeBase[]> {
    const detalle = await apiClient.get<{ usuariosAsignados: UsuarioDeBase[] }>(
      `/catalogos/bases-navales/${encodeURIComponent(baseId)}`,
      undefined,
      { silencioso: true },
    );
    return detalle.usuariosAsignados;
  },
};
