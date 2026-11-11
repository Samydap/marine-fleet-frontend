import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { sessionService } from '../session/session.service';
import { useEstaAutenticado } from '../session/session.store';

/**
 * Equivalente del authGuard de Angular. Se usa como `element` de la ruta padre,
 * de modo que las rutas hijas no se renderizan si no hay sesion.
 *
 * Si hay token pero no hay estado en memoria (recarga de pagina), intenta
 * rehidratar antes de rechazar: sin esto, F5 siempre devuelve al login.
 */
export function RequireAuth(): React.ReactElement {
  const estaAutenticado = useEstaAutenticado();
  const location = useLocation();
  const [restaurando, setRestaurando] = useState(
    () => !estaAutenticado && sessionService.hayToken(),
  );

  useEffect(() => {
    if (!restaurando) return;

    let cancelado = false;
    // void: el resultado no interesa aqui; si falla, el estado queda sin usuario
    // y el propio guard redirige al login.
    void sessionService.restaurarSesion().finally(() => {
      if (!cancelado) setRestaurando(false);
    });

    return () => {
      cancelado = true;
    };
  }, [restaurando]);

  if (restaurando) {
    return (
      <div className="empty-state">
        <div className="loader" />
        <strong>Restaurando sesión…</strong>
      </div>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/auth/login" replace state={{ redirectTo: location.pathname }} />;
  }

  return <Outlet />;
}
