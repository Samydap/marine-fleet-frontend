import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@core/models/api-response';
import { RolCodigo, type UsuarioSesion } from '@core/session/permiso.enum';
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
        <Route path="/criminales/c-1" element={<p>Ficha pendiente</p>} />
        <Route path="*" element={<p>Panel del cargo</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

const ALMIRANTE: UsuarioSesion = {
  id: 'u-almirante',
  email: 'almirante@marina.gov',
  nombreCompleto: 'Sakazuki',
  rol: RolCodigo.ALMIRANTE,
  permisos: [],
  baseNavalId: null,
};

const RETO = { challengeToken: 'reto-temporal-123', email: 'almirante@marina.gov' };

describe('MfaPage', () => {
  afterEach(() => vi.restoreAllMocks());

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

  it('con el codigo correcto entra y vuelve a la ruta que el usuario queria abrir', async () => {
    const verificar = vi.spyOn(mfaApi, 'verificar').mockResolvedValue(ALMIRANTE);
    renderizar({ ...RETO, redirectTo: '/criminales/c-1' });
    const usuario = userEvent.setup();

    await usuario.type(screen.getByLabelText('Código de verificación'), '123456');
    await usuario.click(screen.getByRole('button', { name: 'Verificar' }));

    expect(verificar).toHaveBeenCalledWith({
      challengeToken: 'reto-temporal-123',
      codigo: '123456',
    });
    expect(await screen.findByText('Ficha pendiente')).toBeInTheDocument();
  });

  it('con un codigo incorrecto lo borra y explica el error', async () => {
    vi.spyOn(mfaApi, 'verificar').mockRejectedValue(
      new ApiError(401, 'CODIGO_MFA_INVALIDO', 'El codigo no es correcto.'),
    );
    renderizar(RETO);
    const usuario = userEvent.setup();

    const codigo = screen.getByLabelText('Código de verificación');
    await usuario.type(codigo, '654321');
    await usuario.click(screen.getByRole('button', { name: 'Verificar' }));

    expect(
      await within(screen.getByRole('alert')).findByText('Código incorrecto'),
    ).toBeInTheDocument();
    expect(codigo).toHaveValue('');
    expect(codigo).toHaveFocus();
  });
});
