import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Boton, BotonIcono } from './Boton';
import { IconoCerrar } from './iconos';

describe('Boton', () => {
  it('es type="button" por defecto: no envia formularios por accidente', () => {
    render(<Boton>Exportar</Boton>);
    expect(screen.getByRole('button', { name: 'Exportar' })).toHaveAttribute('type', 'button');
  });

  it('cargando se deshabilita y nombra la accion en curso', async () => {
    const clic = vi.fn();
    render(
      <Boton variante="principal" cargando textoCargando="Guardando…" onClick={clic}>
        Guardar
      </Boton>,
    );
    const boton = screen.getByRole('button', { name: 'Guardando…' });
    expect(boton).toBeDisabled();
    expect(boton).toHaveAttribute('aria-busy', 'true');
    await userEvent.setup().click(boton);
    expect(clic).not.toHaveBeenCalled();
  });

  it('aplica la variante', () => {
    render(<Boton variante="peligro">Cerrar búsqueda</Boton>);
    expect(screen.getByRole('button', { name: 'Cerrar búsqueda' })).toHaveClass(
      'ui-boton--peligro',
    );
  });

  it('el boton de solo icono exige nombre accesible', () => {
    render(<BotonIcono etiqueta="Cerrar aviso" icono={<IconoCerrar />} />);
    expect(screen.getByRole('button', { name: 'Cerrar aviso' })).toBeInTheDocument();
  });
});
