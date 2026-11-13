import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RequirePermiso } from '@core/guards/RequirePermiso';
import { permisosDeFeature } from '@core/session/navegacion';
import { Permiso } from '@core/session/permiso.enum';
import { conSuspense } from '@shared/ui/conSuspense';
import { AdminInicio } from './components/SeccionesAdmin';
import './admin.css';

const UsuariosPage = lazy(() =>
  import('./pages/UsuariosPage').then((m) => ({ default: m.UsuariosPage })),
);
const UsuarioFormPage = lazy(() =>
  import('./pages/UsuarioFormPage').then((m) => ({ default: m.UsuarioFormPage })),
);
const CatalogosPage = lazy(() =>
  import('./pages/CatalogosPage').then((m) => ({ default: m.CatalogosPage })),
);
const BitacoraPage = lazy(() =>
  import('./pages/BitacoraPage').then((m) => ({ default: m.BitacoraPage })),
);

/**
 * RF-7 Administracion: usuarios por base, catalogo geografico y bitacora.
 *
 * El guard raiz usa la entrada de core/session/navegacion.ts: si cambias el
 * permiso de la feature, cambialo alli (menu, inicio por rol y guard a la vez).
 */
export const adminRoutes: RouteObject[] = [
  {
    element: <RequirePermiso permisos={permisosDeFeature('admin')} recurso="Administración" />,
    children: [
      { index: true, element: <AdminInicio /> },
      {
        path: 'usuarios',
        element: (
          <RequirePermiso
            permisos={[Permiso.USUARIOS_ADMINISTRAR]}
            recurso="la gestión de usuarios"
          />
        ),
        children: [
          { index: true, element: conSuspense(<UsuariosPage />) },
          { path: 'nuevo', element: conSuspense(<UsuarioFormPage key="alta" />) },
          { path: ':id', element: conSuspense(<UsuarioFormPage key="ficha" />) },
        ],
      },
      {
        path: 'catalogos',
        element: (
          <RequirePermiso
            permisos={[Permiso.CATALOGOS_ADMINISTRAR]}
            recurso="el catálogo de mares, zonas y bases"
          />
        ),
        children: [{ index: true, element: conSuspense(<CatalogosPage />) }],
      },
      {
        path: 'bitacora',
        element: (
          <RequirePermiso permisos={[Permiso.AUDITORIA_LEER]} recurso="la bitácora de auditoría" />
        ),
        children: [{ index: true, element: conSuspense(<BitacoraPage />) }],
      },
    ],
  },
];
