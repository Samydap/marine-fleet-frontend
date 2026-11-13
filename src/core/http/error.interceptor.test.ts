import { beforeEach, describe, expect, it } from 'vitest';
import { useNotificationStore } from '../services/notification.store';
import { errorInterceptor } from './error.interceptor';
import type { Peticion } from './types';

const responder = (status: number) => async (): Promise<Response> =>
  new Response(JSON.stringify({ error: { codigo: 'X', message: `Fallo ${status}` } }), {
    status,
  });

async function ejecutar(peticion: Partial<Peticion>, status: number): Promise<void> {
  await errorInterceptor({ url: '/x', init: {}, ...peticion }, responder(status)).catch(
    () => undefined,
  );
}

const avisos = (): number => useNotificationStore.getState().notificaciones.length;

describe('errorInterceptor', () => {
  beforeEach(() => useNotificationStore.setState({ notificaciones: [] }));

  it('avisa un error que la pantalla no muestra', async () => {
    await ejecutar({}, 500);
    expect(avisos()).toBe(1);
  });

  it('calla el aviso si la pantalla pinta el error en linea (sinAviso)', async () => {
    await ejecutar({ sinAviso: true }, 500);
    expect(avisos()).toBe(0);
  });

  it("con sinAviso 'conflicto' calla solo el 409", async () => {
    await ejecutar({ sinAviso: 'conflicto' }, 409);
    expect(avisos()).toBe(0);
    await ejecutar({ sinAviso: 'conflicto' }, 500);
    expect(avisos()).toBe(1);
  });
});
