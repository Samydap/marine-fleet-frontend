import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarcaPrioridad } from './MarcaPrioridad';

describe('MarcaPrioridad', () => {
  it('nombra la prioridad con texto, no solo con galones', () => {
    render(<MarcaPrioridad prioridad="ALTA" />);
    expect(screen.getByText('Alta')).toBeInTheDocument();
  });

  it('llena tantos galones como el nivel (critica = 4 de 4)', () => {
    const { container } = render(<MarcaPrioridad prioridad="CRITICA" />);
    expect(container.querySelectorAll('.prioridad-galon')).toHaveLength(4);
    expect(container.querySelectorAll('.prioridad-galon--vacio')).toHaveLength(0);
    expect(container.firstChild).toHaveClass('prioridad--critica');
  });

  it('con solo la marca, deja la etiqueta para el lector', () => {
    const { container } = render(<MarcaPrioridad prioridad="BAJA" soloMarca />);
    expect(screen.getByText('Prioridad baja')).toHaveClass('sr-only');
    expect(container.querySelectorAll('.prioridad-galon--vacio')).toHaveLength(3);
  });
});
