import { rutaInicio } from '@core/session/navegacion';
import type { UsuarioSesion } from '@core/session/permiso.enum';

/**
 * A donde ir tras entrar: la ruta protegida que el usuario intentaba abrir o,
 * si no hay, la pantalla de llegada de su cargo (core/session/navegacion.ts).
 *
 * Solo se vuelve a rutas internas de la aplicacion: un `redirectTo` externo
 * (`//otro-sitio`) o de vuelta al propio acceso se ignora.
 */
export function destinoTrasLogin(estado: unknown, usuario: UsuarioSesion): string {
  const destino = (estado as { redirectTo?: unknown } | null)?.redirectTo;
  if (
    typeof destino === 'string' &&
    destino.startsWith('/') &&
    !destino.startsWith('//') &&
    !destino.startsWith('/auth')
  ) {
    return destino;
  }
  return rutaInicio(usuario);
}

/** La ruta interna pendiente que traia el login, para pasarla al paso de MFA. */
export function rutaPendiente(estado: unknown): string | undefined {
  const destino = (estado as { redirectTo?: unknown } | null)?.redirectTo;
  return typeof destino === 'string' ? destino : undefined;
}
