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

/**
 * URL de un archivo servido por la API (foto de un criminal, cartel). El
 * backend las devuelve relativas (`/api/v1/archivos/fotos/...`); con
 * VITE_API_URL apuntando a otro origen hay que anteponerle la raiz.
 */
export function urlArchivo(ruta: string | null | undefined): string | null {
  if (!ruta) return null;
  if (/^(https?:|data:|blob:)/i.test(ruta)) return ruta;
  return `${RAIZ}${ruta.startsWith('/') ? ruta : `/${ruta}`}`;
}
