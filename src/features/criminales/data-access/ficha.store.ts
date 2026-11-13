import { create } from 'zustand';
import { PAGINA_VACIA, type PageMeta } from '@core/models/page-result';
import type { DatosCartel } from '@shared/utils/cartel';
import type {
  Antecedente,
  CartelVigenteResumen,
  CriminalDetalle,
  EntradaHistorial,
  EstadoCriminal,
} from '../models/criminal';
import { criminalesApi } from './criminales-api';

const POR_PAGINA_HISTORIAL = 20;

export type EstadoCartel = 'cargando' | 'listo' | 'error';

interface FichaState {
  id: string | null;
  criminal: CriminalDetalle | null;
  cargando: boolean;
  error: unknown;
  consultadoEn: string | null;
  antecedentes: Antecedente[];
  antecedentesError: unknown;
  historial: EntradaHistorial[];
  historialMeta: PageMeta;
  historialCargando: boolean;
  historialError: unknown;
  /** Version, motivo y fecha del cartel vigente. */
  cartel: CartelVigenteResumen | null;
  /** Lo impreso en el cartel vigente (la instantanea emitida); null si no hay. */
  instantaneaCartel: DatosCartel | null;
  /** Lectura del cartel: evita anunciar "sin cartel" mientras todavia carga. */
  cartelEstado: EstadoCartel;
  /** Abre la ficha de un criminal; `silencioso` para refrescos por sincronizacion. */
  abrir: (id: string, silencioso?: boolean) => Promise<void>;
  recargarCriminal: (silencioso?: boolean) => Promise<void>;
  recargarAntecedentes: () => Promise<void>;
  recargarHistorial: () => Promise<void>;
  masHistorial: () => Promise<void>;
  recargarCartel: () => Promise<void>;
  /** Baja o reactivacion. Lanza el ApiError (409 incluido) para que la pagina decida. */
  cambiarEstado: (estado: EstadoCriminal) => Promise<void>;
}

/**
 * Estado de la ficha de un criminal: datos, antecedentes, historial y cartel
 * vigente. Las cuatro cargas son independientes: si falla el historial, la
 * ficha se sigue viendo.
 */
export const useFichaStore = create<FichaState>()((set, get) => ({
  id: null,
  criminal: null,
  cargando: false,
  error: null,
  consultadoEn: null,
  antecedentes: [],
  antecedentesError: null,
  historial: [],
  historialMeta: PAGINA_VACIA,
  historialCargando: false,
  historialError: null,
  cartel: null,
  instantaneaCartel: null,
  cartelEstado: 'cargando',

  abrir: async (id, silencioso = false) => {
    if (get().id !== id) {
      set({
        id,
        criminal: null,
        error: null,
        antecedentes: [],
        antecedentesError: null,
        historial: [],
        historialMeta: PAGINA_VACIA,
        historialError: null,
        cartel: null,
        instantaneaCartel: null,
        cartelEstado: 'cargando',
      });
    }
    await Promise.all([
      get().recargarCriminal(silencioso),
      get().recargarAntecedentes(),
      get().recargarHistorial(),
      get().recargarCartel(),
    ]);
  },

  recargarCriminal: async (silencioso = false) => {
    const id = get().id;
    if (!id) return;
    set({ cargando: true });
    try {
      const criminal = await criminalesApi.obtener(id, silencioso);
      if (get().id !== id) return;
      set({ criminal, cargando: false, error: null, consultadoEn: new Date().toISOString() });
    } catch (error) {
      if (get().id === id) set({ cargando: false, error });
    }
  },

  recargarAntecedentes: async () => {
    const id = get().id;
    if (!id) return;
    try {
      const antecedentes = await criminalesApi.antecedentes(id, true);
      if (get().id === id) set({ antecedentes, antecedentesError: null });
    } catch (error) {
      if (get().id === id) set({ antecedentesError: error });
    }
  },

  recargarHistorial: async () => {
    const id = get().id;
    if (!id) return;
    set({ historialCargando: true });
    try {
      const pagina = await criminalesApi.historial(id, 1, POR_PAGINA_HISTORIAL, true);
      if (get().id !== id) return;
      set({
        historial: pagina.data,
        historialMeta: pagina.meta,
        historialCargando: false,
        historialError: null,
      });
    } catch (error) {
      if (get().id === id) set({ historialCargando: false, historialError: error });
    }
  },

  masHistorial: async () => {
    const { id, historialMeta, historial } = get();
    if (!id || !historialMeta.hasNext) return;
    set({ historialCargando: true });
    try {
      const pagina = await criminalesApi.historial(
        id,
        historialMeta.page + 1,
        POR_PAGINA_HISTORIAL,
      );
      if (get().id !== id) return;
      // Sin duplicados si entre paginas entro un cambio nuevo y desplazo filas.
      const vistos = new Set(historial.map((h) => h.id));
      set({
        historial: [...historial, ...pagina.data.filter((h) => !vistos.has(h.id))],
        historialMeta: pagina.meta,
        historialCargando: false,
      });
    } catch {
      set({ historialCargando: false });
    }
  },

  recargarCartel: async () => {
    const id = get().id;
    if (!id) return;
    // Un refresco con el cartel ya a la vista no vuelve a "cargando": no hay parpadeo.
    if (get().cartelEstado !== 'listo') set({ cartelEstado: 'cargando' });
    try {
      const vigente = await criminalesApi.cartelVigente(id);
      if (get().id !== id) return;
      set({
        cartel: vigente?.resumen ?? null,
        instantaneaCartel: vigente?.instantanea ?? null,
        cartelEstado: 'listo',
      });
    } catch {
      // Sin cartel legible: la ficha avisa que no se pudo leer (o mantiene el
      // ultimo cartel ya leido, si fue un refresco por sincronizacion).
      if (get().id === id) set({ cartelEstado: 'error' });
    }
  },

  cambiarEstado: async (estado) => {
    const criminal = get().criminal;
    if (!criminal) return;
    await criminalesApi.cambiarEstado(criminal.id, estado, criminal.version);
    await Promise.all([get().recargarCriminal(), get().recargarHistorial()]);
  },
}));
