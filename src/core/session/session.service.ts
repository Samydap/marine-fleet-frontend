import { apiClient } from '../http/api-client';
import type { UsuarioSesion } from './permiso.enum';
import { useSessionStore } from './session.store';
import { tokenStore } from './token.store';

interface RespuestaLogin {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly usuario: UsuarioSesion;
}

/**
 * Llamadas de red de la sesion. Separado del store para que el interceptor de
 * errores pueda limpiar la sesion sin crear un ciclo de imports.
 */
export const sessionService = {
  async login(email: string, password: string): Promise<UsuarioSesion> {
    const respuesta = await apiClient.post<RespuestaLogin>('/auth/login', { email, password });
    tokenStore.guardar(respuesta.accessToken, respuesta.refreshToken);
    useSessionStore.getState().setUsuario(respuesta.usuario);
    return respuesta.usuario;
  },

  /** Rehidrata la sesion al recargar la pagina (hay token pero no hay estado). */
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
    return tokenStore.accessToken !== null;
  },
};
