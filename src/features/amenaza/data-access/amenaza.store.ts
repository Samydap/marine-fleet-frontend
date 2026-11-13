import { create } from 'zustand';
import type {
  AgrupacionTendencia,
  CriterioAmenaza,
  DistribucionAmenaza,
  Estadisticas,
  Tendencias,
} from '../models/amenaza';
import { amenazaApi } from './amenaza-api';

/** Estado de una lectura: los datos anteriores se conservan mientras se recarga. */
export interface Consulta<T> {
  readonly datos: T | null;
  readonly cargando: boolean;
  readonly error: unknown;
  readonly consultadoEn: string | null;
}

const VACIA = { datos: null, cargando: false, error: null, consultadoEn: null } as const;

interface AmenazaState {
  soloActivos: boolean;
  distribucion: Consulta<DistribucionAmenaza>;
  estadisticas: Consulta<Estadisticas>;
  agrupacion: AgrupacionTendencia;
  tendencias: Consulta<Tendencias>;
  criterios: Consulta<CriterioAmenaza[]>;
  historial: Consulta<CriterioAmenaza[]>;

  cargarDistribucion: (soloActivos?: boolean) => Promise<void>;
  cargarEstadisticas: () => Promise<void>;
  cargarTendencias: (agrupacion?: AgrupacionTendencia) => Promise<void>;
  cargarCriterios: () => Promise<void>;
}

type ClaveConsulta = 'distribucion' | 'estadisticas' | 'tendencias' | 'criterios' | 'historial';

export const useAmenazaStore = create<AmenazaState>()((set, get) => {
  /** Ejecuta una lectura y deja el resultado en su clave, sin vaciar lo anterior. */
  async function leer<K extends ClaveConsulta>(
    clave: K,
    pedir: () => Promise<NonNullable<AmenazaState[K]['datos']>>,
  ): Promise<void> {
    set((s) => ({ [clave]: { ...s[clave], cargando: true } }) as Partial<AmenazaState>);
    try {
      const datos = await pedir();
      set({
        [clave]: { datos, cargando: false, error: null, consultadoEn: new Date().toISOString() },
      } as Partial<AmenazaState>);
    } catch (error) {
      set((s) => ({ [clave]: { ...s[clave], cargando: false, error } }) as Partial<AmenazaState>);
    }
  }

  return {
    soloActivos: true,
    distribucion: VACIA,
    estadisticas: VACIA,
    agrupacion: 'zona',
    tendencias: VACIA,
    criterios: VACIA,
    historial: VACIA,

    cargarDistribucion: (soloActivos) => {
      const valor = soloActivos ?? get().soloActivos;
      set({ soloActivos: valor });
      return leer('distribucion', () => amenazaApi.distribucion(valor));
    },

    cargarEstadisticas: () => leer('estadisticas', () => amenazaApi.estadisticas()),

    cargarTendencias: async (agrupacion) => {
      const valor = agrupacion ?? get().agrupacion;
      if (valor !== get().agrupacion) {
        // Otra agrupacion es otra tabla: no se mezclan filas de zona con filas de nivel.
        set({ agrupacion: valor, tendencias: VACIA });
      }
      set((s) => ({ tendencias: { ...s.tendencias, cargando: true } }));
      try {
        const datos = await amenazaApi.tendencias(valor);
        // Si mientras tanto se eligio otra agrupacion, esta respuesta ya no aplica.
        if (get().agrupacion !== valor) return;
        set({
          tendencias: {
            datos,
            cargando: false,
            error: null,
            consultadoEn: new Date().toISOString(),
          },
        });
      } catch (error) {
        if (get().agrupacion !== valor) return;
        set((s) => ({ tendencias: { ...s.tendencias, cargando: false, error } }));
      }
    },

    cargarCriterios: async () => {
      await Promise.all([
        leer('criterios', () => amenazaApi.criterios()),
        leer('historial', () => amenazaApi.historialCriterios()),
      ]);
    },
  };
});
