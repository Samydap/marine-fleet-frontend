import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RequirePermiso } from '@core/guards/RequirePermiso';
import { Permiso } from '@core/session/permiso.enum';
import { conSuspense } from '@shared/ui/conSuspense';

const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));

/** RF-7 Administracion de usuarios, roles y bitacora · Dueno: Dev 1. */
export const adminRoutes: RouteObject[] = [
  { index: true, element: conSuspense(<AdminPage />) },
  {
    path: 'bitacora',
    element: <RequirePermiso permisos={[Permiso.AUDITORIA_LEER]} />,
    children: [{ index: true, element: conSuspense(<AdminPage />) }],
  },
];
