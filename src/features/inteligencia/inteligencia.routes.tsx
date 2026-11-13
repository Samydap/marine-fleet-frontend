import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RequirePermiso } from '@core/guards/RequirePermiso';
import { permisosDeFeature } from '@core/session/navegacion';
import { conSuspense } from '@shared/ui/conSuspense';

const AvistamientosPage = lazy(() =>
  import('./pages/AvistamientosPage').then((m) => ({ default: m.AvistamientosPage })),
);
const ReportesPage = lazy(() =>
  import('./pages/ReportesPage').then((m) => ({ default: m.ReportesPage })),
);
const ReporteCiudadanoPage = lazy(() =>
  import('./pages/ReporteCiudadanoPage').then((m) => ({ default: m.ReporteCiudadanoPage })),
);

/**
 * RF-3 Centro de inteligencia (Cipher Pol): avistamientos y reportes.
 *
 * La bandeja de reportes se puede CONSULTAR con INTELIGENCIA_LEER (GET
 * /reportes-ciudadanos); aprobar o rechazar exige
 * INTELIGENCIA_REVISAR_REPORTES y se oculta con useHasPermission.
 */
export const inteligenciaRoutes: RouteObject[] = [
  {
    element: (
      <RequirePermiso
        permisos={permisosDeFeature('inteligencia')}
        recurso="el centro de inteligencia"
      />
    ),
    children: [
      { index: true, element: conSuspense(<AvistamientosPage />, 'Cargando archivo…') },
      { path: 'reportes', element: conSuspense(<ReportesPage />, 'Cargando reportes…') },
    ],
  },
];

/**
 * Formulario PUBLICO de reporte ciudadano (POST /reportes-ciudadanos es
 * @Public con limite por IP). Se monta en `/reportar`, FUERA de RequireAuth y
 * del shell: lo usan ciudadanos e informantes sin cuenta. La pantalla no debe
 * usar nada que exija sesion.
 */
export const reporteCiudadanoRoutes: RouteObject[] = [
  { index: true, element: conSuspense(<ReporteCiudadanoPage />) },
];
