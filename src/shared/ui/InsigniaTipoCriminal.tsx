import { etiquetaCategoria, type CategoriaCriminal } from '@shared/utils/criminal';
import {
  IconoIndependiente,
  IconoPirata,
  IconoRevolucionario,
  IconoSinAfiliacion,
  type Icono,
} from './iconos';

interface Props {
  /** `organizacion?.categoria` del criminal; null = sin afiliacion vigente. */
  readonly categoria: CategoriaCriminal | null | undefined;
  /**
   * - completa (defecto): icono + nombre de la categoria.
   * - icono: solo el icono, con nombre accesible y tooltip. Para columnas
   *   estrechas donde el nombre del criminal ya ocupa la fila.
   */
  readonly variante?: 'completa' | 'icono';
}

const ICONO: Readonly<Record<CategoriaCriminal | 'SIN_AFILIACION', Icono>> = {
  PIRATA: IconoPirata,
  REVOLUCIONARIO: IconoRevolucionario,
  CRIMINAL_INDEPENDIENTE: IconoIndependiente,
  SIN_AFILIACION: IconoSinAfiliacion,
};

/**
 * Insignia del tipo de criminal: Pirata, Ejercito Revolucionario u
 * Organizacion independiente. Nunca un "criminal" generico.
 *
 * Las tres comparten forma y tinta (son categorias, no niveles: ninguna es
 * "peor" que otra); las distingue su icono propio y el nombre. El color queda
 * libre para la amenaza.
 *
 *   <InsigniaTipoCriminal categoria={criminal.organizacion?.categoria ?? null} />
 */
export function InsigniaTipoCriminal({
  categoria,
  variante = 'completa',
}: Props): React.ReactElement {
  const clave = categoria ?? 'SIN_AFILIACION';
  const Icono = ICONO[clave];
  const etiqueta = etiquetaCategoria(categoria);
  const modificador = clave.toLowerCase().replace(/_/g, '-');

  if (variante === 'icono') {
    return (
      <span
        className={`insignia-tipo insignia-tipo--icono insignia-tipo--${modificador}`}
        role="img"
        aria-label={etiqueta}
        title={etiqueta}
      >
        <Icono tamano={18} />
      </span>
    );
  }

  return (
    <span className={`insignia-tipo insignia-tipo--${modificador}`}>
      <Icono tamano={16} />
      {etiqueta}
    </span>
  );
}
