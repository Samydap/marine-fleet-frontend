import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { conSuspense } from '@shared/ui/conSuspense';

const CartelesPage = lazy(() =>
  import('./pages/CartelesPage').then((m) => ({ default: m.CartelesPage })),
);

/** RF-2 Generacion automatica de carteles · Dueno: Dev 4. */
export const cartelesRoutes: RouteObject[] = [
  { index: true, element: conSuspense(<CartelesPage />) },
  { path: ':criminalId', element: conSuspense(<CartelesPage />) },
];
