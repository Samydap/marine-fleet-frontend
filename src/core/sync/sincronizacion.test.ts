import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tokenStore } from '../session/token.store';
import { EVENTOS, type CambioSincronizado } from './eventos';
import {
  INTERVALO_SONDEO_MS,
  detenerSincronizacion,
  iniciarSincronizacion,
  suscribirCambios,
  useSincronizacionStore,
} from './sincronizacion';

function respuesta(ultimoId: number, cambios: CambioSincronizado[]): Response {
  return new Response(JSON.stringify({ success: true, data: { ultimoId, cambios } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

const cambio = (id: number, evento: CambioSincronizado['evento']): CambioSincronizado => ({
  id,
  evento,
  datos: { operativoId: `op-${id}` },
  fecha: new Date().toISOString(),
});

/**
 * jsdom no trae EventSource: el canal cae al sondeo de
 * GET /sincronizacion/cambios, que es el respaldo real para navegadores sin SSE.
 */
describe('canal de sincronizacion (modo sondeo)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    tokenStore.guardar('acceso', 'refresco');
  });

  afterEach(() => {
    detenerSincronizacion();
    vi.useRealTimers();
  });

  it('la primera consulta solo toma la marca; despues reparte los cambios nuevos', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(respuesta(40, [cambio(40, EVENTOS.OPERATIVO_ACTUALIZADO)]))
      .mockResolvedValueOnce(
        respuesta(42, [
          cambio(41, EVENTOS.OPERATIVO_ACTUALIZADO),
          cambio(42, EVENTOS.CRIMINAL_ACTUALIZADO),
        ]),
      );
    vi.stubGlobal('fetch', fetchMock);
    const operativos = vi.fn();
    const todos = vi.fn();
    const cancelar = suscribirCambios([EVENTOS.OPERATIVO_ACTUALIZADO], operativos);
    const cancelarTodos = suscribirCambios('*', todos);

    iniciarSincronizacion();
    await vi.advanceTimersByTimeAsync(0);
    expect(useSincronizacionStore.getState().estado).toBe('sondeo');
    expect(operativos).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(INTERVALO_SONDEO_MS);
    expect(String(fetchMock.mock.calls[1][0])).toContain('despuesDeId=40');
    expect(operativos).toHaveBeenCalledOnce();
    expect(operativos.mock.calls[0][0]).toMatchObject({ id: 41 });
    expect(todos).toHaveBeenCalledTimes(2);

    cancelar();
    cancelarTodos();
  });

  it('sin respuesta del servidor marca "sin conexion" y reintenta', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    iniciarSincronizacion();
    await vi.advanceTimersByTimeAsync(0);

    expect(useSincronizacionStore.getState().estado).toBe('sin-conexion');
  });

  it('al detenerse vuelve a inactivo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(1, [])));
    iniciarSincronizacion();
    await vi.advanceTimersByTimeAsync(0);

    detenerSincronizacion();

    expect(useSincronizacionStore.getState()).toMatchObject({
      estado: 'inactivo',
      ultimaSenal: null,
    });
  });
});
