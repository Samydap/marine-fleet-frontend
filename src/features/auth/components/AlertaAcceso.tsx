import type { FalloAcceso } from '../models/fallo-acceso';
import { IconoAlerta, IconoCandado, IconoSinSenal } from './iconos';

interface Props {
  readonly fallo: FalloAcceso | null;
}

const ICONO = {
  credenciales: IconoAlerta,
  cuenta: IconoCandado,
  conexion: IconoSinSenal,
} as const;

/**
 * Region de errores del acceso. El contenedor con role="alert" existe siempre
 * en el DOM: asi el lector de pantalla anuncia el mensaje en cuanto aparece,
 * algo que no ocurre de forma fiable si la region se monta junto con el texto.
 */
export function AlertaAcceso({ fallo }: Props): React.ReactElement {
  const Icono = fallo ? ICONO[fallo.tipo] : null;

  return (
    <div className="acceso-alerta-region" role="alert">
      {fallo && Icono && (
        <div className={`acceso-alerta acceso-alerta--${fallo.tipo}`}>
          <Icono />
          <div>
            <p className="acceso-alerta-titulo">{fallo.titulo}</p>
            <p className="acceso-alerta-detalle">{fallo.detalle}</p>
          </div>
        </div>
      )}
    </div>
  );
}
