import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type * as MotionReact from 'motion/react';
import { formatearBerries } from '@shared/utils/berries';
import { MontoAnimado } from './MontoAnimado';

const reducir = vi.hoisted(() => ({ activo: false }));

vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof MotionReact>()),
  useReducedMotion: () => reducir.activo,
}));

describe('MontoAnimado', () => {
  it('expone el monto final a lectores de pantalla', () => {
    reducir.activo = false;
    render(<MontoAnimado valor={3_000_000_000} />);

    expect(screen.getByText(formatearBerries(3_000_000_000))).toHaveClass('sr-only');
  });

  it('sin monto muestra lo mismo que MontoBerries', () => {
    reducir.activo = false;
    const { container } = render(<MontoAnimado valor={null} />);

    expect(container.querySelector('.monto')).toHaveClass('monto--vacio');
    expect(container.querySelector('.monto')).toHaveTextContent(formatearBerries(null));
  });

  it('con reducir movimiento muestra el valor final', () => {
    reducir.activo = true;
    const { container } = render(<MontoAnimado valor={1_500_000_000} abreviado />);

    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent(
      formatearBerries(1_500_000_000, true),
    );
  });
});
