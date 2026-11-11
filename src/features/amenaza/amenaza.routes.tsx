import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RequirePermiso } from '@core/guards/RequirePermiso';
import { Permiso } from '@core/session/permiso.enum';
import { conSuspense } from '@shared/ui/conSuspense';

const AmenazaPage = lazy(() =>
  import('./pages/AmenazaPage').then((m) => ({ default: m.AmenazaPage })),
);

/** RF-5 Analisis y clasificacion de amenaza · Dueno: Dev 3. */
export const amenazaRoutes: RouteObject[] = [
  { index: true, element: conSuspense(<AmenazaPage />) },
  {
    path: 'criterios',
    element: <RequirePermiso permisos={[Permiso.AMENAZA_CONFIGURAR_CRITERIOS]} />,
    children: [{ index: true, element: conSuspense(<AmenazaPage />) }],
  },
];
