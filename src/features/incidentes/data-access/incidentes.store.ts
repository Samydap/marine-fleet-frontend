import { create } from 'zustand';
import { PAGINA_VACIA, type PageMeta } from '@core/models/page-result';
import type { FiltroIncidentes, Incidente } from '../models/incidente';
import { incidentesApi } from './incidentes-api';

interface IncidentesState {
  incidentes: Incidente[];
  meta: PageMeta;
  cargando: boolean;
  error: unknown;
  consultadoEn: string | null;
  filtro: FiltroIncidentes;
  cargar: (parcial?: Partial<FiltroIncidentes>) => Promise<void>;
  irAPagina: (page: number) => Promise<void>;
}

export const FILTRO_INICIAL_INCIDENTES: FiltroIncidentes = { page: 1, limit: 20, order: 'DESC' };

/** Historial de enfrentamientos (mismo patron que el store de criminales). */
export const useIncidentesStore = create<IncidentesState>()((set, get) => ({
  incidentes: [],
  meta: PAGINA_VACIA,
  cargando: false,
  error: null,
  consultadoEn: null,
  filtro: FILTRO_INICIAL_INCIDENTES,

  cargar: async (parcial = {}) => {
    const filtro = { ...get().filtro, ...parcial };
    set({ filtro, cargando: true });
    try {
      const pagina = await incidentesApi.listar(filtro);
      // Una respuesta vieja (el filtro cambio mientras viajaba) no pisa la nueva.
      if (get().filtro !== filtro) return;
      set({
        incidentes: pagina.data,
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
}));
