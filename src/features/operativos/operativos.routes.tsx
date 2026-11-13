import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RequirePermiso } from '@core/guards/RequirePermiso';
import { permisosDeFeature } from '@core/session/navegacion';
import { Permiso } from '@core/session/permiso.enum';
import { conSuspense } from '@shared/ui/conSuspense';

const TableroPage = lazy(() =>
  import('./pages/TableroPage').then((m) => ({ default: m.TableroPage })),
);
const OperativoFormPage = lazy(() =>
  import('./pages/OperativoFormPage').then((m) => ({ default: m.OperativoFormPage })),
);
const OperativoDetailPage = lazy(() =>
  import('./pages/OperativoDetailPage').then((m) => ({ default: m.OperativoDetailPage })),
);

/**
 * RF-4 Operativos: tablero de despliegue, alta y ficha.
 * Los cambios de otras bases llegan por useCambiosSincronizados (core/sync).
 */
export const operativosRoutes: RouteObject[] = [
  {
    element: <RequirePermiso permisos={permisosDeFeature('operativos')} recurso="los operativos" />,
    children: [
      { index: true, element: conSuspense(<TableroPage />) },
      {
        path: 'nuevo',
        element: (
          <RequirePermiso
            permisos={[Permiso.OPERATIVOS_COORDINAR]}
            recurso="la creación de operativos"
          />
        ),
        children: [{ index: true, element: conSuspense(<OperativoFormPage />) }],
      },
      { path: ':id', element: conSuspense(<OperativoDetailPage />) },
    ],
  },
];
