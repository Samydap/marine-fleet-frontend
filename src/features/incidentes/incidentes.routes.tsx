import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RequirePermiso } from '@core/guards/RequirePermiso';
import { Permiso } from '@core/session/permiso.enum';
import { conSuspense } from '@shared/ui/conSuspense';

const IncidentesPage = lazy(() =>
  import('./pages/IncidentesPage').then((m) => ({ default: m.IncidentesPage })),
);

/** RF-6 Historial de incidentes y enfrentamientos · Dueno: Dev 6. */
export const incidentesRoutes: RouteObject[] = [
  { index: true, element: conSuspense(<IncidentesPage />) },
  {
    path: 'nuevo',
    element: <RequirePermiso permisos={[Permiso.INCIDENTES_ESCRIBIR]} />,
    children: [{ index: true, element: conSuspense(<IncidentesPage />) }],
  },
];
