import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BadgeAmenaza } from './BadgeAmenaza';

/** PRUEBA DE REFERENCIA para un componente: render + consulta por texto. */
describe('BadgeAmenaza', () => {
  it('muestra la etiqueta del nivel', () => {
    render(<BadgeAmenaza nivel="ALTO" />);
    expect(screen.getByText('Alto')).toBeInTheDocument();
  });

  it('aplica la clase del nivel para que el color lo ponga el CSS', () => {
    render(<BadgeAmenaza nivel="BAJO" />);
    expect(screen.getByText('Bajo')).toHaveClass('badge-amenaza--bajo');
  });

  it('trata la ausencia de nivel como pendiente', () => {
    render(<BadgeAmenaza nivel={null} />);
    expect(screen.getByText('Sin clasificar')).toHaveClass('badge-amenaza--pendiente');
  });

  it('no depende solo del color: lleva texto y una marca de barras por nivel', () => {
    const { container } = render(<BadgeAmenaza nivel="MEDIO" />);
    const barras = container.querySelectorAll('rect');
    expect(barras).toHaveLength(3);
    const llenas = Array.from(barras).filter((r) => r.getAttribute('fill') === 'currentColor');
    expect(llenas).toHaveLength(2);
    expect(screen.getByTitle('Nivel de amenaza: Medio')).toBeInTheDocument();
  });

  it('puede nombrar el concepto fuera de una columna titulada', () => {
    render(<BadgeAmenaza nivel="ALTO" conPrefijo />);
    expect(screen.getByText('Amenaza alta')).toBeInTheDocument();
  });

  it('con prefijo concuerda en femenino en todos los niveles', () => {
    const { rerender } = render(<BadgeAmenaza nivel="MEDIO" conPrefijo />);
    expect(screen.getByText('Amenaza media')).toBeInTheDocument();
    rerender(<BadgeAmenaza nivel="BAJO" conPrefijo />);
    expect(screen.getByText('Amenaza baja')).toBeInTheDocument();
    rerender(<BadgeAmenaza nivel={null} conPrefijo />);
    expect(screen.getByText('Amenaza sin clasificar')).toBeInTheDocument();
  });
});
