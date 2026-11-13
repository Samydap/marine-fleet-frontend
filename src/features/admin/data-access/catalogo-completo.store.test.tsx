import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@core/http/api-client';
import { useCatalogoCompleto } from './catalogo-completo.store';

function Sonda(): React.ReactElement {
  const { mares, estado } = useCatalogoCompleto();
  return (
    <p>
      {estado}: {mares.map((m) => `${m.nombre}${m.activo ? '' : ' (inactivo)'}`).join(', ')}
    </p>
  );
}

describe('useCatalogoCompleto', () => {
  afterEach(() => vi.restoreAllMocks());

  it('pide lo inactivo y lo conserva para poder reactivarlo', async () => {
    const get = vi.spyOn(apiClient, 'get').mockImplementation((ruta: string) =>
      Promise.resolve(
        ruta === '/catalogos/mares'
          ? [
              { id: 'm-1', nombre: 'East Blue', tipo: 'MAR_AZUL', activo: true },
              { id: 'm-2', nombre: 'Mar Viejo', tipo: 'MAR_AZUL', activo: false },
            ]
          : [],
      ),
    );
    render(<Sonda />);

    expect(await screen.findByText(/listo: .*Mar Viejo \(inactivo\)/)).toBeInTheDocument();
    for (const ruta of [
      '/catalogos/mares',
      '/catalogos/zonas-influencia',
      '/catalogos/bases-navales',
    ]) {
      expect(get).toHaveBeenCalledWith(ruta, { incluirInactivos: true }, { sinAviso: true });
    }
  });
});
