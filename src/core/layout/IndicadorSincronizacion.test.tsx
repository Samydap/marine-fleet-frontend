import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EVENTOS } from '../sync/eventos';
import { despachar, useSincronizacionStore } from '../sync/sincronizacion';
import { IndicadorSincronizacion } from './IndicadorSincronizacion';

afterEach(() => {
  useSincronizacionStore.setState({ estado: 'inactivo', ultimaSenal: null });
  vi.useRealTimers();
});

describe('IndicadorSincronizacion', () => {
  it('con el canal caído muestra el Den Den Mushi dormido y el texto Sin conexión', () => {
    useSincronizacionStore.setState({ estado: 'sin-conexion', ultimaSenal: null });
    const { container } = render(<IndicadorSincronizacion />);
    expect(screen.getByText('Sin conexión')).toBeInTheDocument();
    expect(container.querySelector('[data-estado="dormido"]')).not.toBeNull();
  });

  it('en vivo muestra el Den Den Mushi despierto', () => {
    useSincronizacionStore.setState({ estado: 'en-vivo', ultimaSenal: null });
    const { container } = render(<IndicadorSincronizacion />);
    expect(screen.getAllByText('En vivo').length).toBeGreaterThan(0);
    expect(container.querySelector('[data-estado="vivo"]')).not.toBeNull();
  });

  it('en sondeo conserva el texto y el caracol despierto', () => {
    useSincronizacionStore.setState({ estado: 'sondeo', ultimaSenal: null });
    const { container } = render(<IndicadorSincronizacion />);
    expect(screen.getByText('Actualiza cada 10 s')).toBeInTheDocument();
    expect(container.querySelector('[data-estado="vivo"]')).not.toBeNull();
  });

  it('al llegar un cambio llama unos 600 ms y vuelve a vivo', () => {
    vi.useFakeTimers();
    useSincronizacionStore.setState({ estado: 'en-vivo', ultimaSenal: null });
    const { container } = render(<IndicadorSincronizacion />);
    act(() => {
      despachar({
        id: 9_001,
        evento: EVENTOS.OPERATIVO_ACTUALIZADO,
        fecha: new Date().toISOString(),
        datos: {},
      });
    });
    expect(container.querySelector('[data-estado="llamando"]')).not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(650);
    });
    expect(container.querySelector('[data-estado="vivo"]')).not.toBeNull();
  });
});
