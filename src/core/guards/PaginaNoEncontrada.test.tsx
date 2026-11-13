import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { Permiso, RolCodigo, type UsuarioSesion } from '../session/permiso.enum';
import { useSessionStore } from '../session/session.store';
import { AccesoDenegado } from './AccesoDenegado';
import { PaginaNoEncontrada } from './PaginaNoEncontrada';

function usuario(rol: RolCodigo, permisos: Permiso[]): UsuarioSesion {
  return {
    id: `u-${rol}`,
    email: 'oficial@marina.gov',
    nombreCompleto: 'Oficial de guardia',
    rol,
    permisos,
    baseNavalId: rol === RolCodigo.ALMIRANTE ? null : 'b-153',
  };
}

function pintar(elemento: React.ReactElement, ruta = '/'): HTMLElement {
  const { container } = render(
    <MemoryRouter
      initialEntries={[ruta]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      {elemento}
    </MemoryRouter>,
  );
  return container;
}

afterEach(() => {
  useSessionStore.setState({ usuario: null });
});

describe('PaginaNoEncontrada', () => {
  it('nombra el 404, muestra la ruta pedida y lleva al panel del cargo', () => {
    useSessionStore.setState({
      usuario: usuario(RolCodigo.CAPITAN, [Permiso.OPERATIVOS_LEER]),
    });
    pintar(<PaginaNoEncontrada />, '/criminales/no-existe');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Esta página no existe');
    expect(screen.getByText('/criminales/no-existe')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir a mi panel' })).toHaveAttribute(
      'href',
      '/operativos',
    );
  });

  it('sin secciones disponibles para el cargo no ofrece ir al panel', () => {
    useSessionStore.setState({ usuario: usuario(RolCodigo.CAPITAN, []) });
    pintar(<PaginaNoEncontrada />, '/x');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Esta página no existe');
    expect(screen.queryByRole('link', { name: 'Ir a mi panel' })).not.toBeInTheDocument();
  });
});

describe('insignias de las pantallas de aviso', () => {
  it('el 正義 va en blanco (navy sobre el papel) para un cargo que no es Almirante', () => {
    useSessionStore.setState({
      usuario: usuario(RolCodigo.CAPITAN, [Permiso.CRIMINALES_LEER]),
    });
    const container = pintar(<AccesoDenegado recurso="la bitácora de auditoría" />);

    const sello = container.querySelector('.sello-justicia');
    expect(sello).toHaveAttribute('data-tono', 'blanco');
    expect(sello).toHaveAttribute('data-tamano', 'lg');
    expect(sello).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.emblema-gaviota')).toHaveAttribute('focusable', 'false');
  });

  it('el 正義 va en dorado solo para el Almirante', () => {
    useSessionStore.setState({ usuario: usuario(RolCodigo.ALMIRANTE, [Permiso.TODO]) });
    const container = pintar(<PaginaNoEncontrada />, '/x');

    expect(container.querySelector('.sello-justicia')).toHaveAttribute('data-tono', 'dorado');
  });
});
