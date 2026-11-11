import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Permiso, RolCodigo, type UsuarioSesion } from './permiso.enum';
import { sessionService } from './session.service';
import {
  tieneAlgunPermisoActual,
  tienePermisoActual,
  useSessionStore,
  usuarioActual,
} from './session.store';
import { tokenStore } from './token.store';

/**
 * PRUEBA DE REFERENCIA para un servicio que habla con la API: se sustituye
 * `fetch` global, de modo que no sale ninguna peticion de verdad.
 *
 * Tambien cubre la matriz de permisos, que es la parte del RBAC que el frontend
 * si decide (que se muestra). La autorizacion real la prueba el backend.
 */
const ALMIRANTE: UsuarioSesion = {
  id: 'u-sengoku',
  email: 'almirante@marina.gov',
  nombreCompleto: 'Sengoku',
  rol: RolCodigo.ALMIRANTE,
  permisos: [Permiso.TODO],
  baseNavalId: null,
};

const ANALISTA: UsuarioSesion = {
  id: 'u-analista',
  email: 'analista@marina.gov',
  nombreCompleto: 'Analista de Datos',
  rol: RolCodigo.ANALISTA_DATOS_CRIMINALES,
  permisos: [Permiso.CRIMINALES_LEER, Permiso.RECOMPENSAS_SOLICITAR],
  baseNavalId: 'b-16',
};

function respuestaLogin(usuario: UsuarioSesion): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data: { accessToken: 'token-a', refreshToken: 'token-r', usuario },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}

describe('sessionService', () => {
  beforeEach(() => {
    tokenStore.limpiar();
    useSessionStore.getState().limpiar();
  });

  it('arranca sin sesion', () => {
    expect(usuarioActual()).toBeNull();
    expect(sessionService.hayToken()).toBe(false);
  });

  it('guarda los tokens y el usuario al autenticarse', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respuestaLogin(ALMIRANTE));
    vi.stubGlobal('fetch', fetchMock);

    await sessionService.login('almirante@marina.gov', 'Marina.2026');

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0][0])).toContain('/api/v1/auth/login');
    expect(usuarioActual()?.rol).toBe(RolCodigo.ALMIRANTE);
    expect(tokenStore.accessToken).toBe('token-a');
  });

  it('el permiso ALL del Almirante concede cualquier permiso', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuestaLogin(ALMIRANTE)));
    await sessionService.login('almirante@marina.gov', 'Marina.2026');

    expect(tienePermisoActual(Permiso.RECOMPENSAS_VALIDAR)).toBe(true);
    expect(tienePermisoActual(Permiso.USUARIOS_ADMINISTRAR)).toBe(true);
  });

  it('un rol acotado no obtiene los permisos que no tiene', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuestaLogin(ANALISTA)));
    await sessionService.login('analista@marina.gov', 'Marina.2026');

    expect(tienePermisoActual(Permiso.CRIMINALES_LEER)).toBe(true);
    // Solicitar no es validar: esa es la regla de RF-1 que protege el Almirante.
    expect(tienePermisoActual(Permiso.RECOMPENSAS_VALIDAR)).toBe(false);
    expect(tieneAlgunPermisoActual([Permiso.RECOMPENSAS_VALIDAR, Permiso.CRIMINALES_LEER])).toBe(
      true,
    );
  });

  it('limpia la sesion y el token al salir', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuestaLogin(ALMIRANTE)));
    await sessionService.login('almirante@marina.gov', 'Marina.2026');

    sessionService.logout();

    expect(usuarioActual()).toBeNull();
    expect(tokenStore.accessToken).toBeNull();
  });
});
