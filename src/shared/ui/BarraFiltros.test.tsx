import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BarraFiltros } from './BarraFiltros';
import { CampoSelect } from './Campo';

describe('BarraFiltros', () => {
  it('el buscador se nombra con su etiqueta y se puede borrar', async () => {
    const cambiar = vi.fn();
    render(
      <BarraFiltros
        busqueda="Luffy"
        onBusquedaChange={cambiar}
        etiquetaBusqueda="Buscar por nombre o alias"
      />,
    );
    expect(screen.getByRole('searchbox', { name: 'Buscar por nombre o alias' })).toHaveValue(
      'Luffy',
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Borrar búsqueda' }));
    expect(cambiar).toHaveBeenCalledWith('');
  });

  it('Enter aplica sin recargar la pagina', async () => {
    const aplicar = vi.fn();
    render(<BarraFiltros busqueda="" onBusquedaChange={vi.fn()} onAplicar={aplicar} />);
    await userEvent.setup().type(screen.getByRole('searchbox'), '{Enter}');
    expect(aplicar).toHaveBeenCalledOnce();
  });

  it('"Limpiar filtros" solo aparece con filtros activos y cuenta cuantos', async () => {
    const limpiar = vi.fn();
    const filtros = (
      <CampoSelect etiqueta="Estado" opcionVacia="Todos" opciones={[]} defaultValue="" />
    );
    const { rerender } = render(
      <BarraFiltros filtrosActivos={0} onLimpiar={limpiar}>
        {filtros}
      </BarraFiltros>,
    );
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();

    rerender(
      <BarraFiltros filtrosActivos={2} onLimpiar={limpiar}>
        {filtros}
      </BarraFiltros>,
    );
    expect(screen.getByRole('button', { name: /Filtros\s*, activos: 2/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(limpiar).toHaveBeenCalledOnce();
  });
});
