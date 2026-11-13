import { createBrowserRouter } from 'react-router-dom';
import { PaginaNoEncontrada } from '@core/guards/PaginaNoEncontrada';
import { RedirigirInicio, SinAcceso } from '@core/guards/RedirigirInicio';
import { RequireAuth } from '@core/guards/RequireAuth';
import { MainLayout } from '@core/layout/MainLayout';

// ---------------------------------------------------------------------------
// ARCHIVO COMPARTIDO POR TODO EL EQUIPO.
//
// UNA LINEA POR FEATURE, EN ORDEN ALFABETICO. Las rutas hijas Y SU GUARD DE
// PERMISO se declaran en el `*.routes.tsx` de cada feature, que es propiedad
// de un solo dueno. Si agregas una pantalla, NO vuelves aqui.
//
// Los permisos de cada feature salen de core/session/navegacion.ts (la misma
// tabla del menu y de la redireccion por rol).
//
// Las paginas se cargan con React.lazy dentro de cada `*.routes.tsx`, asi que
// cada una sigue siendo su propio chunk: el bundle de Carteles no se descarga
// si el usuario entra a Avistamientos.
// ---------------------------------------------------------------------------
import { adminRoutes } from '@features/admin/admin.routes';
import { amenazaRoutes } from '@features/amenaza/amenaza.routes';
import { authRoutes } from '@features/auth/auth.routes';
import { cartelesRoutes } from '@features/carteles/carteles.routes';
import { criminalesRoutes } from '@features/criminales/criminales.routes';
import { incidentesRoutes } from '@features/incidentes/incidentes.routes';
import {
  inteligenciaRoutes,
  reporteCiudadanoRoutes,
} from '@features/inteligencia/inteligencia.routes';
import { operativosRoutes } from '@features/operativos/operativos.routes';
import { recompensasRoutes } from '@features/recompensas/recompensas.routes';

export const router = createBrowserRouter([
  // Rutas publicas: no pasan por RequireAuth ni por el shell.
  { path: '/auth', children: authRoutes },
  { path: '/reportar', children: reporteCiudadanoRoutes },

  {
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        element: <MainLayout />,
        children: [
          // Cada cargo llega a su pantalla (navegacion.ts, INICIO_POR_ROL).
          { index: true, element: <RedirigirInicio /> },

          { path: 'admin', children: adminRoutes },
          { path: 'amenaza', children: amenazaRoutes },
          { path: 'carteles', children: cartelesRoutes },
          { path: 'criminales', children: criminalesRoutes },
          { path: 'incidentes', children: incidentesRoutes },
          { path: 'inteligencia', children: inteligenciaRoutes },
          { path: 'operativos', children: operativosRoutes },
          { path: 'recompensas', children: recompensasRoutes },

          // Un rol sin ninguna seccion visible (matriz RBAC vacia); los demas, a su inicio.
          { path: 'sin-acceso', element: <SinAcceso /> },

          // Cualquier otra direccion: 404 dentro del shell. Sin sesion,
          // RequireAuth lleva primero al login.
          { path: '*', element: <PaginaNoEncontrada /> },
        ],
      },
    ],
  },
]);
