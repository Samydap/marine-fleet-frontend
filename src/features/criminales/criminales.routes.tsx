import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RequirePermiso } from '@core/guards/RequirePermiso';
import { permisosDeFeature } from '@core/session/navegacion';
import { Permiso } from '@core/session/permiso.enum';
import { conSuspense } from '@shared/ui/conSuspense';

const CriminalListPage = lazy(() =>
  import('./pages/CriminalListPage').then((m) => ({ default: m.CriminalListPage })),
);
const CriminalFormPage = lazy(() =>
  import('./pages/CriminalFormPage').then((m) => ({ default: m.CriminalFormPage })),
);
const CriminalDetailPage = lazy(() =>
  import('./pages/CriminalDetailPage').then((m) => ({ default: m.CriminalDetailPage })),
);
const OrganizacionesPage = lazy(() =>
  import('./pages/OrganizacionesPage').then((m) => ({ default: m.OrganizacionesPage })),
);
const OrganizacionDetailPage = lazy(() =>
  import('./pages/OrganizacionDetailPage').then((m) => ({ default: m.OrganizacionDetailPage })),
);

/**
 * ARCHIVO DE RUTAS DE REFERENCIA (RF-1).
 *
 * ESTE es el archivo que se toca al agregar una pantalla, no `app/routes.tsx`.
 * Por eso dos devs que agregan pantallas el mismo dia no colisionan nunca.
 *
 * El guard raiz sale de core/session/navegacion.ts (el mismo permiso que
 * muestra la entrada del menu). Las rutas de escritura llevan su propio guard:
 * si no hay permiso, el componente lazy del hijo ni se solicita.
 */
export const criminalesRoutes: RouteObject[] = [
  {
    element: (
      <RequirePermiso permisos={permisosDeFeature('criminales')} recurso="el archivo criminal" />
    ),
    children: [
      { index: true, element: conSuspense(<CriminalListPage />, 'Consultando el registro…') },
      {
        element: (
          <RequirePermiso
            permisos={[Permiso.CRIMINALES_ESCRIBIR]}
            recurso="el registro de criminales"
          />
        ),
        children: [
          { path: 'nuevo', element: conSuspense(<CriminalFormPage />) },
          { path: ':id/editar', element: conSuspense(<CriminalFormPage />) },
        ],
      },
      // Tripulaciones, organizaciones y bandas (tipo, lider y miembros).
      {
        path: 'organizaciones',
        element: conSuspense(<OrganizacionesPage />, 'Consultando organizaciones…'),
      },
      {
        path: 'organizaciones/:organizacionId',
        element: conSuspense(<OrganizacionDetailPage />, 'Abriendo la organización…'),
      },
      { path: ':id', element: conSuspense(<CriminalDetailPage />, 'Abriendo la ficha…') },
    ],
  },
];
