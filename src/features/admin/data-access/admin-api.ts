import type {
  BaseNaval,
  EstadoBase,
  Mar,
  TipoMar,
  ZonaInfluencia,
} from '@core/catalogos/catalogos';
import { apiClient } from '@core/http/api-client';
import type { PageResult } from '@core/models/page-result';
import type { FiltroAuditoria, RegistroAuditoria } from '../models/auditoria';
import type {
  ActualizarUsuarioPayload,
  CrearUsuarioPayload,
  FiltroUsuarios,
  Rol,
  Usuario,
} from '../models/usuario';

const id = (valor: string): string => encodeURIComponent(valor);

// --- Usuarios (USUARIOS_ADMINISTRAR) ---------------------------------------------

export const usuariosApi = {
  listar(filtro: FiltroUsuarios): Promise<PageResult<Usuario>> {
    return apiClient.getPage<Usuario>('/usuarios', { ...filtro }, { sinAviso: true });
  },
  obtener(usuarioId: string): Promise<Usuario> {
    return apiClient.get<Usuario>(`/usuarios/${id(usuarioId)}`, undefined, { sinAviso: true });
  },
  roles(): Promise<Rol[]> {
    return apiClient.get<Rol[]>('/usuarios/roles');
  },
  crear(payload: CrearUsuarioPayload): Promise<Usuario> {
    return apiClient.post<Usuario>('/usuarios', payload);
  },
  /** Lleva `version`: si otro administrador lo cambio, 409. */
  actualizar(usuarioId: string, payload: ActualizarUsuarioPayload): Promise<Usuario> {
    return apiClient.patch<Usuario>(`/usuarios/${id(usuarioId)}`, payload, {
      sinAviso: 'conflicto',
    });
  },
  restablecerContrasena(usuarioId: string, nuevaPassword: string): Promise<void> {
    return apiClient.patch<void>(`/usuarios/${id(usuarioId)}/contrasena`, { nuevaPassword });
  },
};

// --- Catalogo geografico (CATALOGOS_ADMINISTRAR) ----------------------------------

export interface MarPayload {
  nombre?: string;
  tipo?: TipoMar;
  activo?: boolean;
}

export interface ZonaPayload {
  marId?: string;
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface BasePayload {
  nombre?: string;
  zonaInfluenciaId?: string;
  ubicacion?: string;
  comandanteNombre?: string;
  estado?: EstadoBase;
  version?: number;
}

export interface DetalleBase {
  readonly base: BaseNaval;
  readonly usuariosAsignados: readonly {
    id: string;
    nombreCompleto: string;
    rol: string;
    estado: string;
  }[];
  readonly operativosActivos: number;
}

export const catalogosAdminApi = {
  crearMar: (p: MarPayload): Promise<Mar> => apiClient.post<Mar>('/catalogos/mares', p),
  actualizarMar: (marId: string, p: MarPayload): Promise<Mar> =>
    apiClient.patch<Mar>(`/catalogos/mares/${id(marId)}`, p, { sinAviso: 'conflicto' }),
  crearZona: (p: ZonaPayload): Promise<ZonaInfluencia> =>
    apiClient.post<ZonaInfluencia>('/catalogos/zonas-influencia', p),
  actualizarZona: (zonaId: string, p: ZonaPayload): Promise<ZonaInfluencia> =>
    apiClient.patch<ZonaInfluencia>(`/catalogos/zonas-influencia/${id(zonaId)}`, p, {
      sinAviso: 'conflicto',
    }),
  crearBase: (p: BasePayload): Promise<BaseNaval> =>
    apiClient.post<BaseNaval>('/catalogos/bases-navales', p),
  /** Con `version`: 409 si otra base la edito entre tanto. */
  actualizarBase: (baseId: string, p: BasePayload): Promise<BaseNaval> =>
    apiClient.patch<BaseNaval>(`/catalogos/bases-navales/${id(baseId)}`, p, {
      sinAviso: 'conflicto',
    }),
  detalleBase: (baseId: string): Promise<DetalleBase> =>
    apiClient.get<DetalleBase>(`/catalogos/bases-navales/${id(baseId)}`, undefined, {
      silencioso: true,
    }),
};

// --- Bitacora (AUDITORIA_LEER) --------------------------------------------------

export const auditoriaApi = {
  listar(filtro: FiltroAuditoria): Promise<PageResult<RegistroAuditoria>> {
    return apiClient.getPage<RegistroAuditoria>('/auditoria', { ...filtro }, { sinAviso: true });
  },
};
