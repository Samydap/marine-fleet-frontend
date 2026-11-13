import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Dialogo, DialogoConfirmacion } from './Dialogo';

function Confirmacion({
  onConfirmar,
}: {
  readonly onConfirmar: () => Promise<void>;
}): React.ReactElement {
  const [abierto, setAbierto] = useState(true);
  return (
    <DialogoConfirmacion
      abierto={abierto}
      onCerrar={() => setAbierto(false)}
      onConfirmar={onConfirmar}
      titulo="¿Abortar el operativo OP-0042?"
      mensaje="Las bases asignadas dejarán de verlo como activo."
      textoConfirmar="Abortar operativo"
      textoConfirmando="Abortando…"
      peligroso
    />
  );
}

describe('Dialogo', () => {
  it('se nombra con su titulo y se describe con la descripcion', () => {
    render(
      <Dialogo
        abierto
        onCerrar={vi.fn()}
        titulo="Asignar bases"
        descripcion="Elige una o varias."
      />,
    );
    const dialogo = screen.getByRole('dialog', { name: 'Asignar bases' });
    expect(dialogo).toHaveAccessibleDescription('Elige una o varias.');
  });

  it('la X llama a onCerrar', async () => {
    const cerrar = vi.fn();
    render(<Dialogo abierto onCerrar={cerrar} titulo="Asignar bases" />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(cerrar).toHaveBeenCalledOnce();
  });

  it('cerrado no pinta contenido', () => {
    render(<Dialogo abierto={false} onCerrar={vi.fn()} titulo="Asignar bases" />);
    expect(screen.queryByText('Asignar bases')).not.toBeInTheDocument();
  });
});

describe('DialogoConfirmacion', () => {
  it('nombra la accion en curso, bloquea y se cierra al terminar', async () => {
    let terminar: () => void = () => undefined;
    const confirmar = vi.fn(
      () =>
        new Promise<void>((r) => {
          terminar = r;
        }),
    );
    render(<Confirmacion onConfirmar={confirmar} />);
    const usuario = userEvent.setup();

    await usuario.click(screen.getByRole('button', { name: 'Abortar operativo' }));
    expect(screen.getByRole('button', { name: 'Abortando…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();

    terminar();
    await waitFor(() =>
      expect(screen.queryByText('¿Abortar el operativo OP-0042?')).not.toBeInTheDocument(),
    );
  });

  it('si falla queda abierto para reintentar', async () => {
    render(<Confirmacion onConfirmar={() => Promise.reject(new Error('409'))} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Abortar operativo' }));
    expect(await screen.findByRole('button', { name: 'Abortar operativo' })).toBeEnabled();
    expect(screen.getByText('¿Abortar el operativo OP-0042?')).toBeInTheDocument();
  });
});

describe('Dialogo: foco', () => {
  it('entra en el primer control del cuerpo, no en la X', () => {
    render(
      <Dialogo abierto onCerrar={vi.fn()} titulo="Asignar bases">
        <label>
          Base
          <input />
        </label>
      </Dialogo>,
    );
    expect(screen.getByLabelText('Base')).toHaveFocus();
  });

  it('en una confirmacion peligrosa entra en "Cancelar"', () => {
    render(<Confirmacion onConfirmar={vi.fn(async () => undefined)} />);
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
  });

  it('la X va al final del orden de tabulacion', () => {
    render(
      <Dialogo
        abierto
        onCerrar={vi.fn()}
        titulo="Asignar bases"
        acciones={<button type="button">Asignar</button>}
      />,
    );
    const botones = screen.getAllByRole('button');
    expect(botones[botones.length - 1]).toHaveAccessibleName('Cerrar');
  });

  it('si el padre lo desmonta abierto, devuelve el foco a quien lo abrio', () => {
    function Padre(): React.ReactElement {
      const [abierto, setAbierto] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setAbierto(true)}>
            Abrir
          </button>
          {abierto && (
            <Dialogo abierto onCerrar={() => setAbierto(false)} titulo="Baja">
              <button type="button" onClick={() => setAbierto(false)}>
                Listo
              </button>
            </Dialogo>
          )}
        </>
      );
    }
    render(<Padre />);
    const abrir = screen.getByRole('button', { name: 'Abrir' });
    abrir.focus();
    act(() => abrir.click());
    expect(screen.getByRole('button', { name: 'Listo' })).toHaveFocus();
    act(() => screen.getByRole('button', { name: 'Listo' }).click());
    expect(abrir).toHaveFocus();
  });
});
