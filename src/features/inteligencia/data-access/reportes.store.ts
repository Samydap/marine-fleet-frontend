import { create } from 'zustand';
import { PAGINA_VACIA, type PageMeta } from '@core/models/page-result';
import type { FiltroReportes, ReporteCiudadano } from '../models/reporte';
import { inteligenciaApi } from './inteligencia-api';

interface ReportesState {
  reportes: ReporteCiudadano[];
  meta: PageMeta;
  cargando: boolean;
  error: unknown;
  consultadoEn: string | null;
  filtro: FiltroReportes;
  /** Reportes que esperan revision (contador de la pestaña); null si no se sabe. */
  pendientes: number | null;
  cargar: (parcial?: Partial<FiltroReportes>) => Promise<void>;
  irAPagina: (page: number) => Promise<void>;
  contarPendientes: () => Promise<void>;
}

/** La bandeja abre en lo que falta revisar, del mas antiguo al mas reciente. */
export const FILTRO_INICIAL_REPORTES: FiltroReportes = {
  page: 1,
  limit: 20,
  order: 'ASC',
  estado: 'PENDIENTE',
};

export const useReportesStore = create<ReportesState>()((set, get) => ({
  reportes: [],
  meta: PAGINA_VACIA,
  cargando: false,
  error: null,
  consultadoEn: null,
  filtro: FILTRO_INICIAL_REPORTES,
  pendientes: null,

  cargar: async (parcial = {}) => {
    const filtro = { ...get().filtro, ...parcial };
    set({ filtro, cargando: true });
    try {
      const pagina = await inteligenciaApi.listarReportes(filtro);
      if (get().filtro !== filtro) return;
      const esBandejaCompleta =
        filtro.estado === 'PENDIENTE' && !filtro.criminalId && !filtro.zonaInfluenciaId;
      set({
        reportes: pagina.data,
        meta: pagina.meta,
        cargando: false,
        error: null,
        consultadoEn: new Date().toISOString(),
        ...(esBandejaCompleta ? { pendientes: pagina.meta.total } : {}),
      });
    } catch (error) {
      if (get().filtro !== filtro) return;
      set({ cargando: false, error });
    }
  },

  irAPagina: (page) => get().cargar({ page }),

  contarPendientes: async () => {
    try {
      set({ pendientes: await inteligenciaApi.contarReportesPendientes() });
    } catch {
      // Es un contador de apoyo: si falla, la pestaña se muestra sin numero.
    }
  },
}));
