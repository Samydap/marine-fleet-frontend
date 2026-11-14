import { leerInstantanea } from '@shared/utils/cartel';
import type { Cartel } from '../models/cartel';

/**
 * Recompensa de la version inmediatamente anterior a `actual`, si fue otra.
 * `null` cuando no hay version anterior o el monto no cambio: no hay nada
 * que tachar.
 */
export function montoAnterior(
  versiones: readonly Cartel[],
  actual: Cartel,
  criminalId: string,
): number | null {
  const previa = versiones
    .filter((v) => v.numeroVersion < actual.numeroVersion)
    .reduce<Cartel | null>(
      (mejor, v) => (!mejor || v.numeroVersion > mejor.numeroVersion ? v : mejor),
      null,
    );
  if (!previa) return null;
  const antes = leerInstantanea(previa.datos, criminalId).recompensa;
  const ahora = leerInstantanea(actual.datos, criminalId).recompensa;
  return antes !== null && antes !== ahora ? antes : null;
}
