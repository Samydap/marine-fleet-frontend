import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PAGINA_VACIA } from '@core/models/page-result';
import { Permiso, RolCodigo } from '@core/session/permiso.enum';
import { useSessionStore } from '@core/session/session.store';
import { recompensasApi } from '../data-access/recompensas-api';
import type { Recompensa } from '../models/recompensa';
import { RecompensasPage } from './RecompensasPage';

const recompensa: Recompensa = {
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
  validadaPor: null,
  fechaValidacion: null,
  vigenteDesde: '2026-11-02T10:00:00Z',
  vigenteHasta: null,
  motivo: null,
};

describe('RecompensasPage', () => {
  beforeEach(() => {
    useSessionStore.setState({
      usuario: {
        id: 'u-almirante',
        email: 'almirante@marina.gov',
        nombreCompleto: 'Almirante de prueba',
        rol: RolCodigo.ALMIRANTE,
        permisos: [Permiso.TODO],
        baseNavalId: null,
      },
    });
    vi.spyOn(recompensasApi, 'listar').mockResolvedValue({
      data: [recompensa],
      meta: { ...PAGINA_VACIA, total: 1, totalPages: 1 },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    useSessionStore.setState({ usuario: null });
  });

  it('el selector cambia a tablon y se recuerda', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <RecompensasPage />
      </MemoryRouter>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Tablón' }));

    expect(await screen.findByRole('list', { name: 'Tablón de recompensas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tablón' })).toHaveAttribute('aria-pressed', 'true');
    expect(localStorage.getItem('marina.recompensas.vista')).toBe('tablon');
  });
});
