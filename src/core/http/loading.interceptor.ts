import { useLoadingStore } from '../services/loading.store';
import type { Interceptor } from './types';

/** Indicador global de carga: cuenta peticiones en vuelo. */
export const loadingInterceptor: Interceptor = async (peticion, siguiente) => {
  if (peticion.silencioso) return siguiente(peticion);
  useLoadingStore.getState().iniciar();
  try {
    return await siguiente(peticion);
  } finally {
    useLoadingStore.getState().terminar();
  }
};
