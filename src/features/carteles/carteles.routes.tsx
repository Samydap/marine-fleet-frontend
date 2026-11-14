import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RequirePermiso } from '@core/guards/RequirePermiso';
import { permisosDeFeature } from '@core/session/navegacion';
import { conSuspense } from '@shared/ui/conSuspense';

const CartelesPage = lazy(() =>
  import('./pages/CartelesPage').then((m) => ({ default: m.CartelesPage })),
);
const CartelPage = lazy(() =>
  import('./pages/CartelPage').then((m) => ({ default: m.CartelPage })),
);

/**
 * RF-2 Carteles WANTED: el tablon (galeria) y la vista de un cartel con sus
 * versiones. Generar a mano exige CARTELES_GENERAR: se oculta con
 * useHasPermission y lo decide el backend.
 */
export const cartelesRoutes: RouteObject[] = [
  {
    element: <RequirePermiso permisos={permisosDeFeature('carteles')} recurso="los carteles" />,
    children: [
      { index: true, element: conSuspense(<CartelesPage />, 'Consultando el tablón…') },
      { path: ':criminalId', element: conSuspense(<CartelPage />, 'Abriendo el cartel…') },
    ],
  },
];
