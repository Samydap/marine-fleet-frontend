import { Outlet } from 'react-router-dom';
import { useLoadingStore } from '../services/loading.store';
import { useNotificationStore } from '../services/notification.store';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

/**
 * Shell de la aplicacion. Es el padre de TODAS las features, asi que cada una
 * se monta en el <Outlet /> sin preocuparse por la navegacion, el indicador de
 * carga ni las notificaciones.
 */
export function MainLayout(): React.ReactElement {
  const cargando = useLoadingStore((s) => s.enVuelo > 0);
  const notificaciones = useNotificationStore((s) => s.notificaciones);
  const descartar = useNotificationStore((s) => s.descartar);

  return (
    <div className="app-shell">
      {cargando && <div className="barra-carga" role="progressbar" aria-label="Cargando" />}

      <Header />

      <div className="cuerpo">
        <Sidebar />
        <main className="contenido">
          <Outlet />
        </main>
      </div>

      <div className="notificaciones" aria-live="polite">
        {notificaciones.map((nota) => (
          <div key={nota.id} className={`nota nota--${nota.tipo}`}>
            <p>{nota.mensaje}</p>
            <button type="button" aria-label="Cerrar aviso" onClick={() => descartar(nota.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
