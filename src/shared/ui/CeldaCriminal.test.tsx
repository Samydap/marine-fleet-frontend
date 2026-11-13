import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@core/http/api-client';
import { limpiarDirectorioCriminales } from '@core/directorio/directorio-criminales';
import { CeldaCriminal } from './CeldaCriminal';

function renderizar(celda: React.ReactElement): void {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {celda}
    </MemoryRouter>,
  );
}

describe('CeldaCriminal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    limpiarDirectorioCriminales();
  });

  it('con el nombre de la respuesta lo muestra sin pedir nada al directorio', () => {
    const get = vi.spyOn(apiClient, 'get');
    renderizar(<CeldaCriminal criminalId="c-zoro" nombre="Roronoa Zoro" fotoUrl={null} />);

    expect(screen.getByRole('link', { name: 'Roronoa Zoro' })).toHaveAttribute(
      'href',
      '/criminales/c-zoro',
    );
    expect(get).not.toHaveBeenCalled();
  });

  it('con nombre null dice que el criminal no esta disponible', () => {
    const get = vi.spyOn(apiClient, 'get');
    renderizar(<CeldaCriminal criminalId="c-borrado" nombre={null} />);

    expect(screen.getByText('Criminal no disponible')).toBeInTheDocument();
    expect(get).not.toHaveBeenCalled();
  });

  it('sin nombre en la respuesta lo busca en el directorio', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({
      id: 'c-zoro',
      nombre: 'Roronoa Zoro',
      alias: ['Cazador de Piratas'],
      fotoUrl: null,
    });
    renderizar(<CeldaCriminal criminalId="c-zoro" />);

    expect(await screen.findByRole('link', { name: 'Roronoa Zoro' })).toBeInTheDocument();
    expect(screen.getByText('«Cazador de Piratas»')).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith('/criminales/c-zoro', undefined, { silencioso: true });
  });
});
