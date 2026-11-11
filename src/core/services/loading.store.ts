import { create } from 'zustand';

interface LoadingState {
  enVuelo: number;
  iniciar: () => void;
  terminar: () => void;
}

/**
 * Indicador global de carga: cuenta peticiones en vuelo.
 * Lo alimenta el interceptor withLoading, no las features.
 */
export const useLoadingStore = create<LoadingState>()((set) => ({
  enVuelo: 0,
  iniciar: () => set((s) => ({ enVuelo: s.enVuelo + 1 })),
  terminar: () => set((s) => ({ enVuelo: Math.max(0, s.enVuelo - 1) })),
}));

export const estaCargando = (): boolean => useLoadingStore.getState().enVuelo > 0;
