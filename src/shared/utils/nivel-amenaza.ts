export type NivelAmenaza = 'BAJO' | 'MEDIO' | 'ALTO' | 'PENDIENTE';

const ETIQUETAS: Record<NivelAmenaza, string> = {
  BAJO: 'Bajo',
  MEDIO: 'Medio',
  ALTO: 'Alto',
  PENDIENTE: 'Sin clasificar',
};

export function etiquetaNivelAmenaza(nivel: NivelAmenaza | null | undefined): string {
  return nivel ? ETIQUETAS[nivel] : ETIQUETAS.PENDIENTE;
}
