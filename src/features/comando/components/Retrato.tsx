import { cn } from '@shared/utils/cn';
import type { Rasgo } from '../datos';
import { imagenDe } from '../imagenes';
import { Silueta } from './Silueta';

interface RetratoProps {
  /** Nombre del archivo en src/assets/comando/, sin extension. */
  readonly clave: string;
  /** Silueta de respaldo mientras no exista la imagen. */
  readonly rasgo: Rasgo;
  readonly fondo: string;
  readonly tinta?: string;
  /**
   * `busto`: acerca cabeza y torso de una figura de cuerpo entero sobre fondo
   * negro. El negro se funde con el panel (mezcla `lighten`) y el borde
   * izquierdo se desvanece. El contenedor debe recortar lo que sobra.
   */
  readonly ajuste?: 'cubrir' | 'busto';
  readonly className?: string;
}

/**
 * Retrato decorativo: la imagen si esta en la carpeta de recursos y, si no, una
 * silueta. El nombre siempre aparece escrito al lado, por eso el `alt` va vacio.
 */
export function Retrato({
  clave,
  rasgo,
  fondo,
  tinta,
  ajuste = 'cubrir',
  className,
}: RetratoProps): React.ReactElement {
  const url = imagenDe(clave);

  if (!url) {
    return <Silueta rasgo={rasgo} fondo={fondo} tinta={tinta} className={className} />;
  }

  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      draggable={false}
      className={cn(
        'block object-cover object-top',
        ajuste === 'busto' &&
          'origin-top scale-[1.7] mix-blend-lighten [mask-image:linear-gradient(to_right,transparent_20%,#000_48%)]',
        className,
      )}
    />
  );
}
