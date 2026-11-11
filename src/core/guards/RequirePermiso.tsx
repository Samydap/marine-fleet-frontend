import { Navigate, Outlet } from 'react-router-dom';
import type { Permiso } from '../session/permiso.enum';
import { tieneAlgunPermisoActual } from '../session/session.store';

interface Props {
  readonly permisos: readonly Permiso[];
}

/**
 * Equivalente del roleGuard de Angular (RF-7). Se usa como `element` de una
 * ruta padre: `{ element: <RequirePermiso permisos={[...]} />, children: [...] }`.
 *
 * Al envolver la ruta, el chunk del hijo no se descarga si no hay permiso: el
 * componente lazy solo se solicita cuando llega a renderizarse. Esa era la
 * propiedad util de `canMatch` en Angular y aqui se conserva.
 *
 * Esto OCULTA, no autoriza. La decision real la toma el RolesGuard del backend.
 */
export function RequirePermiso({ permisos }: Props): React.ReactElement {
  if (!tieneAlgunPermisoActual(permisos)) {
    return <Navigate to="/criminales" replace state={{ error: 'sin-permiso' }} />;
  }

  return <Outlet />;
}
