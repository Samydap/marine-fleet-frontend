import type { Rasgo } from '../datos';

interface SiluetaProps {
  readonly rasgo: Rasgo;
  /** Color de fondo del retrato. */
  readonly fondo: string;
  /** Color de la figura; por defecto, tinta de imprenta. */
  readonly tinta?: string;
  readonly className?: string;
}

const ACENTO = '#b3261e';

/** Lo que distingue a cada retrato, dibujado sobre la misma figura base. */
function Distintivo({ rasgo, tinta }: { rasgo: Rasgo; tinta: string }): React.ReactElement {
  switch (rasgo) {
    case 'sombrero':
      return (
        <g>
          <ellipse cx="50" cy="33" rx="34" ry="7" fill="#d9b25f" />
          <path d="M30 33c0-15 9-23 20-23s20 8 20 23z" fill="#e6c477" />
          <path d="M30 30h40v4H30z" fill={ACENTO} />
        </g>
      );
    case 'barba':
      return (
        <g>
          <path d="M31 48c1 26 9 38 19 38s18-12 19-38c-6 7-12 9-19 9s-13-2-19-9z" fill={tinta} />
          <path d="M28 30c4-13 12-19 22-19s18 6 22 19c-7-4-14-6-22-6s-15 2-22 6z" fill={tinta} />
        </g>
      );
    case 'cuernos':
      return (
        <g fill="#e9e2cf" stroke={tinta} strokeWidth="1.5">
          <path d="M34 30C22 28 14 18 15 6c5 9 12 13 22 14z" />
          <path d="M66 30c12-2 20-12 19-24-5 9-12 13-22 14z" />
        </g>
      );
    case 'nariz':
      return (
        <g>
          <circle cx="50" cy="45" r="7" fill={ACENTO} />
          <path d="M28 26c2-12 11-18 22-18s20 6 22 18c-7-5-14-7-22-7s-15 2-22 7z" fill="#2f5d8a" />
        </g>
      );
    case 'garfio':
      return (
        <g>
          <path d="M34 40h32" stroke={ACENTO} strokeWidth="2.5" />
          <path
            d="M80 78c9-3 12-11 8-17s-13-4-13 3"
            fill="none"
            stroke="#c9a23a"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      );
    case 'gafas':
      return (
        <g>
          <path d="M31 38h17l-3 8H34zM52 38h17l-3 8H55z" fill={ACENTO} />
          <path d="M14 96c3-14 10-20 17-22l-9 26zM86 96c-3-14-10-20-17-22l9 26z" fill="#e7a3b7" />
        </g>
      );
    case 'gorra':
      return (
        <g>
          <path d="M30 31c0-13 9-20 20-20s20 7 20 20z" fill="#f4f6f8" />
          <path d="M28 31h44l6 6H22z" fill="#17365d" />
          <path d="M10 92h22v7H10zM68 92h22v7H68z" fill="#c9a23a" />
        </g>
      );
  }
}

/**
 * Retrato de marcador de posicion: una figura de busto con un rasgo distintivo.
 * Es decorativo; el nombre siempre aparece escrito junto a el.
 */
export function Silueta({
  rasgo,
  fondo,
  tinta = '#1d140d',
  className,
}: SiluetaProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 100 110"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect width="100" height="110" fill={fondo} />
      <path d="M8 110c2-22 14-33 42-33s40 11 42 33z" fill={tinta} />
      <path d="M42 62h16v18H42z" fill={tinta} />
      <ellipse cx="50" cy="44" rx="19" ry="22" fill={tinta} />
      <Distintivo rasgo={rasgo} tinta={tinta} />
    </svg>
  );
}
