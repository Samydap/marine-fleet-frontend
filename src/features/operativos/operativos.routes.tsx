import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RequirePermiso } from '@core/guards/RequirePermiso';
import { Permiso } from '@core/session/permiso.enum';
import { conSuspense } from '@shared/ui/conSuspense';

const OperativosPage = lazy(() =>
  import('./pages/OperativosPage').then((m) => ({ default: m.OperativosPage })),
);

/** RF-4 Coordinacion de operativos · Dueno: Dev 6. */
export const operativosRoutes: RouteObject[] = [
  { index: true, element: conSuspense(<OperativosPage />) },
  {
    path: 'nuevo',
    element: <RequirePermiso permisos={[Permiso.OPERATIVOS_COORDINAR]} />,
    children: [{ index: true, element: conSuspense(<OperativosPage />) }],
  },
  { path: ':id', element: conSuspense(<OperativosPage />) },
];
