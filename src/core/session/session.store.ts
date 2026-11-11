import { create } from 'zustand';
import type { Permiso } from './permiso.enum';
import { tienePermiso, type UsuarioSesion } from './permiso.enum';

interface SessionState {
  usuario: UsuarioSesion | null;
  setUsuario: (usuario: UsuarioSesion | null) => void;
  limpiar: () => void;
}

/**
 * Estado de sesion. Es la unica fuente de verdad sobre quien esta autenticado y
 * que puede hacer; los guards, el sidebar y useHasPermission leen de aqui.
 *
 * NO importa el cliente HTTP a proposito: el interceptor de errores necesita
 * limpiar la sesion ante un 401 y, si este store llamara a la API, habria un
 * ciclo de imports. Las llamadas de red viven en session.service.ts.
 */
export const useSessionStore = create<SessionState>()((set) => ({
  usuario: null,
  setUsuario: (usuario) => set({ usuario }),
  limpiar: () => set({ usuario: null }),
}));

/** Hook: el usuario de la sesion actual. */
export const useUsuario = (): UsuarioSesion | null => useSessionStore((s) => s.usuario);

/** Hook: hay sesion activa. */
export const useEstaAutenticado = (): boolean => useSessionStore((s) => s.usuario !== null);

/** Lectura imperativa, para interceptores y servicios. */
export const usuarioActual = (): UsuarioSesion | null => useSessionStore.getState().usuario;

export function tienePermisoActual(requerido: Permiso): boolean {
  return tienePermiso(usuarioActual()?.permisos, requerido);
}

export function tieneAlgunPermisoActual(requeridos: readonly Permiso[]): boolean {
  return requeridos.some((permiso) => tienePermisoActual(permiso));
}
