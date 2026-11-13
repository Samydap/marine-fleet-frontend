import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SiluetaMarineford } from './SiluetaMarineford';

describe('SiluetaMarineford', () => {
  it('es decorativa: oculta para lectores de pantalla y fuera del foco', () => {
    const { container } = render(<SiluetaMarineford className="acceso-silueta" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveClass('marineford', 'acceso-silueta');
  });

  it('lleva el 正義 en la fachada y un degradado con id propio por instancia', () => {
    const { container } = render(
      <>
        <SiluetaMarineford />
        <SiluetaMarineford />
      </>,
    );
    expect(container.querySelector('.marineford-kanji')).toHaveTextContent('正義');
    const ids = Array.from(container.querySelectorAll('linearGradient')).map((g) => g.id);
    expect(new Set(ids).size).toBe(2);
  });
});
