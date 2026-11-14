import { create } from 'zustand';
import { PAGINA_VACIA, type PageMeta } from '@core/models/page-result';
import type { FiltroAuditoria, RegistroAuditoria } from '../models/auditoria';
import type { FiltroUsuarios, Usuario } from '../models/usuario';
import { auditoriaApi, usuariosApi } from './admin-api';

interface Listado<T, F> {
  filas: T[];
  meta: PageMeta;
  cargando: boolean;
  error: unknown;
  consultadoEn: string | null;
  filtro: F;
  cargar: (parcial?: Partial<F>) => Promise<void>;
  irAPagina: (page: number) => Promise<void>;
}

export const useUsuariosStore = create<Listado<Usuario, FiltroUsuarios>>()((set, get) => ({
  filas: [],
  meta: PAGINA_VACIA,
  cargando: false,
  error: null,
  consultadoEn: null,
  filtro: { page: 1, limit: 20, order: 'ASC' },
  cargar: async (parcial = {}) => {
    const filtro = { ...get().filtro, ...parcial };
    set({ filtro, cargando: true });
    try {
      const pagina = await usuariosApi.listar(filtro);
      set({
        filas: pagina.data,
        meta: pagina.meta,
        cargando: false,
        error: null,
        consultadoEn: new Date().toISOString(),
      });
    } catch (error) {
      set({ cargando: false, error });
    }
  },
  irAPagina: (page) => get().cargar({ page }),
}));

interface BitacoraState extends Listado<RegistroAuditoria, FiltroAuditoria> {
  /** id de usuario -> nombre, si el rol puede leer el directorio de usuarios. */
  nombres: Record<string, string>;
  cargarNombres: () => Promise<void>;
}

export const useBitacoraStore = create<BitacoraState>()((set, get) => ({
  filas: [],
  meta: PAGINA_VACIA,
  cargando: false,
  error: null,
  consultadoEn: null,
  filtro: { page: 1, limit: 50, order: 'DESC' },
  nombres: {},
  cargar: async (parcial = {}) => {
    const filtro = { ...get().filtro, ...parcial };
    set({ filtro, cargando: true });
    try {
      const pagina = await auditoriaApi.listar(filtro);
      set({
        filas: pagina.data,
        meta: pagina.meta,
        cargando: false,
        error: null,
        consultadoEn: new Date().toISOString(),
      });
    } catch (error) {
      set({ cargando: false, error });
    }
  },
  irAPagina: (page) => get().cargar({ page }),
  /**
   * La bitacora solo trae el id del usuario. Se resuelve con el directorio
   * (primeras 100 cuentas); lo que no aparezca se muestra por su id.
   */
  cargarNombres: async () => {
    if (Object.keys(get().nombres).length > 0) return;
    try {
      const pagina = await usuariosApi.listar({ page: 1, limit: 100, order: 'ASC' });
      set({ nombres: Object.fromEntries(pagina.data.map((u) => [u.id, u.nombreCompleto])) });
    } catch {
      // Sin directorio, la bitacora muestra los ids: sigue siendo util.
    }
  },
}));
