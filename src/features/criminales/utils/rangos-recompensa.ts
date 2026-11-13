/**
 * Rangos de recompensa para el filtro del listado. Los marinos piensan en
 * escalones ("mas de mil millones"), no en dos campos numericos libres; cada
 * rango se traduce a recompensaMin / recompensaMax de FiltrarCriminalesDto.
 */
export interface RangoRecompensa {
  readonly clave: string;
  readonly etiqueta: string;
  readonly min?: number;
  readonly max?: number;
}

const M = 1_000_000;

export const RANGOS_RECOMPENSA: readonly RangoRecompensa[] = [
  { clave: 'hasta-10m', etiqueta: 'Hasta 10 M ฿', max: 10 * M },
  { clave: '10m-100m', etiqueta: 'De 10 M a 100 M ฿', min: 10 * M, max: 100 * M },
  { clave: '100m-1000m', etiqueta: 'De 100 M a 1.000 M ฿', min: 100 * M, max: 1000 * M },
  { clave: 'mas-1000m', etiqueta: 'Más de 1.000 M ฿', min: 1000 * M },
];

export function rangoPorClave(clave: string): RangoRecompensa | undefined {
  return RANGOS_RECOMPENSA.find((r) => r.clave === clave);
}

/** La clave del rango que corresponde a un filtro (o '' si no es uno de los escalones). */
export function claveDeRango(min: number | undefined, max: number | undefined): string {
  return RANGOS_RECOMPENSA.find((r) => r.min === min && r.max === max)?.clave ?? '';
}
