import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RequirePermiso } from '@core/guards/RequirePermiso';
import { Permiso } from '@core/session/permiso.enum';
import { conSuspense } from '@shared/ui/conSuspense';

const AvistamientosPage = lazy(() =>
  import('./pages/AvistamientosPage').then((m) => ({ default: m.AvistamientosPage })),
);
const ReportesPage = lazy(() =>
  import('./pages/ReportesPage').then((m) => ({ default: m.ReportesPage })),
);

/** RF-3 Centro de inteligencia · Dueno: Dev 5. */
export const inteligenciaRoutes: RouteObject[] = [
  { index: true, element: conSuspense(<AvistamientosPage />, 'Cargando archivo…') },
  {
    path: 'reportes',
    element: <RequirePermiso permisos={[Permiso.INTELIGENCIA_REVISAR_REPORTES]} />,
    children: [{ index: true, element: conSuspense(<ReportesPage />) }],
  },
];
