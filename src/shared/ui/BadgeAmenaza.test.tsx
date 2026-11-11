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
});
