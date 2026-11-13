import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { inteligenciaApi } from '../data-access/inteligencia-api';
import { ReporteCiudadanoPage } from './ReporteCiudadanoPage';

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
    expect(screen.getByLabelText(/Código del criminal/)).toHaveAccessibleDescription(
      /Indica el código/,
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
