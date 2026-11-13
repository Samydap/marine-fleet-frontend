import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TextoRecortado } from './TextoRecortado';

describe('TextoRecortado', () => {
  it('deja el texto entero en el title', () => {
    const correo = 'vicealmirante.con.un.correo.larguisimo@cuartel-general.marina.gov';
    render(<TextoRecortado como="small" texto={correo} />);
    const nodo = screen.getByText(correo);
    expect(nodo.tagName).toBe('SMALL');
    expect(nodo).toHaveAttribute('title', correo);
    expect(nodo).toHaveClass('ui-recortado');
  });

  it('con varias lineas usa el recorte por lineas', () => {
    render(<TextoRecortado texto="Relato largo" lineas={2} />);
    const nodo = screen.getByText('Relato largo');
    expect(nodo).toHaveClass('ui-recortado--lineas');
    expect(nodo.style.getPropertyValue('--recortado-lineas')).toBe('2');
  });
});
