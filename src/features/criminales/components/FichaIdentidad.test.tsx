import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCatalogosStore } from '@core/catalogos/catalogos';
import { ApiError } from '@core/models/api-response';
import type { DatosCartel } from '@shared/utils/cartel';
import { criminalesApi } from '../data-access/criminales-api';
import { useFichaStore, type EstadoCartel } from '../data-access/ficha.store';
import type { CartelVigenteResumen, CriminalDetalle } from '../models/criminal';
import { FichaIdentidad } from './FichaIdentidad';

const CRIMINAL = {
  id: 'c-1',
  nombre: 'Monkey D. Luffy',
  alias: ['Sombrero de Paja'],
  edad: 19,
  descripcionFisica: 'Cicatriz bajo el ojo izquierdo.',
  fotoUrl: null,
  estado: 'ACTIVO',
  nivelAmenaza: 'ALTO',
  recompensaVigenteMonto: 3_000_000_000,
  zonaInfluenciaId: null,
  organizacion: null,
  afiliaciones: [],
  origenBaseId: null,
  creadoPor: null,
  actualizadoPor: null,
  fechaBaja: null,
  version: 4,
  createdAt: '2026-01-10T10:00:00Z',
  updatedAt: '2026-11-01T10:00:00Z',
} as unknown as CriminalDetalle;

/** La instantanea emitida: el nombre impreso es el del dia de la emision. */
const INSTANTANEA: DatosCartel = {
  criminalId: 'c-1',
  nombre: 'Monkey D. Luffy',
  alias: ['Sombrero de Paja'],
  recompensa: 1_500_000_000,
  nivelAmenaza: 'ALTO',
  estado: 'ACTIVO',
  organizacion: 'Piratas del Sombrero de Paja',
  categoriaOrganizacion: 'PIRATA',
  fotoUrl: null,
  textoLegal: null,
};

const RESUMEN: CartelVigenteResumen = {
  id: 'k-3',
  numeroVersion: 3,
  motivoGeneracion: 'CAMBIO_RECOMPENSA',
  generadoEn: '2026-10-30T09:00:00Z',
};

function renderizar(
  instantanea: DatosCartel | null,
  cartel: CartelVigenteResumen | null = null,
  estadoCartel: EstadoCartel = 'listo',
): void {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <FichaIdentidad
        criminal={CRIMINAL}
        cartel={cartel}
        instantanea={instantanea}
        estadoCartel={estadoCartel}
      />
    </MemoryRouter>,
  );
}

describe('FichaIdentidad', () => {
  beforeEach(() => {
    useCatalogosStore.setState({ mares: [], zonas: [], bases: [], estado: 'listo' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    useFichaStore.setState({
      id: null,
      cartel: null,
      instantaneaCartel: null,
      cartelEstado: 'cargando',
    });
  });

  it('muestra el cartel oficial cuando hay instantánea', () => {
    renderizar(INSTANTANEA, RESUMEN);
    const cartel = screen.getByRole('article', { name: /Cartel de búsqueda de Monkey D\. Luffy/ });
    expect(within(cartel).getByText('WANTED')).toBeInTheDocument();
    // El nombre se imprime en mayusculas (text-transform de .cartel-nombre).
    const nombre = within(cartel).getByRole('heading', { name: 'Monkey D. Luffy' });
    expect(nombre).toHaveClass('cartel-nombre');
    // La cifra es la de la instantanea, no la recompensa vigente del criminal.
    expect(
      within(cartel).getByText(`${(1_500_000_000).toLocaleString('es-CO')}-`),
    ).toBeInTheDocument();
    expect(within(cartel).getByText(/^V3 ·/)).toBeInTheDocument();
    expect(screen.queryByText('Sin cartel emitido')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver cartel y versiones' })).toHaveAttribute(
      'href',
      '/carteles/c-1',
    );
  });

  it('sin cartel emitido muestra el hueco y el enlace para emitirlo', () => {
    renderizar(null);
    expect(screen.getByText('Sin cartel emitido')).toBeInTheDocument();
    expect(screen.queryByText('WANTED')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Emitir cartel' })).toHaveAttribute(
      'href',
      '/carteles/c-1',
    );
  });

  it('si falla la lectura del cartel la ficha sigue mostrando la identificación', async () => {
    vi.spyOn(criminalesApi, 'cartelVigente').mockRejectedValue(
      new ApiError(500, 'ERROR_INTERNO', 'Fallo del servidor'),
    );
    useFichaStore.setState({ id: 'c-1', cartel: null, instantaneaCartel: null });
    await expect(useFichaStore.getState().recargarCartel()).resolves.toBeUndefined();

    const { cartel, instantaneaCartel } = useFichaStore.getState();
    renderizar(instantaneaCartel, cartel, useFichaStore.getState().cartelEstado);
    expect(screen.getByRole('complementary', { name: 'Identificación' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Monkey D\. Luffy/ })).toBeInTheDocument();
    expect(screen.getByText('Recompensa vigente')).toBeInTheDocument();
    expect(screen.getByText('19 años')).toBeInTheDocument();
    expect(screen.getByText('No se pudo leer el cartel')).toBeInTheDocument();
    expect(screen.queryByText('Sin cartel emitido')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver cartel y versiones' })).toHaveAttribute(
      'href',
      '/carteles/c-1',
    );
  });

  it('mientras carga el cartel muestra el hueso y no anuncia que falta', () => {
    const { container } = render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FichaIdentidad
          criminal={CRIMINAL}
          cartel={null}
          instantanea={null}
          estadoCartel="cargando"
        />
      </MemoryRouter>,
    );
    expect(container.querySelector('.identidad-cartel-hueso')).not.toBeNull();
    expect(screen.queryByText('Sin cartel emitido')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Emitir cartel' })).not.toBeInTheDocument();
    // La foto del expediente no ocupa su lugar para saltar luego al cartel.
    expect(screen.queryByRole('img', { name: /Monkey D\. Luffy/ })).not.toBeInTheDocument();
  });

  it('un refresco con el cartel ya visible no vuelve al hueso', async () => {
    vi.spyOn(criminalesApi, 'cartelVigente').mockResolvedValue({
      resumen: RESUMEN,
      instantanea: INSTANTANEA,
    });
    useFichaStore.setState({
      id: 'c-1',
      cartel: RESUMEN,
      instantaneaCartel: INSTANTANEA,
      cartelEstado: 'listo',
    });
    const promesa = useFichaStore.getState().recargarCartel();
    expect(useFichaStore.getState().cartelEstado).toBe('listo');
    await promesa;
    expect(useFichaStore.getState().cartelEstado).toBe('listo');
  });
});
