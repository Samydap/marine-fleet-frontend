import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RequirePermiso } from '@core/guards/RequirePermiso';
import { permisosDeFeature } from '@core/session/navegacion';
import { Permiso } from '@core/session/permiso.enum';
import { conSuspense } from '@shared/ui/conSuspense';

const DistribucionPage = lazy(() =>
  import('./pages/DistribucionPage').then((m) => ({ default: m.DistribucionPage })),
);
const TendenciasPage = lazy(() =>
  import('./pages/TendenciasPage').then((m) => ({ default: m.TendenciasPage })),
);
const CriteriosPage = lazy(() =>
  import('./pages/CriteriosPage').then((m) => ({ default: m.CriteriosPage })),
);

/**
 * RF-5 Analisis de amenaza: distribucion, tendencias y criterios.
 *
 * `criterios` NO lleva guard propio: consultarlos exige solo CRIMINALES_LEER.
 * EDITARLOS lo decide el backend por ROL (solo el Analista; ni el ALL del
 * Almirante abre): la pagina lo oculta con
 * `useEsRol(RolCodigo.ANALISTA_DATOS_CRIMINALES)`.
 */
export const amenazaRoutes: RouteObject[] = [
  {
    element: (
      <RequirePermiso permisos={permisosDeFeature('amenaza')} recurso="el análisis de amenaza" />
    ),
    children: [
      { index: true, element: conSuspense(<DistribucionPage />) },
      {
        path: 'tendencias',
        // GET /reportes/tendencias exige REPORTES_LEER.
        element: <RequirePermiso permisos={[Permiso.REPORTES_LEER]} recurso="las tendencias" />,
        children: [{ index: true, element: conSuspense(<TendenciasPage />) }],
      },
      { path: 'criterios', element: conSuspense(<CriteriosPage />) },
    ],
  },
];
