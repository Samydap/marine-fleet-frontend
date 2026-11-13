import { useNotificationStore } from '../services/notification.store';
import { IconoAviso, IconoCerrar } from './iconos-shell';

/**
 * Avisos flotantes (los publica `notificar` desde interceptores y stores).
 * La region existe siempre para que el lector de pantalla los anuncie; los
 * errores se anuncian con prioridad.
 */
export function Avisos(): React.ReactElement {
  const notificaciones = useNotificationStore((s) => s.notificaciones);
  const descartar = useNotificationStore((s) => s.descartar);

  return (
    <div className="avisos" aria-live="polite" aria-relevant="additions">
      {notificaciones.map((nota) => (
        <div
          key={nota.id}
          className={`aviso aviso--${nota.tipo}`}
          role={nota.tipo === 'error' ? 'alert' : undefined}
        >
          <IconoAviso tipo={nota.tipo} />
          <p>{nota.mensaje}</p>
          <button
            type="button"
            className="aviso-cerrar"
            aria-label="Cerrar aviso"
            onClick={() => descartar(nota.id)}
          >
            <IconoCerrar tamano={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
