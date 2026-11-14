import { useId } from 'react';

interface Props {
  /** Gira el anillo exterior: indica que hay una verificacion en curso. */
  readonly girando?: boolean;
  /**
   * Sin la leyenda circular: para tamanos menores de 64px, donde el texto se
   * vuelve ruido (la barra lateral). La marca se lee en el texto que acompana.
   */
  readonly simple?: boolean;
  readonly className?: string;
}

/** Puntas de la rosa de los vientos: [angulo, largo, semiancho]. */
const PUNTAS: ReadonlyArray<readonly [number, number, number]> = [
  [0, 58, 9],
  [90, 58, 9],
  [180, 58, 9],
  [270, 58, 9],
  [45, 36, 6],
  [135, 36, 6],
  [225, 36, 6],
  [315, 36, 6],
];

const LEYENDA = 'MARINA · CUARTEL GENERAL · MARINA · CUARTEL GENERAL · ';

/**
 * Sello institucional del sistema. Vive en core/ porque lo usan el shell
 * (barra lateral) y la pantalla de acceso, y core/ no puede depender de shared/.
 * Diseno original: doble anillo con leyenda,
 * rosa de los vientos de ocho puntas y ancla. Es decorativo (la marca se lee en
 * el texto que lo acompana), por eso va oculto para los lectores de pantalla.
 *
 * Toma el color de `currentColor`, asi que el CSS decide el tono segun el fondo.
 */
export function SelloMarina({
  girando = false,
  simple = false,
  className,
}: Props): React.ReactElement {
  const idCirculo = `sello-${useId().replace(/:/g, '')}`;

  return (
    <svg
      className={['sello', girando ? 'sello--girando' : '', className ?? ''].join(' ').trim()}
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <path id={idCirculo} d="M 100 100 m -82 0 a 82 82 0 1 1 164 0 a 82 82 0 1 1 -164 0" />
      </defs>

      <circle cx="100" cy="100" r="97" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle
        cx="100"
        cy="100"
        r="93"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.6"
      />

      {!simple && (
        <g className="sello-anillo">
          <text className="sello-leyenda" fill="currentColor">
            <textPath href={`#${idCirculo}`} textLength="512" lengthAdjust="spacing">
              {LEYENDA}
            </textPath>
          </text>
        </g>
      )}

      <circle cx="100" cy="100" r="71" fill="none" stroke="currentColor" strokeWidth="1.25" />

      <g transform="translate(100 100)">
        {PUNTAS.map(([angulo, largo, ancho]) => (
          <g key={angulo} transform={`rotate(${angulo})`}>
            <path d={`M0 ${-largo} L${-ancho} ${-ancho} L0 0 Z`} fill="currentColor" />
            <path
              d={`M0 ${-largo} L${ancho} ${-ancho} L0 0 Z`}
              fill="currentColor"
              opacity="0.45"
            />
          </g>
        ))}

        <circle r="25" className="sello-disco" />
        <circle r="25" fill="none" stroke="currentColor" strokeWidth="1.25" />

        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="0" cy="-14" r="3.25" />
          <path d="M0 -10.75 V15.5" />
          <path d="M-7.5 -5 H7.5" />
          <path d="M-13 4 Q-11.5 14.5 0 15.5 Q11.5 14.5 13 4" />
          <path d="M-15.5 7 L-13 3.5 L-9.5 6" />
          <path d="M15.5 7 L13 3.5 L9.5 6" />
        </g>
      </g>
    </svg>
  );
}
