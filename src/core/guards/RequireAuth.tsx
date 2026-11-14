import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { sessionService } from '../session/session.service';
import { useEstaAutenticado } from '../session/session.store';

/**
 * Equivalente del authGuard de Angular. Se usa como `element` de la ruta padre,
 * de modo que las rutas hijas no se renderizan si no hay sesion.
 *
 * Si hay token pero no hay estado en memoria (recarga de pagina), intenta
 * rehidratar con GET /auth/me antes de rechazar: sin esto, F5 siempre devuelve
 * al login. Si el access token vencio, sesionInterceptor lo renueva solo.
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
    void sessionService
      .restaurarSesion()
      .catch(() => sessionService.logout())
      .finally(() => {
        if (!cancelado) setRestaurando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [restaurando]);

  if (restaurando) {
    // Sin spinner: una franja con la forma del shell mientras llega /auth/me.
    return (
      <div className="restaurando" role="status" aria-live="polite">
        <span className="restaurando-lateral" aria-hidden="true" />
        <span className="sr-only">Restaurando sesión…</span>
      </div>
    );
  }

  if (!estaAutenticado) {
    const destino = `${location.pathname}${location.search}`;
    return <Navigate to="/auth/login" replace state={{ redirectTo: destino }} />;
  }

  return <Outlet />;
}
