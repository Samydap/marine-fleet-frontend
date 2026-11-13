import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RequirePermiso } from '@core/guards/RequirePermiso';
import { permisosDeFeature } from '@core/session/navegacion';
import { Permiso } from '@core/session/permiso.enum';
import { conSuspense } from '@shared/ui/conSuspense';

const RecompensasPage = lazy(() =>
  import('./pages/RecompensasPage').then((m) => ({ default: m.RecompensasPage })),
);
const SolicitudPage = lazy(() =>
  import('./pages/SolicitudPage').then((m) => ({ default: m.SolicitudPage })),
);
const ValidacionPage = lazy(() =>
  import('./pages/ValidacionPage').then((m) => ({ default: m.ValidacionPage })),
);
const ReporteMensualPage = lazy(() =>
  import('./pages/ReporteMensualPage').then((m) => ({ default: m.ReporteMensualPage })),
);

/** RF-1/RF-5 Recompensas: historial, solicitud, validacion de alto rango y reporte por mar. */
export const recompensasRoutes: RouteObject[] = [
  {
    element: (
      <RequirePermiso permisos={permisosDeFeature('recompensas')} recurso="las recompensas" />
    ),
    children: [
      { index: true, element: conSuspense(<RecompensasPage />) },
      {
        path: 'solicitar',
        element: (
          <RequirePermiso
            permisos={[Permiso.RECOMPENSAS_SOLICITAR]}
            recurso="la solicitud de recompensas"
          />
        ),
        children: [{ index: true, element: conSuspense(<SolicitudPage />) }],
      },
      {
        path: 'validacion',
        // Solo quien puede validar: ver politica-validacion.ts en el backend.
        element: (
          <RequirePermiso
            permisos={[Permiso.RECOMPENSAS_VALIDAR]}
            recurso="la validación de recompensas"
          />
        ),
        children: [{ index: true, element: conSuspense(<ValidacionPage />) }],
      },
      {
        path: 'reporte-mensual',
        element: (
          <RequirePermiso permisos={[Permiso.REPORTES_LEER]} recurso="el reporte mensual por mar" />
        ),
        children: [{ index: true, element: conSuspense(<ReporteMensualPage />) }],
      },
    ],
  },
];
