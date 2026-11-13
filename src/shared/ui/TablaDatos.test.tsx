import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@core/models/api-response';
import { EstadoVacio } from './Estados';
import { TablaDatos, type ColumnaTabla } from './TablaDatos';

interface Fila {
  id: string;
  nombre: string;
  monto: number;
}

const COLUMNAS: ColumnaTabla<Fila>[] = [
  { clave: 'nombre', encabezado: 'Nombre', principal: true, celda: (f) => f.nombre },
  { clave: 'monto', encabezado: 'Recompensa', numerica: true, celda: (f) => f.monto },
];

const FILAS: Fila[] = [
  { id: 'c-1', nombre: 'Monkey D. Luffy', monto: 3_000_000_000 },
  { id: 'c-2', nombre: 'Buggy', monto: 3_189_000_000 },
];

function tabla(props: Partial<ComponentProps<typeof TablaDatos<Fila>>> = {}): void {
  render(
    <TablaDatos<Fila>
      titulo="Criminales registrados"
      filas={FILAS}
      columnas={COLUMNAS}
      claveFila={(f) => f.id}
      vacio={<EstadoVacio titulo="Sin criminales" />}
      {...props}
    />,
  );
}

describe('TablaDatos', () => {
  it('pinta una fila por dato con su titulo accesible', () => {
    tabla();
    const t = screen.getByRole('table', { name: 'Criminales registrados' });
    expect(within(t).getAllByRole('row')).toHaveLength(3);
    expect(within(t).getByText('Buggy')).toBeInTheDocument();
  });

  it('cada celda lleva su encabezado para la vista de fichas en movil', () => {
    tabla();
    expect(screen.getByText('Buggy').closest('td')).toHaveAttribute('data-etiqueta', 'Nombre');
  });

  it('las columnas numericas usan cifras tabulares alineadas a la derecha', () => {
    tabla();
    const celda = screen.getByText('3000000000').closest('td');
    expect(celda).toHaveClass('cifra');
    expect(celda).toHaveClass('ui-tabla-celda--fin');
  });

  it('en la primera carga muestra filas esqueleto, no un spinner', () => {
    tabla({ filas: [], cargando: true, filasSkeleton: 4 });
    const t = screen.getByRole('table');
    expect(t).toHaveAttribute('aria-busy', 'true');
    expect(within(t).getAllByRole('row')).toHaveLength(5);
    expect(screen.queryByText('Sin criminales')).not.toBeInTheDocument();
  });

  it('al recargar conserva los datos atenuados', () => {
    tabla({ actualizando: true });
    expect(screen.getByRole('table')).toHaveClass('ui-tabla--actualizando');
    expect(screen.getByText('Buggy')).toBeInTheDocument();
  });

  it('sin filas muestra el vacio que se le pasa', () => {
    tabla({ filas: [] });
    expect(screen.getByText('Sin criminales')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('un error sin datos ofrece reintentar', async () => {
    const reintentar = vi.fn();
    tabla({ filas: [], error: new ApiError(0, 'SIN_CONEXION', 'x'), onReintentar: reintentar });
    expect(screen.getByText('Sin conexión con el servidor')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(reintentar).toHaveBeenCalledOnce();
  });

  it('un error con datos previos los conserva y avisa arriba', () => {
    tabla({ error: new ApiError(500, 'INTERNO', 'x') });
    expect(screen.getByText('No se pudo actualizar la lista')).toBeInTheDocument();
    expect(screen.getByText('Buggy')).toBeInTheDocument();
  });
});
