import { create } from 'zustand';
import { PAGINA_VACIA, type PageMeta } from '@core/models/page-result';
import type { Avistamiento, FiltroAvistamientos } from '../models/avistamiento';
import { inteligenciaApi } from './inteligencia-api';

interface AvistamientosState {
  avistamientos: Avistamiento[];
  meta: PageMeta;
  cargando: boolean;
  error: unknown;
  consultadoEn: string | null;
  filtro: FiltroAvistamientos;
  cargar: (parcial?: Partial<FiltroAvistamientos>) => Promise<void>;
  irAPagina: (page: number) => Promise<void>;
  reemplazar: (avistamiento: Avistamiento) => void;
}

export const FILTRO_INICIAL_AVISTAMIENTOS: FiltroAvistamientos = {
  page: 1,
  limit: 20,
  order: 'DESC',
};

/** Archivo de avistamientos (mismo patron que el store de criminales). */
export const useAvistamientosStore = create<AvistamientosState>()((set, get) => ({
  avistamientos: [],
  meta: PAGINA_VACIA,
  cargando: false,
  error: null,
  consultadoEn: null,
  filtro: FILTRO_INICIAL_AVISTAMIENTOS,

  cargar: async (parcial = {}) => {
    const filtro = { ...get().filtro, ...parcial };
    set({ filtro, cargando: true });
    try {
      const pagina = await inteligenciaApi.listarAvistamientos(filtro);
      // Una respuesta vieja (el filtro cambio mientras viajaba) no pisa la nueva.
      if (get().filtro !== filtro) return;
      set({
        avistamientos: pagina.data,
        meta: pagina.meta,
        cargando: false,
        error: null,
        consultadoEn: new Date().toISOString(),
      });
    } catch (error) {
      if (get().filtro !== filtro) return;
      set({ cargando: false, error });
    }
  },

  irAPagina: (page) => get().cargar({ page }),

  reemplazar: (actualizado) =>
    set((s) => ({
      avistamientos: s.avistamientos.map((a) => (a.id === actualizado.id ? actualizado : a)),
    })),
}));
