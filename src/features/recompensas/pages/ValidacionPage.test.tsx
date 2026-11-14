import { useDirectorioStore } from '@core/directorio/directorio-criminales';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PAGINA_VACIA } from '@core/models/page-result';
import { Permiso, RolCodigo } from '@core/session/permiso.enum';
import { useSessionStore } from '@core/session/session.store';
import { recompensasApi } from '../data-access/recompensas-api';
import type { CriminalResumen, Recompensa } from '../models/recompensa';
import { ValidacionPage } from './ValidacionPage';

function pendiente(id: string, criminalId: string, solicitadaPor: string): Recompensa {
  return {
    id,
    criminalId,
    monto: 3_000_000_000,
    moneda: 'BERRY',
    estado: 'PENDIENTE_VALIDACION',
    requiereValidacion: true,
    solicitadaPor,
    fechaSolicitud: new Date().toISOString(),
    validadaPor: null,
    fechaValidacion: null,
    vigenteDesde: null,
    vigenteHasta: null,
    motivo: 'Ataque a una base naval',
  };
}

function criminal(id: string, nombre: string): CriminalResumen {
  return {
    id,
    nombre,
    alias: [],
    fotoUrl: null,
    estado: 'ACTIVO',
    nivelAmenaza: 'ALTO',
    recompensaVigenteMonto: 1_500_000_000,
    zonaInfluenciaId: null,
    organizacion: { organizacionNombre: 'Tripulación de prueba', categoria: 'PIRATA' },
  };
}

function renderizar(): void {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ValidacionPage />
    </MemoryRouter>,
  );
}

async function expedienteDe(nombre: string): Promise<HTMLElement> {
  const li = (await screen.findByText(nombre)).closest('li');
  if (!li) throw new Error(`Sin expediente para ${nombre}`);
  return li;
}

describe('ValidacionPage', () => {
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
    useDirectorioStore.setState({
      porId: {
        'c-1': criminal('c-1', 'Capitán de Prueba'),
        'c-2': criminal('c-2', 'Contramaestre de Prueba'),
      },
    });
    vi.spyOn(recompensasApi, 'pendientes').mockResolvedValue({
      data: [pendiente('r-1', 'c-1', 'u-capitan'), pendiente('r-2', 'c-2', 'u-almirante')],
      meta: { ...PAGINA_VACIA, total: 2, totalPages: 1 },
    });
  });

  afterEach(() => {
    useSessionStore.setState({ usuario: null });
  });

  it('ofrece validar con el boton de autoridad, salvo en la solicitud propia', async () => {
    renderizar();

    const ajena = await expedienteDe('Capitán de Prueba');
    const propia = await expedienteDe('Contramaestre de Prueba');

    expect(within(ajena).getByRole('button', { name: 'Validar recompensa' })).toHaveClass(
      'ui-boton--autoridad',
    );
    expect(
      within(propia).queryByRole('button', { name: 'Validar recompensa' }),
    ).not.toBeInTheDocument();
    expect(within(propia).getByText(/La solicitaste tú/)).toBeInTheDocument();
  });

  it('rechazar exige un motivo antes de llamar al backend', async () => {
    const validar = vi
      .spyOn(recompensasApi, 'validar')
      .mockResolvedValue(pendiente('r-1', 'c-1', 'u-capitan'));
    const u = userEvent.setup();
    renderizar();

    const fila = await expedienteDe('Capitán de Prueba');
    await u.click(within(fila).getByRole('button', { name: 'Rechazar' }));
    await u.click(await screen.findByRole('button', { name: 'Rechazar solicitud' }));

    expect(await screen.findByText(/Escribe por qué se rechaza/)).toBeInTheDocument();
    expect(validar).not.toHaveBeenCalled();

    await u.type(screen.getByLabelText(/Motivo del rechazo/), 'Monto desproporcionado');
    await u.click(screen.getByRole('button', { name: 'Rechazar solicitud' }));
    expect(validar).toHaveBeenCalledWith('r-1', {
      aprobar: false,
      motivo: 'Monto desproporcionado',
    });
  });
});
