import { apiClient } from '../http/api-client';
import type { UsuarioSesion } from './permiso.enum';
import { useSessionStore } from './session.store';
import { tokenStore } from './token.store';

/** Espejo de LoginResponseDto (auth/presentation/dto/sesion.dto.ts). */
export interface RespuestaLogin {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly usuario: UsuarioSesion;
}

/**
 * Respuesta de POST /auth/login cuando la cuenta tiene segundo factor: no trae
 * tokens, solo el reto (vence en 5 minutos) que se canjea en POST /auth/mfa/verify.
 */
export interface RetoMfaLogin {
  readonly mfaRequerido: true;
  readonly challengeToken: string;
  readonly email: string;
}

export function esRetoLogin(valor: unknown): valor is RetoMfaLogin {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    typeof (valor as Partial<RetoMfaLogin>).challengeToken === 'string'
  );
}

/**
 * Llamadas de red de la sesion. Separado del store para que el interceptor de
 * errores pueda limpiar la sesion sin crear un ciclo de imports.
 *
 * La renovacion del access token (POST /auth/refresh) no vive aqui sino en
 * http/sesion.interceptor.ts: ocurre sola ante un 401, sin que nadie la llame.
 */
export const sessionService = {
  /**
   * POST /auth/login. Sin segundo factor abre la sesion y devuelve el usuario.
   * Con segundo factor no hay sesion todavia: devuelve el reto, que la pantalla
   * de MFA canjea (features/auth/data-access/mfa-api.ts).
   */
  async login(email: string, password: string): Promise<UsuarioSesion | RetoMfaLogin> {
    const respuesta = await apiClient.post<RespuestaLogin | RetoMfaLogin>('/auth/login', {
      email,
      password,
    });
    if (esRetoLogin(respuesta)) return respuesta;
    sessionService.iniciar(respuesta);
    return respuesta.usuario;
  },

  /** Guarda tokens y usuario. Lo usan el login y el paso de MFA. */
  iniciar(respuesta: RespuestaLogin): void {
    tokenStore.guardar(respuesta.accessToken, respuesta.refreshToken);
    useSessionStore.getState().setUsuario(respuesta.usuario);
  },

  /** GET /auth/me: rehidrata la sesion al recargar la pagina (hay token pero no estado). */
  async restaurarSesion(): Promise<UsuarioSesion> {
    const usuario = await apiClient.get<UsuarioSesion>('/auth/me');
    useSessionStore.getState().setUsuario(usuario);
    return usuario;
  },

  logout(): void {
    tokenStore.limpiar();
    useSessionStore.getState().limpiar();
  },

  hayToken(): boolean {
    return tokenStore.accessToken !== null || tokenStore.refreshToken !== null;
  },
};
