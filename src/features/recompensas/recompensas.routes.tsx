import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RequirePermiso } from '@core/guards/RequirePermiso';
import { Permiso } from '@core/session/permiso.enum';
import { conSuspense } from '@shared/ui/conSuspense';

const RecompensasPage = lazy(() =>
  import('./pages/RecompensasPage').then((m) => ({ default: m.RecompensasPage })),
);

/** RF-1/RF-5 Recompensas · Dueno: Dev 3. */
export const recompensasRoutes: RouteObject[] = [
  { index: true, element: conSuspense(<RecompensasPage />) },
  {
    path: 'validacion',
    // Solo quien puede validar: ver politica-validacion.ts en el backend.
    element: <RequirePermiso permisos={[Permiso.RECOMPENSAS_VALIDAR]} />,
    children: [{ index: true, element: conSuspense(<RecompensasPage />) }],
  },
];
