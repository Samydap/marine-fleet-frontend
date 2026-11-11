import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RequireAuth } from '@core/guards/RequireAuth';
import { RequirePermiso } from '@core/guards/RequirePermiso';
import { MainLayout } from '@core/layout/MainLayout';
import { Permiso } from '@core/session/permiso.enum';

// ---------------------------------------------------------------------------
// ARCHIVO COMPARTIDO POR LOS SEIS DESARROLLADORES.
//
// UNA LINEA POR FEATURE, EN ORDEN ALFABETICO. Las rutas hijas se declaran en el
// `*.routes.tsx` de cada feature, que es propiedad de un solo dueno. Si agregas
// una pantalla, NO vuelves aqui.
//
// Las nueve entradas se declararon el dia 1 del Sprint 1 para que este archivo
// practicamente no vuelva a cambiar. Si aparece un conflicto, se aceptan ambos
// lados.
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
import { inteligenciaRoutes } from '@features/inteligencia/inteligencia.routes';
import { operativosRoutes } from '@features/operativos/operativos.routes';
import { recompensasRoutes } from '@features/recompensas/recompensas.routes';

export const router = createBrowserRouter([
  // Rutas publicas: no pasan por RequireAuth.
  { path: '/auth', children: authRoutes },

  {
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/criminales" replace /> },

          {
            path: 'admin',
            element: <RequirePermiso permisos={[Permiso.USUARIOS_ADMINISTRAR]} />,
            children: adminRoutes,
          },
          { path: 'amenaza', children: amenazaRoutes },
          { path: 'carteles', children: cartelesRoutes },
          { path: 'criminales', children: criminalesRoutes },
          { path: 'incidentes', children: incidentesRoutes },
          { path: 'inteligencia', children: inteligenciaRoutes },
          { path: 'operativos', children: operativosRoutes },
          { path: 'recompensas', children: recompensasRoutes },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
]);
