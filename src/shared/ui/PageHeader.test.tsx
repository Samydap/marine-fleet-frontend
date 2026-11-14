import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { Permiso, RolCodigo, type UsuarioSesion } from '@core/session/permiso.enum';
import { useSessionStore } from '@core/session/session.store';
import { PageHeader } from './PageHeader';

const ALMIRANTE: UsuarioSesion = {
  id: 'u-almirante',
  email: 'almirante@marina.gov',
  nombreCompleto: 'Almirante de la Flota',
  rol: RolCodigo.ALMIRANTE,
  permisos: [Permiso.TODO],
  baseNavalId: null,
};

const CAPITAN: UsuarioSesion = {
  id: 'u-capitan',
  email: 'capitan@marina.gov',
  nombreCompleto: 'Capitán de la Base 153',
  rol: RolCodigo.CAPITAN,
  permisos: [Permiso.CRIMINALES_LEER],
  baseNavalId: 'b-153',
};

function renderizar(): HTMLElement {
  const { container } = render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <PageHeader titulo="Criminales" descripcion="Fichas de los buscados por la Marina." />
    </MemoryRouter>,
  );
  return container;
}

describe('PageHeader', () => {
  afterEach(() => {
    useSessionStore.getState().limpiar();
  });

  it('el sello 正義 es dorado para el Almirante', () => {
    useSessionStore.getState().setUsuario(ALMIRANTE);
    const container = renderizar();
    expect(container.querySelector('[data-tono="dorado"]')).not.toBeNull();
  });

  it('el sello 正義 es blanco para un Capitán', () => {
    useSessionStore.getState().setUsuario(CAPITAN);
    const container = renderizar();
    expect(container.querySelector('[data-tono="blanco"]')).not.toBeNull();
    expect(container.querySelector('[data-tono="dorado"]')).toBeNull();
  });

  it('el título sigue siendo el h1 accesible', () => {
    useSessionStore.getState().setUsuario(CAPITAN);
    renderizar();
    expect(screen.getByRole('heading', { level: 1, name: 'Criminales' })).toBeInTheDocument();
  });

  it('el sello es decorativo: no aporta texto al lector de pantalla', () => {
    useSessionStore.getState().setUsuario(CAPITAN);
    const container = renderizar();
    const sello = container.querySelector('[data-tono]');
    expect(sello).toHaveAttribute('aria-hidden', 'true');
  });
});
