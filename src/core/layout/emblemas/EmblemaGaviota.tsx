interface Props {
  /** Lado del cuadro en px. El CSS puede sobrescribirlo con width/height. */
  readonly tamano?: number;
  /**
   * `silueta`: gaviota rellena, para tamanos chicos y la marca de agua.
   * `linea`: solo el trazo, para piezas grandes sobre fondos claros u oscuros.
   */
  readonly variante?: 'linea' | 'silueta';
  readonly className?: string;
}

/**
 * Contorno de la gaviota de la Marina: alas abiertas en "M", cabeza vuelta a la
 * izquierda con el pico y la cola en cuna. Un solo trazado para que la silueta
 * y la linea dibujen exactamente la misma ave.
 */
const GAVIOTA =
  'M60 44 C65 44 68 47 68.5 51 C74 47 79 40 86 35 C95 29 106 32 115 41 ' +
  'C106 40 98 43 92 50 C86 57 77 62 68.5 65 L64 79 L60 74.5 L56 79 L51.5 65 ' +
  'C43 62 34 57 28 50 C22 43 14 40 5 41 C14 32 25 29 34 35 C41 40 46 46 51.5 50 ' +
  'L42 53.5 L52 54 C52 48 55.5 44 60 44 Z';

/** Plumas de las alas: dos remeras por lado, solo en la variante de linea. */
const PLUMAS =
  'M98 40 C93 43 89 47 86 51 M88 37 C83 41 79 46 76 52 M22 40 C27 43 31 47 34 51 M32 37 C37 41 41 46 44 52';

/** Mar bajo la gaviota: dos ondas. */
const OLAS = 'M22 92 q9.5 -6 19 0 t19 0 t19 0 t19 0 M34 102 q8.7 -5 17.3 0 t17.3 0 t17.3 0';

/**
 * Emblema de la gaviota de la Marina. Es el emblema principal del sistema
 * (barra lateral, marca de agua del lienzo, acceso y favicon). Vive en core/
 * porque lo usan el shell y el acceso, y core/ no puede depender de shared/.
 *
 * Decorativo: la marca se lee en el texto que lo acompana. Toma el color de
 * `currentColor`, asi que el CSS decide el tono segun el fondo.
 */
export function EmblemaGaviota({
  tamano = 40,
  variante = 'silueta',
  className,
}: Props): React.ReactElement {
  const linea = variante === 'linea';
  return (
    <svg
      className={['emblema-gaviota', `emblema-gaviota--${variante}`, className ?? '']
        .join(' ')
        .trim()}
      width={tamano}
      height={tamano}
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
      data-variante={variante}
    >
      <path
        d={GAVIOTA}
        fill={linea ? 'none' : 'currentColor'}
        stroke="currentColor"
        strokeWidth={linea ? 3 : 1}
        strokeLinejoin="round"
      />
      {linea && (
        <path
          d={PLUMAS}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />
      )}
      <path
        d={OLAS}
        fill="none"
        stroke="currentColor"
        strokeWidth={linea ? 3 : 4}
        strokeLinecap="round"
      />
    </svg>
  );
}
