import type { Interceptor } from './types';

/**
 * Prefija la URL base de la API en las rutas relativas.
 *
 * En desarrollo VITE_API_URL va vacia: la peticion sale a /api/v1/... del mismo
 * origen y el proxy de Vite la reenvia al backend, asi que no hay CORS.
 *
 * Gracias a esto los servicios de feature escriben '/criminales' y nunca
 * `${API_URL}/api/v1/criminales`: la URL base vive en un solo archivo.
 */
const RAIZ = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
export const PREFIJO_API = `${RAIZ}/api/v1`;

export const apiUrlInterceptor: Interceptor = (peticion, siguiente) => {
  const esAbsoluta = /^https?:\/\//i.test(peticion.url);
  if (esAbsoluta || peticion.url.startsWith(PREFIJO_API)) {
    return siguiente(peticion);
  }

  const ruta = peticion.url.startsWith('/') ? peticion.url : `/${peticion.url}`;
  return siguiente({ ...peticion, url: `${PREFIJO_API}${ruta}` });
};
