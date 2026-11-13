import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCatalogosStore } from '@core/catalogos/catalogos';
import { ApiError } from '@core/models/api-response';
import { organizacionesApi } from '../data-access/organizaciones-api';
import { criminalesApi } from '../data-access/criminales-api';
import type { CriminalDetalle } from '../models/criminal';
import { CriminalFormPage } from './CriminalFormPage';

const CREADO = { id: 'c-77', nombre: 'Trafalgar D. Water Law' } as CriminalDetalle;

function renderizar(ruta = '/criminales/nuevo'): void {
  render(
    <MemoryRouter
      initialEntries={[ruta]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/criminales/nuevo" element={<CriminalFormPage />} />
        <Route path="/criminales/:id/editar" element={<CriminalFormPage />} />
        <Route path="/criminales/:id" element={<p>Ficha abierta</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CriminalFormPage', () => {
  beforeEach(() => {
    useCatalogosStore.setState({ mares: [], zonas: [], bases: [], estado: 'listo' });
    vi.spyOn(organizacionesApi, 'listar').mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 100, total: 0, totalPages: 0, hasNext: false },
    });
  });

  it('no envia sin nombre y pone el foco en el campo a corregir', async () => {
    const crear = vi.spyOn(criminalesApi, 'crear');
    renderizar();
    await userEvent.click(screen.getByRole('button', { name: 'Registrar criminal' }));

    const nombre = screen.getByLabelText(/Nombre completo/);
    expect(screen.getByText('Escribe el nombre del criminal.')).toBeInTheDocument();
    expect(nombre).toHaveAttribute('aria-invalid', 'true');
    await waitFor(() => expect(nombre).toHaveFocus());
    expect(crear).not.toHaveBeenCalled();
  });

  it('registra con alias y edad, y abre la ficha', async () => {
    const crear = vi.spyOn(criminalesApi, 'crear').mockResolvedValue(CREADO);
    renderizar();
    const u = userEvent.setup();

    await u.type(screen.getByLabelText(/Nombre completo/), 'Trafalgar D. Water Law');
    await u.type(screen.getByLabelText('Alias'), 'Cirujano de la Muerte{Enter}');
    await u.type(screen.getByLabelText('Edad'), '26');
    await u.click(screen.getByRole('button', { name: 'Registrar criminal' }));

    expect(crear).toHaveBeenCalledWith({
      nombre: 'Trafalgar D. Water Law',
      alias: ['Cirujano de la Muerte'],
      edad: 26,
    });
    expect(await screen.findByText('Ficha abierta')).toBeInTheDocument();
  });

  it('ante un 409 al editar explica el conflicto y no navega', async () => {
    const original = {
      ...CREADO,
      alias: [],
      edad: null,
      descripcionFisica: null,
      zonaInfluenciaId: null,
      fotoUrl: null,
      version: 4,
      afiliaciones: [],
    } as unknown as CriminalDetalle;
    vi.spyOn(criminalesApi, 'obtener').mockResolvedValue(original);
    const actualizar = vi
      .spyOn(criminalesApi, 'actualizar')
      .mockRejectedValue(new ApiError(409, 'CONFLICTO', 'Conflicto'));
    renderizar('/criminales/c-77/editar');
    const u = userEvent.setup();

    const edad = await screen.findByLabelText('Edad');
    await u.type(edad, '30');
    await u.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(actualizar).toHaveBeenCalledWith('c-77', { version: 4, edad: 30 });
    expect(
      await screen.findByText('Otra base modificó este registro mientras lo editabas'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Ficha abierta')).not.toBeInTheDocument();
  });
});
