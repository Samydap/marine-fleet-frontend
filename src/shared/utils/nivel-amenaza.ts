import es from '../../assets/i18n/es.json';

/** Espejo de NivelAmenaza (shared/domain/value-objects/nivel-amenaza.enum.ts). */
export type NivelAmenaza = 'BAJO' | 'MEDIO' | 'ALTO' | 'PENDIENTE';

/** Los tres niveles clasificados, de menor a mayor. Para filtros y leyendas. */
export const NIVELES_AMENAZA: readonly Exclude<NivelAmenaza, 'PENDIENTE'>[] = [
  'BAJO',
  'MEDIO',
  'ALTO',
];

/** Orden de severidad (SEVERIDAD del backend), para ordenar tablas. */
export const SEVERIDAD_AMENAZA: Readonly<Record<NivelAmenaza, number>> = {
  PENDIENTE: 0,
  BAJO: 1,
  MEDIO: 2,
  ALTO: 3,
};

const ETIQUETAS: Readonly<Record<NivelAmenaza, string>> = es.amenaza;

export function etiquetaNivelAmenaza(nivel: NivelAmenaza | null | undefined): string {
  return nivel ? ETIQUETAS[nivel] : ETIQUETAS.PENDIENTE;
}

/** Opciones para un CampoSelect de nivel (sin "Sin clasificar" si no se pide). */
export function opcionesNivelAmenaza(
  incluirPendiente = false,
): { valor: NivelAmenaza; etiqueta: string }[] {
  const niveles: NivelAmenaza[] = incluirPendiente
    ? [...NIVELES_AMENAZA, 'PENDIENTE']
    : [...NIVELES_AMENAZA];
  return niveles.map((valor) => ({ valor, etiqueta: ETIQUETAS[valor] }));
}
