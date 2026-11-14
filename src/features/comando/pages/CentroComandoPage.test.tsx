import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CARTELES_INICIALES, NAVES } from '../datos';
import { CentroComandoPage } from './CentroComandoPage';

function montar(): ReturnType<typeof userEvent.setup> {
  render(
    <MemoryRouter>
      <CentroComandoPage />
    </MemoryRouter>,
  );
  return userEvent.setup();
}

describe('CentroComandoPage', () => {
  it('muestra la cabecera y todos los paneles', () => {
    montar();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Marine Fleet & Bounty HQ');
    for (const panel of [
      'Panel de control',
      'Den Den Mushi',
      'Mapas',
      'Carteles de se busca',
      'Misiones y operativos',
      'Buster Call',
    ]) {
      expect(screen.getByRole('region', { name: panel })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('article', { name: /^Cartel de / })).toHaveLength(
      CARTELES_INICIALES.length,
    );
  });

  it('sella un cartel como capturado y permite ocultarlo', async () => {
    const usuario = montar();
    const cartel = screen.getByRole('article', { name: 'Cartel de LUFFY' });
    expect(within(cartel).queryByText('CAPTURED')).not.toBeInTheDocument();

    await usuario.click(
      within(cartel).getByRole('button', { name: 'Registrar la captura de LUFFY' }),
    );
    expect(within(cartel).getByText('CAPTURED')).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Ocultar los capturados' }));
    expect(screen.queryByRole('article', { name: 'Cartel de LUFFY' })).not.toBeInTheDocument();
  });

  it('abre la ficha del pirata desde el boton de informacion', async () => {
    const usuario = montar();
    const cartel = screen.getByRole('article', { name: 'Cartel de KAIDO' });

    await usuario.click(within(cartel).getByRole('button', { name: 'Ver la ficha de KAIDO' }));

    expect(within(cartel).getByText('País de Wano')).toBeInTheDocument();
  });

  it('resalta en la tabla de coordenadas la nave elegida en la carta', async () => {
    const usuario = montar();
    const nave = NAVES[2];
    const coordenadas = screen.getByRole('table', { name: 'Coordenadas' });
    const fila = within(coordenadas).getByRole('row', { name: new RegExp(`^${nave.id}`) });
    expect(fila).not.toHaveClass('font-bold');

    await usuario.click(screen.getByRole('button', { name: nave.nombre }));

    expect(fila).toHaveClass('font-bold');
  });

  it('no deja emitir la Buster Call con el seguro puesto', async () => {
    const usuario = montar();
    const zona = screen.getByRole('region', { name: 'Buster Call' });
    const boton = within(zona).getByRole('button', { name: 'BUSTER CALL' });
    const seguro = within(zona).getByRole('switch');

    expect(boton).toBeDisabled();
    expect(within(zona).getByRole('status')).toHaveTextContent('Seguro puesto');

    await usuario.click(seguro);
    expect(seguro).toBeChecked();
    expect(boton).toBeEnabled();

    await usuario.click(boton);
    expect(within(zona).getByRole('status')).toHaveTextContent('Orden emitida');

    // Volver a poner el seguro cancela la orden.
    await usuario.click(seguro);
    expect(boton).toBeDisabled();
    expect(within(zona).getByRole('status')).toHaveTextContent('Seguro puesto');
  });

  it('registra el avance de una mision hasta completarla', async () => {
    const usuario = montar();
    const mision = screen.getByRole('article', { name: 'Misión Sabaody Raid' });
    const barra = within(mision).getByRole('progressbar');
    expect(barra).toHaveAttribute('aria-valuenow', '1');

    for (let i = 0; i < 4; i++) {
      await usuario.click(within(mision).getByRole('button', { name: 'Registrar avance' }));
    }

    expect(barra).toHaveAttribute('aria-valuenow', '5');
    expect(within(mision).getByRole('button', { name: 'Completada' })).toBeDisabled();
  });

  it('abre la linea del Den Den Mushi en el canal elegido', async () => {
    const usuario = montar();
    const zona = screen.getByRole('region', { name: 'Den Den Mushi' });

    await usuario.selectOptions(
      within(zona).getByRole('combobox', { name: 'Canal de radio' }),
      'Impel Down',
    );
    await usuario.click(within(zona).getByRole('button', { name: 'DECIDIR' }));

    expect(within(zona).getByRole('status')).toHaveTextContent('En línea con Impel Down');
    expect(within(zona).getByRole('button', { name: 'CANCELAR' })).toBeEnabled();
  });
});
