import type { CSSProperties } from 'react';

interface Props {
  /** El texto completo: se recorta a la vista y queda entero en el `title`. */
  readonly texto: string;
  /** Etiqueta a pintar. `small` para la linea secundaria de una celda. */
  readonly como?: 'span' | 'small' | 'strong';
  /** Lineas visibles antes de la elipsis (1 por defecto). */
  readonly lineas?: number;
  readonly className?: string;
}

/**
 * Texto que puede no caber (alias, correos, relatos en una celda): se corta
 * con elipsis y el texto entero queda en el `title`, de modo que nada se
 * pierde sin rastro. Va dentro de un contenedor con ancho acotado
 * (`min-width: 0` en grid o flex).
 *
 *   <TextoRecortado como="small" texto={`«${c.alias.join('», «')}»`} />
 */
export function TextoRecortado({
  texto,
  como: Etiqueta = 'span',
  lineas = 1,
  className,
}: Props): React.ReactElement {
  const estilo = lineas > 1 ? ({ '--recortado-lineas': lineas } as CSSProperties) : undefined;
  return (
    <Etiqueta
      className={['ui-recortado', lineas > 1 ? 'ui-recortado--lineas' : '', className]
        .filter(Boolean)
        .join(' ')}
      style={estilo}
      title={texto}
    >
      {texto}
    </Etiqueta>
  );
}
