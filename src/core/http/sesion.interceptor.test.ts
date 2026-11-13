import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../models/api-response';
import { Permiso, RolCodigo, type UsuarioSesion } from '../session/permiso.enum';
import { useSessionStore } from '../session/session.store';
import { tokenStore } from '../session/token.store';
import { apiClient, nombreDesdeDisposicion } from './api-client';

const USUARIO: UsuarioSesion = {
  id: 'u-coordinador',
  email: 'coordinador_operaciones@marina.gov',
  nombreCompleto: 'Coordinador de Operaciones',
  rol: RolCodigo.COORDINADOR_OPERACIONES,
  permisos: [Permiso.OPERATIVOS_LEER],
  baseNavalId: 'b-loguetown',
};

function json(status: number, cuerpo: unknown): Response {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const NO_AUTENTICADO = {
  success: false,
  error: { codigo: 'NO_AUTENTICADO', message: 'Token vencido.', status: 401 },
};

function url(llamada: unknown[]): string {
  return String(llamada[0]);
}

function cabeceraAuth(llamada: unknown[]): string | null {
  const init = llamada[1] as RequestInit;
  return new Headers(init.headers).get('Authorization');
}

describe('sesionInterceptor (renovacion del access token)', () => {
  beforeEach(() => {
    tokenStore.guardar('acceso-viejo', 'refresco-1');
    useSessionStore.getState().setUsuario(USUARIO);
  });

  it('ante un 401 renueva con /auth/refresh y repite la peticion con el token nuevo', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json(401, NO_AUTENTICADO))
      .mockResolvedValueOnce(
        json(200, {
          success: true,
          data: { accessToken: 'acceso-nuevo', refreshToken: 'refresco-2', usuario: USUARIO },
        }),
      )
      .mockResolvedValueOnce(json(200, { success: true, data: [{ id: 'op-1' }] }));
    vi.stubGlobal('fetch', fetchMock);

    const datos = await apiClient.get<{ id: string }[]>('/operativos');

    expect(datos).toEqual([{ id: 'op-1' }]);
    expect(url(fetchMock.mock.calls[1])).toContain('/api/v1/auth/refresh');
    expect(JSON.parse(String((fetchMock.mock.calls[1][1] as RequestInit).body))).toEqual({
      refreshToken: 'refresco-1',
    });
    expect(cabeceraAuth(fetchMock.mock.calls[2])).toBe('Bearer acceso-nuevo');
    expect(tokenStore.refreshToken).toBe('refresco-2');
  });

  it('si la renovacion falla, cierra la sesion local y propaga el 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(json(401, NO_AUTENTICADO))
        .mockResolvedValueOnce(json(401, NO_AUTENTICADO)),
    );

    await expect(apiClient.get('/operativos')).rejects.toBeInstanceOf(ApiError);
    expect(useSessionStore.getState().usuario).toBeNull();
    expect(tokenStore.accessToken).toBeNull();
  });

  it('un 401 del login es "credenciales", no "token vencido": no intenta renovar', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      json(401, {
        success: false,
        error: { codigo: 'CREDENCIALES_INVALIDAS', message: 'x', status: 401 },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient.post('/auth/login', {})).rejects.toMatchObject({
      codigo: 'CREDENCIALES_INVALIDAS',
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('varias peticiones con 401 a la vez comparten una sola renovacion', async () => {
    let renovaciones = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn((destino: string, init: RequestInit) => {
        if (destino.includes('/auth/refresh')) {
          renovaciones += 1;
          return Promise.resolve(
            json(200, {
              success: true,
              data: { accessToken: 'acceso-nuevo', refreshToken: 'refresco-2', usuario: USUARIO },
            }),
          );
        }
        const auth = new Headers(init.headers).get('Authorization');
        return Promise.resolve(
          auth === 'Bearer acceso-nuevo'
            ? json(200, { success: true, data: 'ok' })
            : json(401, NO_AUTENTICADO),
        );
      }),
    );

    const resultados = await Promise.all([
      apiClient.get('/operativos'),
      apiClient.get('/incidentes'),
      apiClient.get('/criminales'),
    ]);

    expect(resultados).toEqual(['ok', 'ok', 'ok']);
    expect(renovaciones).toBe(1);
  });
});

describe('apiClient.descargar', () => {
  it('devuelve el blob y el nombre de Content-Disposition', async () => {
    tokenStore.guardar('acceso', 'refresco');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('a;b', {
          status: 200,
          headers: { 'Content-Disposition': 'attachment; filename="tendencias-2026-11.csv"' },
        }),
      ),
    );

    const archivo = await apiClient.descargar('/reportes/tendencias/exportar', { formato: 'csv' });

    expect(archivo.nombre).toBe('tendencias-2026-11.csv');
    expect(archivo.blob.size).toBe(3);
  });

  it('nombreDesdeDisposicion usa el nombre por defecto si no hay cabecera', () => {
    expect(nombreDesdeDisposicion(null, 'cartel.pdf')).toBe('cartel.pdf');
    expect(nombreDesdeDisposicion("attachment; filename*=UTF-8''cart%C3%A9l.pdf", 'x')).toBe(
      'cartél.pdf',
    );
  });
});
