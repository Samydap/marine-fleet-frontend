import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Permiso, RolCodigo, type UsuarioSesion } from '@core/session/permiso.enum';
import { useSessionStore } from '@core/session/session.store';
import { amenazaApi } from '../data-access/amenaza-api';
import { useAmenazaStore } from '../data-access/amenaza.store';
import type { CriterioAmenaza } from '../models/amenaza';
import { CriteriosPage } from './CriteriosPage';

const DESDE = '2026-06-01T10:00:00.000Z';

function vigente(
  nivel: CriterioAmenaza['nivel'],
  montoMinimo: number,
  montoMaximo: number | null,
): CriterioAmenaza {
  return {
    id: `c-${nivel}`,
    nivel,
    montoMinimo,
    montoMaximo,
    vigente: true,
    vigenteDesde: DESDE,
    vigenteHasta: null,
    modificadoPor: 'u-analista',
    motivo: 'Ajuste tras Marineford',
  };
}

const VIGENTES: CriterioAmenaza[] = [
  vigente('BAJO', 1, 149_999_999),
  vigente('MEDIO', 150_000_000, 999_999_999),
  vigente('ALTO', 1_000_000_000, null),
];

function usuario(rol: RolCodigo, permisos: Permiso[]): UsuarioSesion {
  return {
    id: `u-${rol}`,
    email: 'oficial@marina.gov',
    nombreCompleto: 'Oficial de prueba',
    rol,
    permisos,
    baseNavalId: 'b-1',
  };
}

function renderizar(): void {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CriteriosPage />
    </MemoryRouter>,
  );
}

describe('CriteriosPage', () => {
  beforeEach(() => {
    useAmenazaStore.setState({
      criterios: { datos: null, cargando: false, error: null, consultadoEn: null },
      historial: { datos: null, cargando: false, error: null, consultadoEn: null },
    });
    vi.spyOn(amenazaApi, 'criterios').mockResolvedValue(VIGENTES);
    vi.spyOn(amenazaApi, 'historialCriterios').mockResolvedValue(VIGENTES);
  });

  afterEach(() => {
    useSessionStore.setState({ usuario: null });
  });

  it('el Almirante consulta los rangos pero no puede cambiarlos (la regla es por rol)', async () => {
    useSessionStore.setState({ usuario: usuario(RolCodigo.ALMIRANTE, [Permiso.TODO]) });
    renderizar();

    expect(await screen.findByText(/Desde 1\.000\.000\.000/)).toBeInTheDocument();
    expect(
      screen.getByText('Solo el Analista de Datos Criminales cambia estos rangos'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aplicar criterios' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reclasificar a todos' })).not.toBeInTheDocument();
  });

  it('el Analista edita los cortes, valida el motivo y confirma antes de reclasificar', async () => {
    useSessionStore.setState({
      usuario: usuario(RolCodigo.ANALISTA_DATOS_CRIMINALES, [
        Permiso.CRIMINALES_LEER,
        Permiso.AMENAZA_CONFIGURAR_CRITERIOS,
      ]),
    });
    const reemplazar = vi.spyOn(amenazaApi, 'reemplazarCriterios').mockResolvedValue({
      criterios: VIGENTES,
      reclasificacion: { total: 10, reclasificados: 3, sinCambio: 7, errores: [], duracionMs: 420 },
    });
    const u = userEvent.setup();
    renderizar();

    const bajo = await screen.findByLabelText(/Bajo hasta/);
    expect(bajo).toHaveValue('149999999');
    // Sin cambios no se puede aplicar.
    expect(screen.getByRole('button', { name: 'Aplicar criterios' })).toBeDisabled();

    await u.clear(bajo);
    await u.type(bajo, '199999999');
    await u.click(screen.getByRole('button', { name: 'Aplicar criterios' }));
    expect(await screen.findByText(/al menos 5 caracteres/)).toBeInTheDocument();
    expect(reemplazar).not.toHaveBeenCalled();

    await u.type(screen.getByLabelText(/Motivo del cambio/), 'Ajuste trimestral');
    await u.click(screen.getByRole('button', { name: 'Aplicar criterios' }));
    await u.click(await screen.findByRole('button', { name: 'Aplicar y reclasificar' }));

    expect(reemplazar).toHaveBeenCalledWith({
      criterios: [
        { nivel: 'BAJO', montoMinimo: 1, montoMaximo: 199_999_999 },
        { nivel: 'MEDIO', montoMinimo: 200_000_000, montoMaximo: 999_999_999 },
        { nivel: 'ALTO', montoMinimo: 1_000_000_000, montoMaximo: null },
      ],
      motivo: 'Ajuste trimestral',
    });
    expect(await screen.findByText('3 de 10 criminales cambiaron de nivel')).toBeInTheDocument();
  });
});
