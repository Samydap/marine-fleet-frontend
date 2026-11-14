import { useAhora } from '@shared/hooks/useAhora';
import {
  aIso,
  formatearFecha,
  segundosDesde,
  tiempoRelativo,
  type FechaEntrada,
} from '@shared/utils/fecha';

interface Props {
  /** `updatedAt` del registro, o la hora de la ultima consulta. */
  readonly fecha: FechaEntrada;
  /** Texto antes del tiempo. "Actualizado" -> "Actualizado hace 3 min". */
  readonly prefijo?: string;
  /** Quien hizo el cambio, si el backend lo da ("por Capitán Smoker"). */
  readonly autor?: string | null;
  /**
   * Segundos a partir de los cuales el dato se marca como posiblemente viejo
   * (texto en tono de aviso). Por defecto, nunca.
   */
  readonly umbralViejo?: number;
}

/**
 * "Actualizado hace…" para datos que se sincronizan entre bases. Se refresca
 * solo (reloj compartido de 15 s) y lleva la fecha exacta en `title` y en
 * `<time dateTime>`.
 *
 *   <ActualizadoHace fecha={operativo.updatedAt} />
 *   <ActualizadoHace fecha={consultadoEn} prefijo="Consultado" umbralViejo={300} />
 */
export function ActualizadoHace({
  fecha,
  prefijo = 'Actualizado',
  autor,
  umbralViejo,
}: Props): React.ReactElement {
  const ahora = new Date(useAhora());
  const relativo = tiempoRelativo(fecha, ahora);
  const segundos = segundosDesde(fecha, ahora);
  const viejo = umbralViejo !== undefined && segundos !== null && segundos > umbralViejo;

  return (
    <span className={viejo ? 'actualizado actualizado--viejo' : 'actualizado'}>
      {prefijo}{' '}
      <time dateTime={aIso(fecha)} title={formatearFecha(fecha)}>
        {relativo}
      </time>
      {autor ? ` por ${autor}` : null}
    </span>
  );
}
