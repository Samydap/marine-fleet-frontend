import { create } from 'zustand';
import { PAGINA_VACIA, type PageMeta } from '@core/models/page-result';
import type { Criminal, FiltroCriminales } from '../models/criminal';
import { criminalesApi } from './criminales-api';

interface CriminalesState {
  criminales: Criminal[];
  meta: PageMeta;
  cargando: boolean;
  filtro: FiltroCriminales;
  cargar: (parcial?: Partial<FiltroCriminales>) => Promise<void>;
  buscar: (q: string) => Promise<void>;
  irAPagina: (page: number) => Promise<void>;
  reemplazar: (criminal: Criminal) => void;
}

/**
 * STORE DE REFERENCIA.
 *
 * Patron para todas las features: el estado vive en la feature, no en un store
 * global, y la pagina solo lee de aqui. Es el equivalente directo del store con
 * signals del diseno original; Zustand da la misma propiedad (estado fuera del
 * componente, suscripcion granular) sin el peso de NgRx ni de Redux.
 */
export const useCriminalesStore = create<CriminalesState>()((set, get) => ({
  criminales: [],
  meta: PAGINA_VACIA,
  cargando: false,
  filtro: { page: 1, limit: 20, order: 'DESC' },

  cargar: async (parcial = {}) => {
    const filtro = { ...get().filtro, ...parcial };
    set({ filtro, cargando: true });

    try {
      const pagina = await criminalesApi.listar(filtro);
      set({ criminales: pagina.data, meta: pagina.meta, cargando: false });
    } catch {
      // El errorInterceptor ya notifico: aqui solo se apaga el indicador.
      set({ cargando: false });
    }
  },

  buscar: (q) => get().cargar({ q, page: 1 }),

  irAPagina: (page) => get().cargar({ page }),

  /** Reemplaza un elemento tras una mutacion, sin recargar toda la lista. */
  reemplazar: (actualizado) =>
    set((s) => ({
      criminales: s.criminales.map((c) => (c.id === actualizado.id ? actualizado : c)),
    })),
}));
