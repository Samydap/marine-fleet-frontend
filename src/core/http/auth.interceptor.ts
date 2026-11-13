import { tokenStore } from '../session/token.store';
import type { Interceptor } from './types';

/**
 * Rutas que nunca llevan el token: las de acceso, donde un token viejo no
 * aporta nada. Los endpoints publicos que ademas tienen variantes protegidas
 * (POST /reportes-ciudadanos es publico, GET /reportes-ciudadanos no) NO van
 * aqui: enviar el token a un endpoint publico es inofensivo, omitirlo en uno
 * protegido produce un 401 y cierra la sesion.
 */
const RUTAS_SIN_TOKEN = ['/auth/login', '/auth/refresh', '/auth/mfa/verify'];

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
