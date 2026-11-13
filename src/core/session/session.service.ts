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
 * Llamadas de red de la sesion. Separado del store para que el interceptor de
 * errores pueda limpiar la sesion sin crear un ciclo de imports.
 *
 * La renovacion del access token (POST /auth/refresh) no vive aqui sino en
 * http/sesion.interceptor.ts: ocurre sola ante un 401, sin que nadie la llame.
 */
export const sessionService = {
  /**
   * POST /auth/login. Hoy el backend responde siempre con los tokens: el reto
   * del segundo factor (challengeToken) todavia no existe en el contrato. Ver
   * features/auth/data-access/mfa-api.ts.
   */
  async login(email: string, password: string): Promise<UsuarioSesion> {
    const respuesta = await apiClient.post<RespuestaLogin>('/auth/login', { email, password });
    sessionService.iniciar(respuesta);
    return respuesta.usuario;
  },

  /** Guarda tokens y usuario. Lo usan el login y, cuando exista, el paso de MFA. */
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
