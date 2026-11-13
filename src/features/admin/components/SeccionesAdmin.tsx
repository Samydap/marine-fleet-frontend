import { Navigate } from 'react-router-dom';
import { Permiso } from '@core/session/permiso.enum';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { PestanasSeccion, type SeccionPestana } from '@shared/ui/PestanasSeccion';

function useSecciones(): SeccionPestana[] {
  const usuarios = useHasPermission(Permiso.USUARIOS_ADMINISTRAR);
  const catalogos = useHasPermission(Permiso.CATALOGOS_ADMINISTRAR);
  const bitacora = useHasPermission(Permiso.AUDITORIA_LEER);
  return [
    ...(usuarios ? [{ a: '/admin/usuarios', etiqueta: 'Usuarios' }] : []),
    ...(catalogos ? [{ a: '/admin/catalogos', etiqueta: 'Mares, zonas y bases' }] : []),
    ...(bitacora ? [{ a: '/admin/bitacora', etiqueta: 'Bitácora' }] : []),
  ];
}

/**
 * Pestanas entre las secciones de Administracion (solo las que el cargo puede
 * abrir). Cada pagina de seccion las pinta debajo de su PageHeader; las fichas
 * (un usuario) no: alli manda el enlace "volver".
 */
export function SeccionesAdmin(): React.ReactElement | null {
  return <PestanasSeccion etiqueta="Secciones de administración" secciones={useSecciones()} />;
}

/** /admin a secas: abre la primera seccion que el cargo puede usar. */
export function AdminInicio(): React.ReactElement {
  const [primera] = useSecciones();
  return <Navigate to={primera?.a ?? '/sin-acceso'} replace />;
}
