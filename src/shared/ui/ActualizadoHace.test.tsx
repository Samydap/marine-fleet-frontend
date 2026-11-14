import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActualizadoHace } from './ActualizadoHace';

describe('ActualizadoHace', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-12T15:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('dice cuanto hace con la fecha exacta en <time>', () => {
    render(<ActualizadoHace fecha="2026-11-12T14:57:00" />);
    const hora = screen.getByText('hace 3 min');
    expect(hora.tagName).toBe('TIME');
    expect(hora).toHaveAttribute('dateTime', new Date('2026-11-12T14:57:00').toISOString());
    expect(screen.getByText(/Actualizado/)).toBeInTheDocument();
  });

  it('se refresca solo con el reloj compartido', () => {
    render(<ActualizadoHace fecha="2026-11-12T14:59:55" />);
    expect(screen.getByText('hace un momento')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText('hace 1 min')).toBeInTheDocument();
  });

  it('marca el dato viejo pasado el umbral y nombra al autor', () => {
    const { container } = render(
      <ActualizadoHace fecha="2026-11-12T14:00:00" umbralViejo={300} autor="Capitán Smoker" />,
    );
    expect(container.firstChild).toHaveClass('actualizado--viejo');
    expect(screen.getByText(/por Capitán Smoker/)).toBeInTheDocument();
  });
});
