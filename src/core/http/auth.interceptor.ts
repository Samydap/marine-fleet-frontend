import { tokenStore } from '../session/token.store';
import type { Interceptor } from './types';

const RUTAS_SIN_TOKEN = ['/auth/login', '/auth/refresh', '/reportes-ciudadanos'];

/** Agrega el Bearer token. Ninguna feature maneja headers de autenticacion. */
export const authInterceptor: Interceptor = (peticion, siguiente) => {
  const token = tokenStore.accessToken;

  if (!token || RUTAS_SIN_TOKEN.some((ruta) => peticion.url.includes(ruta))) {
    return siguiente(peticion);
  }

  const headers = new Headers(peticion.init.headers);
  headers.set('Authorization', `Bearer ${token}`);

  return siguiente({ ...peticion, init: { ...peticion.init, headers } });
};
