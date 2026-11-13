import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { mfaApi } from '../data-access/mfa-api';
import { MfaPage } from './MfaPage';

function renderizar(estado?: unknown): void {
  render(
    <MemoryRouter
      initialEntries={[{ pathname: '/auth/mfa', state: estado }]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/auth/mfa" element={<MfaPage />} />
        <Route path="/auth/login" element={<p>Pantalla de login</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

const RETO = { challengeToken: 'reto-temporal-123', email: 'almirante@marina.gov' };

describe('MfaPage', () => {
  it('sin reto pendiente no muestra el formulario y ofrece volver al login', async () => {
    renderizar();

    expect(screen.queryByLabelText('Código de verificación')).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('link', { name: 'Ir a iniciar sesión' }));
    expect(await screen.findByText('Pantalla de login')).toBeInTheDocument();
  });

  it('acepta solo digitos y valida que sean seis', async () => {
    const verificar = vi.spyOn(mfaApi, 'verificar');
    renderizar(RETO);
    const usuario = userEvent.setup();

    const codigo = screen.getByLabelText('Código de verificación');
    await usuario.type(codigo, '12a 3');
    expect(codigo).toHaveValue('123');

    await usuario.click(screen.getByRole('button', { name: 'Verificar' }));
    expect(verificar).not.toHaveBeenCalled();
    expect(codigo).toHaveAccessibleDescription('El código debe tener 6 dígitos.');
  });

  it('envia el reto y el codigo, y muestra que el servidor aun no lo admite', async () => {
    const verificar = vi.spyOn(mfaApi, 'verificar');
    renderizar(RETO);
    const usuario = userEvent.setup();

    await usuario.type(screen.getByLabelText('Código de verificación'), '123456');
    await usuario.click(screen.getByRole('button', { name: 'Verificar' }));

    expect(verificar).toHaveBeenCalledWith({
      challengeToken: 'reto-temporal-123',
      codigo: '123456',
    });
    expect(
      await within(screen.getByRole('alert')).findByText('Verificación no disponible'),
    ).toBeInTheDocument();
  });
});
