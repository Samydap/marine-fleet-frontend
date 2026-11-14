import { render } from '@testing-library/react';
import { EmblemaGaviota } from './emblemas/EmblemaGaviota';
import { LienzoMarina } from './LienzoMarina';

describe('EmblemaGaviota', () => {
  it('es decorativo y por defecto dibuja la silueta', () => {
    const { container } = render(<EmblemaGaviota />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveAttribute('data-variante', 'silueta');
    expect(svg).toHaveAttribute('width', '40');
  });

  it('respeta el tamano, la variante de linea y la clase', () => {
    const { container } = render(
      <EmblemaGaviota tamano={96} variante="linea" className="marca-sello" />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '96');
    expect(svg).toHaveAttribute('data-variante', 'linea');
    expect(svg).toHaveClass('emblema-gaviota', 'marca-sello');
  });
});

describe('LienzoMarina', () => {
  it('monta la carta, la trama y la marca de agua ocultas para lectores de pantalla', () => {
    const { container } = render(<LienzoMarina />);
    const lienzo = container.firstElementChild;
    expect(lienzo).toHaveClass('lienzo');
    expect(lienzo).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.lienzo-carta')).toHaveAttribute('focusable', 'false');
    expect(container.querySelector('.lienzo-trama')).toBeInTheDocument();
    expect(container.querySelector('.lienzo-gaviota')).toBeInTheDocument();
    // Nada enfocable ni legible dentro del fondo.
    expect(container.querySelectorAll('a, button, [tabindex]')).toHaveLength(0);
    expect(lienzo?.textContent).toBe('');
  });
});
