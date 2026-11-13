import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AccesoDenegado } from './AccesoDenegado';

function titulo(recurso?: string): string {
  render(
    <MemoryRouter>
      <AccesoDenegado recurso={recurso} />
    </MemoryRouter>,
  );
  return screen.getByRole('heading').textContent ?? '';
}

describe('AccesoDenegado', () => {
  it('contrae "a el" en "al"', () => {
    expect(titulo('el catálogo de mares, zonas y bases')).toBe(
      'Tu cargo no tiene acceso al catálogo de mares, zonas y bases',
    );
  });

  it('con "la" no contrae', () => {
    expect(titulo('la bitácora de auditoría')).toBe(
      'Tu cargo no tiene acceso a la bitácora de auditoría',
    );
  });
});
