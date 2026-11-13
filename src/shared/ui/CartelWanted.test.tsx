import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DatosCartel } from '@shared/utils/cartel';
import { CartelWanted } from './CartelWanted';

const DATOS: DatosCartel = {
  criminalId: 'c-1',
  nombre: 'Monkey D. Luffy',
  alias: ['Sombrero de Paja', 'Quinto Emperador'],
  recompensa: 3_000_000_000,
  nivelAmenaza: 'ALTO',
  estado: 'ACTIVO',
  organizacion: 'Piratas del Sombrero de Paja',
  categoriaOrganizacion: 'PIRATA',
  fotoUrl: '/api/v1/archivos/fotos/c-1.png',
  textoLegal: 'Por orden del Gobierno Mundial y de la Marina.',
};

describe('CartelWanted', () => {
  it('muestra WANTED, DEAD OR ALIVE, nombre, recompensa y afiliacion con su tipo', () => {
    render(<CartelWanted datos={DATOS} version={{ numero: 3, fecha: '2026-11-01T10:00:00Z' }} />);
    expect(screen.getByText('WANTED')).toBeInTheDocument();
    expect(screen.getByText('ALIVE')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Monkey D. Luffy' })).toBeInTheDocument();
    expect(screen.getByText(`${(3_000_000_000).toLocaleString('es-CO')}-`)).toBeInTheDocument();
    expect(screen.getByText('Pirata · Piratas del Sombrero de Paja')).toBeInTheDocument();
    expect(screen.getByText(/^V3 ·/)).toBeInTheDocument();
    expect(screen.getByRole('article')).toHaveAccessibleName(/Monkey D\. Luffy, recompensa/);
  });

  it('sin sello mientras esta en busqueda; con sello si fue capturado o fallecio', () => {
    const { rerender } = render(<CartelWanted datos={DATOS} />);
    expect(screen.queryByRole('img', { name: /Sello/ })).not.toBeInTheDocument();

    rerender(<CartelWanted datos={{ ...DATOS, estado: 'CAPTURADO' }} />);
    expect(screen.getByRole('img', { name: 'Sello: capturado' })).toHaveTextContent('CAPTURADO');

    rerender(<CartelWanted datos={{ ...DATOS, estado: 'MUERTO' }} />);
    expect(screen.getByRole('img', { name: 'Sello: fallecido' })).toHaveTextContent('FALLECIDO');
  });

  it('dibuja la silueta si no hay foto o si la foto no carga', () => {
    const { rerender } = render(<CartelWanted datos={DATOS} />);
    fireEvent.error(screen.getByAltText('Foto de Monkey D. Luffy'));
    expect(screen.getByRole('img', { name: 'Sin foto en el archivo' })).toBeInTheDocument();

    rerender(<CartelWanted datos={{ ...DATOS, criminalId: 'c-2', fotoUrl: null }} />);
    expect(screen.getByRole('img', { name: 'Sin foto en el archivo' })).toBeInTheDocument();
  });

  it('la miniatura omite el texto legal y deja un solo alias', () => {
    render(<CartelWanted datos={DATOS} tamano="miniatura" />);
    expect(screen.queryByText(/Gobierno Mundial/)).not.toBeInTheDocument();
    expect(screen.getByText('«Sombrero de Paja»')).toBeInTheDocument();
  });

  it('sin recompensa lo dice con texto, sin simbolo de berries', () => {
    render(<CartelWanted datos={{ ...DATOS, recompensa: null }} />);
    expect(screen.getByText('SIN RECOMPENSA')).toBeInTheDocument();
    expect(screen.queryByText('฿')).not.toBeInTheDocument();
  });
});
