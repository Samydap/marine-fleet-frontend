import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAXIMO_AVISOS, useNotificationStore } from './notification.store';

function textos(): string[] {
  return useNotificationStore.getState().notificaciones.map((n) => n.mensaje);
}

describe('notification.store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useNotificationStore.setState({ notificaciones: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('no apila el mismo aviso repetido', () => {
    const { error } = useNotificationStore.getState();
    error('El servidor no pudo responder.');
    error('El servidor no pudo responder.');
    error('El servidor no pudo responder.');
    expect(textos()).toEqual(['El servidor no pudo responder.']);
  });

  it('el repetido reinicia su tiempo en pantalla', () => {
    const { error } = useNotificationStore.getState();
    error('Sin conexión');
    vi.advanceTimersByTime(6000);
    error('Sin conexión');
    vi.advanceTimersByTime(6000);
    expect(textos()).toEqual(['Sin conexión']);
    vi.advanceTimersByTime(2500);
    expect(textos()).toEqual([]);
  });

  it('el mismo texto con otro tipo es otro aviso', () => {
    const s = useNotificationStore.getState();
    s.info('Guardado');
    s.exito('Guardado');
    expect(textos()).toHaveLength(2);
  });

  it(`nunca muestra mas de ${MAXIMO_AVISOS}: retira el mas antiguo`, () => {
    const { error } = useNotificationStore.getState();
    ['a', 'b', 'c', 'd', 'e'].forEach((m) => error(m));
    expect(textos()).toEqual(['c', 'd', 'e']);
  });
});
