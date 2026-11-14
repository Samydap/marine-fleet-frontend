import { useNotificationStore } from '../services/notification.store';
import { DenDenMushi } from './emblemas/DenDenMushi';
import { IconoAviso, IconoCerrar } from './iconos-shell';

/**
 * Avisos flotantes (los publica `notificar` desde interceptores y stores).
 * La region existe siempre para que el lector de pantalla los anuncie; los
 * errores se anuncian con prioridad. Los informativos llegan por el Den Den
 * Mushi; exito y error conservan su marca propia para no confundirse.
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
          {nota.tipo === 'info' ? (
            <DenDenMushi className="icono aviso-mushi" estado="vivo" />
          ) : (
            <IconoAviso tipo={nota.tipo} />
          )}
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
