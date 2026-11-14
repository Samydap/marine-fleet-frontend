import { create } from 'zustand';
import { PAGINA_VACIA, type PageMeta } from '@core/models/page-result';
import { resolverCriminales } from '@core/directorio/directorio-criminales';
import type { FiltroRecompensas, Recompensa } from '../models/recompensa';
import { recompensasApi } from './recompensas-api';

// Las respuestas de recompensas traen el nombre y la foto del criminal. La
// bandeja de validacion pide ademas su ficha al directorio de core/: necesita
// la recompensa vigente, la amenaza y la afiliacion para comparar.

/** Listado paginado: el historial general y la bandeja del Almirante usan la misma forma. */
interface Listado {
  readonly recompensas: readonly Recompensa[];
  readonly meta: PageMeta;
  readonly cargando: boolean;
  readonly error: unknown;
  readonly consultadoEn: string | null;
}

const LISTADO_VACIO: Listado = {
  recompensas: [],
  meta: PAGINA_VACIA,
  cargando: false,
  error: null,
  consultadoEn: null,
};

interface RecompensasState {
  historial: Listado;
  filtro: FiltroRecompensas;
  pendientes: Listado;
  paginaPendientes: number;

  cargarHistorial: (parcial?: Partial<FiltroRecompensas>) => Promise<void>;
  cargarPendientes: (page?: number) => Promise<void>;
  /** Saca una recompensa de la bandeja tras validarla o rechazarla. */
  quitarPendiente: (id: string) => void;
}

export const useRecompensasStore = create<RecompensasState>()((set, get) => ({
  historial: LISTADO_VACIO,
  filtro: { page: 1, limit: 20 },
  pendientes: LISTADO_VACIO,
  paginaPendientes: 1,

  cargarHistorial: async (parcial = {}) => {
    const filtro = { ...get().filtro, ...parcial };
    set((s) => ({ filtro, historial: { ...s.historial, cargando: true } }));
    try {
      const pagina = await recompensasApi.listar(filtro);
      set({
        historial: {
          recompensas: pagina.data,
          meta: pagina.meta,
          cargando: false,
          error: null,
          consultadoEn: new Date().toISOString(),
        },
      });
      // El historial ya trae nombre y foto (criminalNombre): solo se piden los que falten.
      void resolverCriminales(
        pagina.data.filter((r) => r.criminalNombre === undefined).map((r) => r.criminalId),
      );
    } catch (error) {
      set((s) => ({ historial: { ...s.historial, cargando: false, error } }));
    }
  },

  cargarPendientes: async (page) => {
    const pagina = page ?? get().paginaPendientes;
    set((s) => ({ paginaPendientes: pagina, pendientes: { ...s.pendientes, cargando: true } }));
    try {
      const resultado = await recompensasApi.pendientes(pagina);
      set({
        pendientes: {
          recompensas: resultado.data,
          meta: resultado.meta,
          cargando: false,
          error: null,
          consultadoEn: new Date().toISOString(),
        },
      });
      void resolverCriminales(resultado.data.map((r) => r.criminalId));
    } catch (error) {
      set((s) => ({ pendientes: { ...s.pendientes, cargando: false, error } }));
    }
  },

  quitarPendiente: (id) =>
    set((s) => {
      const recompensas = s.pendientes.recompensas.filter((r) => r.id !== id);
      if (recompensas.length === s.pendientes.recompensas.length) return s;
      return {
        pendientes: {
          ...s.pendientes,
          recompensas,
          meta: { ...s.pendientes.meta, total: Math.max(0, s.pendientes.meta.total - 1) },
        },
      };
    }),
}));
