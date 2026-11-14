import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type * as MotionReact from 'motion/react';
import { BarrasHorizontales, type BarraDato } from './BarrasHorizontales';

vi.mock('motion/react', async (importOriginal) => {
  const real = await importOriginal<typeof MotionReact>();
  return { ...real, useReducedMotion: () => true };
});

const dato = (clave: string, valor: number): BarraDato => ({
  clave,
  etiqueta: clave,
  nombre: clave,
  valor,
  textoValor: String(valor),
});

describe('BarrasHorizontales', () => {
  it('cada barra termina en su ancho proporcional', () => {
    const { container } = render(
      <BarrasHorizontales titulo="Prueba" datos={[dato('a', 100), dato('b', 50)]} />,
    );

    const barras = container.querySelectorAll<HTMLElement>('.barras-h-barra');
    expect(barras[0]?.style.width).toBe('100%');
    expect(barras[1]?.style.width).toBe('50%');
  });
});
