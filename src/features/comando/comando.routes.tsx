import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { conSuspense } from '@shared/ui/conSuspense';

const CentroComandoPage = lazy(() =>
  import('./pages/CentroComandoPage').then((m) => ({ default: m.CentroComandoPage })),
);

/**
 * Centro de Comando "Marine Fleet & Bounty HQ": tablero a pantalla completa.
 * Se monta bajo RequireAuth pero FUERA del shell, porque trae su propia
 * cabecera. Sus datos son de muestra, asi que no exige un permiso concreto.
 */
export const comandoRoutes: RouteObject[] = [
  { index: true, element: conSuspense(<CentroComandoPage />, 'Abriendo el centro de comando…') },
];
