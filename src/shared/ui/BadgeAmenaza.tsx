import { etiquetaNivelAmenaza, type NivelAmenaza } from '@shared/utils/nivel-amenaza';

interface Props {
  readonly nivel: NivelAmenaza | null | undefined;
}

/**
 * COMPONENTE TONTO DE REFERENCIA para shared/ui: recibe datos por props, no
 * consume stores de negocio y no sabe de donde vienen los datos. Esa es la
 * condicion para que pueda vivir en shared/ y usarse desde cualquier feature.
 */
export function BadgeAmenaza({ nivel }: Props): React.ReactElement {
  const clave = (nivel ?? 'PENDIENTE').toLowerCase();

  return (
    <span className={`badge-amenaza badge-amenaza--${clave}`}>{etiquetaNivelAmenaza(nivel)}</span>
  );
}
