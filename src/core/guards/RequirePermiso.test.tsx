import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { Permiso, RolCodigo, type UsuarioSesion } from '../session/permiso.enum';
import { useSessionStore } from '../session/session.store';
import { RequirePermiso } from './RequirePermiso';

const CAPITAN: UsuarioSesion = {
  id: 'u-capitan',
  email: 'capitan@marina.gov',
  nombreCompleto: 'Capitán de la Base 153',
  rol: RolCodigo.CAPITAN,
  permisos: [Permiso.CRIMINALES_LEER, Permiso.OPERATIVOS_LEER],
  baseNavalId: 'b-153',
};

function renderizar(permisos: Permiso[]): void {
  render(
    <MemoryRouter
      initialEntries={['/admin/bitacora']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route
          path="/admin/bitacora"
          element={<RequirePermiso permisos={permisos} recurso="la bitácora de auditoría" />}
        >
          <Route index element={<p>Contenido protegido</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequirePermiso', () => {
  beforeEach(() => {
    useSessionStore.getState().setUsuario(CAPITAN);
  });

  it('con alguno de los permisos pinta la ruta hija', () => {
    renderizar([Permiso.AUDITORIA_LEER, Permiso.OPERATIVOS_LEER]);
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('sin permiso explica el motivo en el lugar, nombrando el cargo, y ofrece salida', () => {
    renderizar([Permiso.AUDITORIA_LEER]);
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Tu cargo no tiene acceso a la bitácora de auditoría' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Capitán de Base/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir a mi panel' })).toHaveAttribute(
      'href',
      '/operativos',
    );
  });
});
