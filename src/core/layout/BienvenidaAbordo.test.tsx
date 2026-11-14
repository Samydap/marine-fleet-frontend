import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BienvenidaAbordo } from './BienvenidaAbordo';
import { marcarBienvenida, tomarBienvenida } from './bienvenida';

describe('BienvenidaAbordo', () => {
  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
  });

  it('tomarBienvenida solo devuelve true una vez', () => {
    marcarBienvenida();

    expect(tomarBienvenida()).toBe(true);
    expect(tomarBienvenida()).toBe(false);
  });

  it('saluda con rango y nombre', () => {
    render(<BienvenidaAbordo nombre="Monkey D. Garp" rango="Vicealmirante" alTerminar={vi.fn()} />);

    expect(screen.getByText('Bienvenido a bordo')).toBeInTheDocument();
    expect(screen.getByText('Vicealmirante Monkey D. Garp')).toBeInTheDocument();
  });

  it('una tecla la cierra', () => {
    const alTerminar = vi.fn();
    render(<BienvenidaAbordo nombre="Garp" rango="Vicealmirante" alTerminar={alTerminar} />);

    fireEvent.keyDown(window, { key: 'Enter' });

    expect(alTerminar).toHaveBeenCalledTimes(1);
  });

  it('se cierra sola', () => {
    vi.useFakeTimers();
    const alTerminar = vi.fn();
    render(<BienvenidaAbordo nombre="Garp" rango="Vicealmirante" alTerminar={alTerminar} />);

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(alTerminar).toHaveBeenCalledTimes(1);
  });
});
