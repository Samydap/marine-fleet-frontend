import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RequirePermiso } from '@core/guards/RequirePermiso';
import { permisosDeFeature } from '@core/session/navegacion';
import { Permiso } from '@core/session/permiso.enum';
import { conSuspense } from '@shared/ui/conSuspense';

const IncidentesPage = lazy(() =>
  import('./pages/IncidentesPage').then((m) => ({ default: m.IncidentesPage })),
);
const IncidenteFormPage = lazy(() =>
  import('./pages/IncidenteFormPage').then((m) => ({ default: m.IncidenteFormPage })),
);
const IncidenteDetailPage = lazy(() =>
  import('./pages/IncidenteDetailPage').then((m) => ({ default: m.IncidenteDetailPage })),
);

/** RF-6 Historial de incidentes y enfrentamientos. */
export const incidentesRoutes: RouteObject[] = [
  {
    element: <RequirePermiso permisos={permisosDeFeature('incidentes')} recurso="los incidentes" />,
    children: [
      { index: true, element: conSuspense(<IncidentesPage />, 'Cargando incidentes…') },
      {
        path: 'nuevo',
        element: (
          <RequirePermiso
            permisos={[Permiso.INCIDENTES_ESCRIBIR]}
            recurso="el registro de incidentes"
          />
        ),
        children: [{ index: true, element: conSuspense(<IncidenteFormPage />) }],
      },
      { path: ':id', element: conSuspense(<IncidenteDetailPage />, 'Cargando incidente…') },
    ],
  },
];
