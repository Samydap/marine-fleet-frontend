import { Outlet } from 'react-router-dom';
import type { Permiso } from '../session/permiso.enum';
import { tieneAlguno } from '../session/navegacion';
import { useSessionStore } from '../session/session.store';
import { AccesoDenegado } from './AccesoDenegado';

interface Props {
  /** Basta con uno de ellos. */
  readonly permisos: readonly Permiso[];
  /** Como se nombra lo protegido en el mensaje: "la bitácora de auditoría". */
  readonly recurso?: string;
}

/**
 * Equivalente del roleGuard de Angular (RF-7). Se usa como `element` de una
 * ruta padre: `{ element: <RequirePermiso permisos={[...]} />, children: [...] }`.
 *
 * Al envolver la ruta, el chunk del hijo no se descarga si no hay permiso: el
 * componente lazy solo se solicita cuando llega a renderizarse. Esa era la
 * propiedad util de `canMatch` en Angular y aqui se conserva.
 *
 * Sin permiso pinta AccesoDenegado en el lugar de la pagina (dentro del shell)
 * en vez de redirigir: el usuario entiende por que no ve nada.
 *
 * Esto OCULTA, no autoriza. La decision real la toma el RolesGuard del backend.
 */
export function RequirePermiso({ permisos, recurso }: Props): React.ReactElement {
  const permitido = useSessionStore((s) => tieneAlguno(s.usuario?.permisos, permisos));

  if (!permitido) {
    return <AccesoDenegado recurso={recurso} />;
  }

  return <Outlet />;
}
