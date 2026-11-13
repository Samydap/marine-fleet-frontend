import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { inteligenciaApi } from '../data-access/inteligencia-api';
import { ReporteCiudadanoPage } from './ReporteCiudadanoPage';

const ZORO = {
  id: 'c-zoro',
  nombre: 'Roronoa Zoro',
  alias: ['Cazador de Piratas'],
  fotoUrl: null,
  recompensaVigenteMonto: 1111000000,
  nivelAmenaza: 'ALTO',
  organizacion: 'Piratas del Sombrero de Paja',
};

function renderizar(ruta = '/reportar'): void {
  render(
    <MemoryRouter
      initialEntries={[ruta]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/reportar" element={<ReporteCiudadanoPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ReporteCiudadanoPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('no envia nada si faltan datos y dice que corregir', async () => {
    const enviar = vi.spyOn(inteligenciaApi, 'enviarReporteCiudadano');
    renderizar();

    await userEvent.click(screen.getByRole('button', { name: 'Enviar reporte' }));

    expect(enviar).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Nombre o alias')).toHaveAccessibleDescription(
      /Busca y elige al criminal/,
    );
    expect(screen.getByLabelText(/Cuéntanos lo que viste/)).toBeInvalid();
  });

  it('toma el codigo del enlace del cartel y envia el reporte anonimo sin nombre ni contacto', async () => {
    const enviar = vi.spyOn(inteligenciaApi, 'enviarReporteCiudadano').mockResolvedValue({
      id: 'r-123',
      estado: 'PENDIENTE',
      mensaje: 'Gracias. Tu reporte fue recibido.',
    });
    const usuario = userEvent.setup();
    renderizar('/reportar?criminal=c-zoro');

    // El codigo interno no se muestra crudo: viaja igual en el envio.
    expect(screen.queryByText(/c-zoro/)).not.toBeInTheDocument();
    expect(screen.getByText(/del cartel que escaneaste/)).toBeInTheDocument();
    await usuario.type(
      screen.getByLabelText(/Cuéntanos lo que viste/),
      'Lo vi preguntando por el puerto.',
    );
    await usuario.type(screen.getByLabelText(/¿Dónde\?/), 'Mercado de Loguetown');
    await usuario.type(screen.getByLabelText('Tu nombre'), 'Vendedor de frutas');
    await usuario.click(screen.getByLabelText(/Reportar de forma anónima/));

    expect(screen.queryByLabelText('Tu nombre')).not.toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Enviar reporte' }));

    expect(enviar).toHaveBeenCalledWith({
      criminalId: 'c-zoro',
      descripcion: 'Lo vi preguntando por el puerto.',
      ubicacion: 'Mercado de Loguetown',
      fechaHecho: undefined,
      nombre: undefined,
      contacto: undefined,
      anonimo: true,
    });
    expect(await screen.findByRole('heading', { name: 'Reporte recibido' })).toBeInTheDocument();
    expect(screen.getByText('r-123')).toBeInTheDocument();
  });

  it('busca por nombre o alias, elige al criminal y envia su codigo', async () => {
    const buscar = vi.spyOn(inteligenciaApi, 'buscarBuscados').mockResolvedValue([ZORO]);
    const enviar = vi.spyOn(inteligenciaApi, 'enviarReporteCiudadano').mockResolvedValue({
      id: 'r-1',
      estado: 'PENDIENTE',
      mensaje: 'Gracias.',
    });
    const usuario = userEvent.setup();
    renderizar();

    await usuario.type(screen.getByLabelText('Nombre o alias'), 'zoro');
    await usuario.click(await screen.findByRole('button', { name: /Roronoa Zoro/ }));
    expect(buscar).toHaveBeenCalledWith('zoro');
    expect(screen.queryByLabelText('Nombre o alias')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cambiar' })).toBeInTheDocument();

    await usuario.type(screen.getByLabelText(/Cuéntanos lo que viste/), 'Lo vi en el puerto.');
    await usuario.type(screen.getByLabelText(/¿Dónde\?/), 'Muelle 3');
    await usuario.click(screen.getByRole('button', { name: 'Enviar reporte' }));

    expect(enviar).toHaveBeenCalledWith(expect.objectContaining({ criminalId: 'c-zoro' }));
  });

  it('con una sola letra no consulta y sin resultados ofrece el codigo del cartel', async () => {
    const buscar = vi.spyOn(inteligenciaApi, 'buscarBuscados').mockResolvedValue([]);
    const usuario = userEvent.setup();
    renderizar();

    await usuario.type(screen.getByLabelText('Nombre o alias'), 'z');
    await new Promise((r) => setTimeout(r, 400));
    expect(buscar).not.toHaveBeenCalled();

    await usuario.type(screen.getByLabelText('Nombre o alias'), 'x');
    expect(await screen.findByText(/Nadie con ese nombre/)).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: /código impreso/ }));
    expect(screen.getByLabelText(/Código del criminal/)).toBeInTheDocument();
  });

  it('si la busqueda falla lo dice y permite reintentar', async () => {
    const buscar = vi
      .spyOn(inteligenciaApi, 'buscarBuscados')
      .mockRejectedValueOnce(new Error('red'))
      .mockResolvedValueOnce([ZORO]);
    const usuario = userEvent.setup();
    renderizar();

    await usuario.type(screen.getByLabelText('Nombre o alias'), 'zoro');
    await usuario.click(await screen.findByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('button', { name: /Roronoa Zoro/ })).toBeInTheDocument();
    expect(buscar).toHaveBeenCalledTimes(2);
  });

  it('si el envio falla, conserva lo escrito', async () => {
    vi.spyOn(inteligenciaApi, 'enviarReporteCiudadano').mockRejectedValue(new Error('429'));
    const usuario = userEvent.setup();
    renderizar('/reportar?criminal=c-zoro');

    await usuario.type(screen.getByLabelText(/Cuéntanos lo que viste/), 'Texto suficiente aquí.');
    await usuario.type(screen.getByLabelText(/¿Dónde\?/), 'Muelle 3');
    await usuario.click(screen.getByRole('button', { name: 'Enviar reporte' }));

    expect(await screen.findByLabelText(/Cuéntanos lo que viste/)).toHaveValue(
      'Texto suficiente aquí.',
    );
    expect(screen.queryByRole('heading', { name: 'Reporte recibido' })).not.toBeInTheDocument();
  });
});
