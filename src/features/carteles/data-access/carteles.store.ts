import { create } from 'zustand';
import { PAGINA_VACIA, type PageMeta } from '@core/models/page-result';
import type { CriminalEnCartel, FiltroGaleria } from '../models/cartel';
import { cartelesApi } from './carteles-api';

interface GaleriaState {
  criminales: CriminalEnCartel[];
  meta: PageMeta;
  cargando: boolean;
  error: unknown;
  consultadoEn: string | null;
  filtro: FiltroGaleria;
  cargar: (parcial?: Partial<FiltroGaleria>, silencioso?: boolean) => Promise<void>;
}

/**
 * Galeria de carteles. Por defecto, los que siguen en busqueda: es el tablon
 * de una base naval. 24 por pagina para que la reticula cierre en 2, 3, 4 o 6
 * columnas.
 */
export const useGaleriaStore = create<GaleriaState>()((set, get) => ({
  criminales: [],
  meta: PAGINA_VACIA,
  cargando: false,
  error: null,
  consultadoEn: null,
  filtro: { page: 1, limit: 24, estado: 'ACTIVO', order: 'DESC' },

  cargar: async (parcial = {}, silencioso = false) => {
    const filtro = { ...get().filtro, ...parcial };
    set({ filtro, cargando: true });
    try {
      const pagina = await cartelesApi.criminales(filtro, silencioso);
      set({
        criminales: pagina.data,
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
