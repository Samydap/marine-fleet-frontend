import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RequirePermiso } from '@core/guards/RequirePermiso';
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

/**
 * ARCHIVO DE RUTAS DE REFERENCIA (RF-1). Dueno: Dev 2.
 *
 * ESTE es el archivo que se toca al agregar una pantalla, no `app/routes.tsx`.
 * Por eso dos devs que agregan pantallas el mismo dia no colisionan nunca.
 *
 * El permiso se aplica envolviendo la ruta con RequirePermiso: si no hay
 * permiso, el componente lazy del hijo ni se solicita.
 */
export const criminalesRoutes: RouteObject[] = [
  { index: true, element: conSuspense(<CriminalListPage />, 'Consultando el registro…') },
  {
    path: 'nuevo',
    element: <RequirePermiso permisos={[Permiso.CRIMINALES_ESCRIBIR]} />,
    children: [{ index: true, element: conSuspense(<CriminalFormPage />) }],
  },
  { path: ':id', element: conSuspense(<CriminalDetailPage />) },
];
