import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PageMeta } from '@core/models/page-result';
import { Paginacion } from './Paginacion';

function meta(page: number, total: number, limit = 20): PageMeta {
  const totalPages = Math.ceil(total / limit);
  return { page, limit, total, totalPages, hasNext: page < totalPages };
}

describe('Paginacion', () => {
  it('dice el tramo y el total', () => {
    render(<Paginacion meta={meta(2, 134)} onCambiarPagina={vi.fn()} sustantivo="criminales" />);
    expect(screen.getByText('21–40 de 134 criminales')).toBeInTheDocument();
    expect(screen.getByText('Página 2 de 7')).toBeInTheDocument();
  });

  it('deshabilita "Anterior" en la primera y "Siguiente" en la ultima', () => {
    const { rerender } = render(<Paginacion meta={meta(1, 45)} onCambiarPagina={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    rerender(<Paginacion meta={meta(3, 45)} onCambiarPagina={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
  });

  it('pide la pagina siguiente', async () => {
    const cambiar = vi.fn();
    render(<Paginacion meta={meta(1, 45)} onCambiarPagina={cambiar} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(cambiar).toHaveBeenCalledWith(2);
  });

  it('con una sola pagina solo cuenta; sin datos no se muestra', () => {
    const { rerender, container } = render(
      <Paginacion meta={meta(1, 7)} onCambiarPagina={vi.fn()} sustantivo="operativos" />,
    );
    expect(screen.getByText('7 operativos')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    rerender(<Paginacion meta={meta(1, 0)} onCambiarPagina={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
