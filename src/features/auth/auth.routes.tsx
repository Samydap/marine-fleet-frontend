import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { conSuspense } from '@shared/ui/conSuspense';

const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const MfaPage = lazy(() => import('./pages/MfaPage').then((m) => ({ default: m.MfaPage })));

/** RF-7 · Dueno: Dev 1. Rutas publicas: no llevan RequireAuth. */
export const authRoutes: RouteObject[] = [
  { index: true, element: <Navigate to="login" replace /> },
  { path: 'login', element: conSuspense(<LoginPage />, 'Abriendo acceso…') },
  { path: 'mfa', element: conSuspense(<MfaPage />) },
];
