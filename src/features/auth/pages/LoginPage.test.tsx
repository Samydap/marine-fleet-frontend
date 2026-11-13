import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@core/models/api-response';
import { Permiso, RolCodigo, type UsuarioSesion } from '@core/session/permiso.enum';
import { sessionService } from '@core/session/session.service';
import { LoginPage } from './LoginPage';

const USUARIO: UsuarioSesion = {
  id: 'u-capitan',
  email: 'capitan@marina.gov',
  nombreCompleto: 'Capitán de la Base 16',
  rol: RolCodigo.CAPITAN,
  permisos: [Permiso.CRIMINALES_LEER],
  baseNavalId: 'b-16',
};

function renderizar(estado?: unknown): void {
  render(
    <MemoryRouter
      initialEntries={[{ pathname: '/auth/login', state: estado }]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/criminales" element={<p>Pantalla de criminales</p>} />
        <Route path="/operativos/7" element={<p>Operativo 7</p>} />
        <Route path="/operativos" element={<p>Tablero de operativos</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function escribirCredenciales(email: string, password: string): Promise<void> {
  const usuario = userEvent.setup();
  await usuario.type(screen.getByLabelText('Correo institucional'), email);
  await usuario.type(screen.getByLabelText('Contraseña'), password);
  await usuario.click(screen.getByRole('button', { name: 'Entrar' }));
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('envia el correo sin espacios y la contrasena, y entra al sistema', async () => {
    const login = vi.spyOn(sessionService, 'login').mockResolvedValue(USUARIO);
    renderizar();

    await escribirCredenciales('  capitan@marina.gov ', 'Marina.2026');

    expect(login).toHaveBeenCalledWith('capitan@marina.gov', 'Marina.2026');
    expect(await screen.findByText('Pantalla de criminales')).toBeInTheDocument();
  });

  it('sin destino previo lleva a cada cargo a su pantalla de llegada', async () => {
    vi.spyOn(sessionService, 'login').mockResolvedValue({
      ...USUARIO,
      rol: RolCodigo.COORDINADOR_OPERACIONES,
      permisos: [Permiso.CRIMINALES_LEER, Permiso.OPERATIVOS_LEER],
    });
    renderizar();

    await escribirCredenciales('coordinador_operaciones@marina.gov', 'Marina.2026');

    expect(await screen.findByText('Tablero de operativos')).toBeInTheDocument();
  });

  it('vuelve a la ruta protegida que el usuario intentaba abrir', async () => {
    vi.spyOn(sessionService, 'login').mockResolvedValue(USUARIO);
    renderizar({ redirectTo: '/operativos/7' });

    await escribirCredenciales('capitan@marina.gov', 'Marina.2026');

    expect(await screen.findByText('Operativo 7')).toBeInTheDocument();
  });

  it('ignora un redirectTo externo', async () => {
    vi.spyOn(sessionService, 'login').mockResolvedValue(USUARIO);
    renderizar({ redirectTo: '//sitio-externo.com' });

    await escribirCredenciales('capitan@marina.gov', 'Marina.2026');

    expect(await screen.findByText('Pantalla de criminales')).toBeInTheDocument();
  });

  it('valida los campos antes de enviar y no llama a la API', async () => {
    const login = vi.spyOn(sessionService, 'login');
    renderizar();
    const usuario = userEvent.setup();

    await usuario.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(login).not.toHaveBeenCalled();
    const correo = screen.getByLabelText('Correo institucional');
    expect(correo).toHaveAttribute('aria-invalid', 'true');
    expect(correo).toHaveAccessibleDescription('Escribe tu correo institucional.');
    expect(screen.getByLabelText('Contraseña')).toHaveAccessibleDescription(
      'Escribe tu contraseña.',
    );
    expect(correo).toHaveFocus();
  });

  it('marca un correo con formato invalido', async () => {
    const login = vi.spyOn(sessionService, 'login');
    renderizar();

    await escribirCredenciales('capitan-marina', 'Marina.2026');

    expect(login).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Correo institucional')).toHaveAccessibleDescription(
      /no tiene un formato válido/,
    );
  });

  it('deshabilita el boton mientras envia e impide un segundo envio', async () => {
    let resolver: (u: UsuarioSesion) => void = () => undefined;
    const login = vi.spyOn(sessionService, 'login').mockImplementation(
      () =>
        new Promise<UsuarioSesion>((r) => {
          resolver = r;
        }),
    );
    renderizar();

    await escribirCredenciales('capitan@marina.gov', 'Marina.2026');

    const boton = screen.getByRole('button', { name: 'Verificando credenciales…' });
    expect(boton).toBeDisabled();
    expect(screen.getByLabelText('Correo institucional')).toHaveAttribute('readonly');
    await userEvent.setup().click(boton);
    expect(login).toHaveBeenCalledTimes(1);

    resolver(USUARIO);
    expect(await screen.findByText('Pantalla de criminales')).toBeInTheDocument();
  });

  it('muestra el error de credenciales, borra la contrasena y le devuelve el foco', async () => {
    vi.spyOn(sessionService, 'login').mockRejectedValue(
      new ApiError(401, 'CREDENCIALES_INVALIDAS', 'Correo o contraseña incorrectos.'),
    );
    renderizar();

    await escribirCredenciales('capitan@marina.gov', 'equivocada');

    const alerta = screen.getByRole('alert');
    expect(await within(alerta).findByText('Correo o contraseña incorrectos.')).toBeVisible();
    expect(within(alerta).getByText(/la cuenta se bloquea/)).toBeInTheDocument();
    const password = screen.getByLabelText('Contraseña');
    expect(password).toHaveValue('');
    expect(password).toHaveFocus();
    expect(screen.getByLabelText('Correo institucional')).toHaveValue('capitan@marina.gov');
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled();
  });

  it('distingue la cuenta bloqueada', async () => {
    vi.spyOn(sessionService, 'login').mockRejectedValue(
      new ApiError(400, 'CUENTA_BLOQUEADA', 'La cuenta esta bloqueada por intentos fallidos.'),
    );
    renderizar();

    await escribirCredenciales('capitan@marina.gov', 'Marina.2026');

    const alerta = screen.getByRole('alert');
    expect(await within(alerta).findByText('Cuenta bloqueada')).toBeInTheDocument();
    expect(within(alerta).getByText(/administrador de usuarios/)).toBeInTheDocument();
  });

  it('ante un fallo de red conserva lo escrito para reintentar', async () => {
    vi.spyOn(sessionService, 'login').mockRejectedValue(
      new ApiError(0, 'SIN_CONEXION', 'Sin conexion con el servidor.'),
    );
    renderizar();

    await escribirCredenciales('capitan@marina.gov', 'Marina.2026');

    expect(
      await within(screen.getByRole('alert')).findByText('Sin conexión con el servidor'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Correo institucional')).toHaveValue('capitan@marina.gov');
    expect(screen.getByLabelText('Contraseña')).toHaveValue('Marina.2026');
  });

  it('limpia el error anterior al reintentar', async () => {
    const login = vi
      .spyOn(sessionService, 'login')
      .mockRejectedValueOnce(new ApiError(0, 'SIN_CONEXION', 'Sin conexion con el servidor.'))
      .mockResolvedValueOnce(USUARIO);
    renderizar();

    await escribirCredenciales('capitan@marina.gov', 'Marina.2026');
    await screen.findByText('Sin conexión con el servidor');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(login).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Pantalla de criminales')).toBeInTheDocument();
  });

  it('permite mostrar y ocultar la contrasena', async () => {
    renderizar();
    const usuario = userEvent.setup();
    const password = screen.getByLabelText('Contraseña');
    expect(password).toHaveAttribute('type', 'password');

    await usuario.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(password).toHaveAttribute('type', 'text');

    await usuario.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(password).toHaveAttribute('type', 'password');
  });
});
