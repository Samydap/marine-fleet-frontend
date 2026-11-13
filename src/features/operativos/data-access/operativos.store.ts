import { create } from 'zustand';
import { PAGINA_VACIA, type PageMeta } from '@core/models/page-result';
import type { FiltroOperativos, Operativo } from '../models/operativo';
import { operativosApi } from './operativos-api';

/** Cuanto dura la marca de "cambio recibido" en una fila del tablero. */
export const DURACION_MARCA_MS = 6_000;

interface TableroState {
  operativos: Operativo[];
  meta: PageMeta;
  cargando: boolean;
  error: unknown;
  consultadoEn: string | null;
  filtro: FiltroOperativos;
  /** id -> instante (ms) en que llego un cambio de otra base. */
  recientes: Record<string, number>;
  cargar: (parcial?: Partial<FiltroOperativos>) => Promise<void>;
  irAPagina: (page: number) => Promise<void>;
  /** Recarga de fondo por un cambio sincronizado: sin barra de carga ni aviso. */
  refrescar: (operativoId?: string) => Promise<void>;
  olvidarRecientes: (ahora?: number) => void;
}

/** Tablero de despliegue: pagina actual, filtros y marcas de cambios en vivo. */
export const useTableroStore = create<TableroState>()((set, get) => ({
  operativos: [],
  meta: PAGINA_VACIA,
  cargando: false,
  error: null,
  consultadoEn: null,
  filtro: { page: 1, limit: 50, order: 'DESC' },
  recientes: {},

  cargar: async (parcial = {}) => {
    const filtro = { ...get().filtro, ...parcial };
    set({ filtro, cargando: true });
    try {
      const pagina = await operativosApi.listar(filtro);
      set({
        operativos: pagina.data,
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

  refrescar: async (operativoId) => {
    if (operativoId) {
      set((s) => ({ recientes: { ...s.recientes, [operativoId]: Date.now() } }));
    }
    try {
      const pagina = await operativosApi.listar(get().filtro, true);
      set({
        operativos: pagina.data,
        meta: pagina.meta,
        error: null,
        consultadoEn: new Date().toISOString(),
      });
    } catch {
      // Silencioso: la proxima senal del canal (o el sondeo) lo vuelve a intentar.
    }
  },

  olvidarRecientes: (ahora = Date.now()) =>
    set((s) => ({
      recientes: Object.fromEntries(
        Object.entries(s.recientes).filter(([, t]) => ahora - t < DURACION_MARCA_MS),
      ),
    })),
}));
