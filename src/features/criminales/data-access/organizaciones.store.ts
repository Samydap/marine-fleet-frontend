import { create } from 'zustand';
import { PAGINA_VACIA, type PageMeta } from '@core/models/page-result';
import type { FiltroOrganizaciones, Organizacion } from '../models/criminal';
import { organizacionesApi } from './organizaciones-api';

interface OrganizacionesState {
  organizaciones: Organizacion[];
  meta: PageMeta;
  cargando: boolean;
  error: unknown;
  consultadoEn: string | null;
  filtro: FiltroOrganizaciones;
  cargar: (parcial?: Partial<FiltroOrganizaciones>) => Promise<void>;
}

/** Listado de tripulaciones, organizaciones y bandas (mismo patron que criminales.store). */
export const useOrganizacionesStore = create<OrganizacionesState>()((set, get) => ({
  organizaciones: [],
  meta: PAGINA_VACIA,
  cargando: false,
  error: null,
  consultadoEn: null,
  // Por defecto, las que siguen activas: las disueltas son consulta historica.
  filtro: { page: 1, limit: 20, activa: true },

  cargar: async (parcial = {}) => {
    const filtro = { ...get().filtro, ...parcial };
    set({ filtro, cargando: true });
    try {
      const pagina = await organizacionesApi.listar(filtro);
      set({
        organizaciones: pagina.data,
        meta: pagina.meta,
        cargando: false,
        error: null,
        consultadoEn: new Date().toISOString(),
      });
    } catch (error) {
      set({ cargando: false, error });
    }
  },
}));
