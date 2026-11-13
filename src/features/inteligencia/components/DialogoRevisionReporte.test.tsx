import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { inteligenciaApi } from '../data-access/inteligencia-api';
import type { ReporteCiudadano } from '../models/reporte';
import { DialogoRevisionReporte } from './DialogoRevisionReporte';

const REPORTE: ReporteCiudadano = {
  id: 'r-1',
  criminalId: 'c-zoro',
  descripcion: 'Lo vi preguntando por el puerto tres veces.',
  fechaHecho: null,
  ubicacion: 'Mercado de Loguetown',
  zonaInfluenciaId: null,
  informante: { nombre: null, contacto: null, anonimo: true },
  estado: 'PENDIENTE',
  revisadoPor: null,
  fechaRevision: null,
  motivoRechazo: null,
  avistamientoId: null,
  createdAt: '2026-11-12T10:00:00.000Z',
};

function renderizar(puedeRevisar: boolean, onRevisado = vi.fn()): void {
  render(
    <DialogoRevisionReporte
      reporte={REPORTE}
      nombreCriminal="Roronoa Zoro"
      zona={null}
      puedeRevisar={puedeRevisar}
      onCerrar={vi.fn()}
      onRevisado={onRevisado}
    />,
  );
}

describe('DialogoRevisionReporte', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra el relato completo y oculta la decision a quien solo consulta', () => {
    renderizar(false);
    expect(screen.getByText(REPORTE.descripcion)).toBeInTheDocument();
    expect(screen.getByText('Informante anónimo')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Aprobar/ })).not.toBeInTheDocument();
  });

  it('no rechaza sin motivo y envia el motivo escrito', async () => {
    const revisar = vi
      .spyOn(inteligenciaApi, 'revisarReporte')
      .mockResolvedValue({ ...REPORTE, estado: 'RECHAZADO', avistamientoCreadoId: null });
    const onRevisado = vi.fn();
    const usuario = userEvent.setup();
    renderizar(true, onRevisado);

    await usuario.click(screen.getByRole('button', { name: 'Rechazar…' }));
    await usuario.click(screen.getByRole('button', { name: 'Rechazar reporte' }));
    expect(revisar).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Motivo del rechazo/)).toBeInvalid();

    await usuario.type(screen.getByLabelText(/Motivo del rechazo/), 'Estaba bajo custodia.');
    await usuario.click(screen.getByRole('button', { name: 'Rechazar reporte' }));

    expect(revisar).toHaveBeenCalledWith('r-1', {
      decision: 'RECHAZADO',
      motivoRechazo: 'Estaba bajo custodia.',
    });
    expect(onRevisado).toHaveBeenCalled();
  });

  it('aprobar convierte el reporte en avistamiento sin pedir motivo', async () => {
    const revisar = vi
      .spyOn(inteligenciaApi, 'revisarReporte')
      .mockResolvedValue({ ...REPORTE, estado: 'APROBADO', avistamientoCreadoId: 'a-9' });
    renderizar(true);

    await userEvent.click(screen.getByRole('button', { name: 'Aprobar como avistamiento' }));

    expect(revisar).toHaveBeenCalledWith('r-1', { decision: 'APROBADO', motivoRechazo: undefined });
  });
});
