import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { Recompensa } from '../models/recompensa';
import { TablonRecompensas } from './TablonRecompensas';

const base: Recompensa = {
  id: 'r-1',
  criminalId: 'c-teach',
  criminalNombre: 'Marshall D. Teach',
  criminalFotoUrl: null,
  monto: 3_996_000_000,
  moneda: 'BERRY',
  estado: 'VIGENTE',
  requiereValidacion: true,
  solicitadaPor: 'u-1',
  fechaSolicitud: '2026-11-01T10:00:00Z',
  validadaPor: 'u-2',
  fechaValidacion: '2026-11-02T10:00:00Z',
  vigenteDesde: '2026-11-02T10:00:00Z',
  vigenteHasta: null,
  motivo: null,
};

function renderizar(recompensas: readonly Recompensa[], vacio: React.ReactNode = null): void {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TablonRecompensas
        recompensas={recompensas}
        cargando={false}
        error={null}
        onReintentar={() => undefined}
        vacio={vacio}
      />
    </MemoryRouter>,
  );
}

describe('TablonRecompensas', () => {
  it('cada recompensa es un cartel que lleva a la ficha', () => {
    renderizar([base]);

    expect(screen.getByRole('list', { name: 'Tablón de recompensas' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Marshall D. Teach' })).toHaveAttribute(
      'href',
      '/criminales/c-teach',
    );
    expect(screen.getByText('Vigente, validada')).toBeInTheDocument();
  });

  it('criminal borrado dice que no esta disponible', () => {
    renderizar([{ ...base, criminalNombre: null }]);

    expect(screen.getByText('Criminal no disponible')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('sin recompensas muestra el vacio recibido', () => {
    renderizar([], <p>nada</p>);

    expect(screen.getByText('nada')).toBeInTheDocument();
  });
});
