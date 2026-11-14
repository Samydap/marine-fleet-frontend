import { ApiError, type ApiResponse } from '../models/api-response';
import type { UsuarioSesion } from '../session/permiso.enum';
import { useSessionStore } from '../session/session.store';
import { tokenStore } from '../session/token.store';
import { PREFIJO_API } from './api-url.interceptor';
import type { Interceptor, Peticion, Siguiente } from './types';

/** Rutas cuyo 401 significa "credenciales" y no "token vencido". */
const RUTAS_DE_ACCESO = ['/auth/login', '/auth/refresh', '/auth/mfa/verify'];

interface ParTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly usuario: UsuarioSesion;
}

/**
 * Renovacion en curso compartida: si cinco peticiones reciben 401 a la vez,
 * se hace UN solo POST /auth/refresh y las cinco esperan el mismo resultado.
 */
let renovacionEnCurso: Promise<boolean> | null = null;

async function renovar(siguiente: Siguiente): Promise<boolean> {
  const refreshToken = tokenStore.refreshToken;
  if (!refreshToken) return false;

  try {
    const respuesta = await siguiente({
      url: `${PREFIJO_API}/auth/refresh`,
      init: {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
        headers: { 'Content-Type': 'application/json' },
      },
      silencioso: true,
    });
    const sobre = (await respuesta.json()) as ApiResponse<ParTokens>;
    tokenStore.guardar(sobre.data.accessToken, sobre.data.refreshToken);
    // Los permisos pueden haber cambiado desde el login: se toman los vigentes.
    useSessionStore.getState().setUsuario(sobre.data.usuario);
    return true;
  } catch {
    return false;
  }
}

/** Renueva el access token (una sola vez aunque lo pidan varias peticiones). */
export function renovarSesion(siguiente: Siguiente): Promise<boolean> {
  renovacionEnCurso ??= renovar(siguiente).finally(() => {
    renovacionEnCurso = null;
  });
  return renovacionEnCurso;
}

function cerrarSesionLocal(): void {
  tokenStore.limpiar();
  useSessionStore.getState().limpiar();
}

function esRutaDeAcceso(peticion: Peticion): boolean {
  return RUTAS_DE_ACCESO.some((ruta) => peticion.url.includes(ruta));
}

/**
 * El access token vive 15 minutos (JWT_EXPIRES_IN del backend). Sin esto, un
 * oficial que deja la pestana abierta pierde lo que estaba escribiendo al
 * siguiente guardado.
 *
 * Ante un 401 de una ruta protegida: renueva con el refresh token y repite la
 * peticion UNA vez. Si no se puede renovar, cierra la sesion local y
 * RequireAuth lleva al login con la ruta actual como `redirectTo`.
 *
 * Va por fuera de authInterceptor para que el reintento salga con el token nuevo.
 */
export const sesionInterceptor: Interceptor = async (peticion, siguiente) => {
  try {
    return await siguiente(peticion);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || esRutaDeAcceso(peticion)) {
      throw error;
    }

    const renovada = await renovarSesion(siguiente);
    if (!renovada) {
      cerrarSesionLocal();
      throw error;
    }

    try {
      return await siguiente(peticion);
    } catch (reintento) {
      if (reintento instanceof ApiError && reintento.status === 401) cerrarSesionLocal();
      throw reintento;
    }
  }
};
