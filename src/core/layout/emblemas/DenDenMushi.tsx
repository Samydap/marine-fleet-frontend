export type EstadoDenDenMushi = 'vivo' | 'dormido' | 'llamando';

interface Props {
  readonly estado: EstadoDenDenMushi;
  /** Lado del cuadro en px. */
  readonly tamano?: number;
  readonly className?: string;
}

/**
 * Den Den Mushi: el caracol de comunicaciones de la Marina. Cuerpo y concha
 * toman `currentColor`; los ojos y la boca recortan al fondo con `--den-ojo`.
 *
 *  - `vivo`: ojos abiertos.
 *  - `dormido`: ojos cerrados y una "z".
 *  - `llamando`: parpadeo breve al llegar un cambio (lo anima el CSS y se
 *    apaga con prefers-reduced-motion).
 *
 * Decorativo: el estado se nombra siempre en el texto que lo acompana.
 */
export function DenDenMushi({ estado, tamano = 22, className }: Props): React.ReactElement {
  const dormido = estado === 'dormido';
  return (
    <svg
      className={['den-den-mushi', className ?? ''].join(' ').trim()}
      width={tamano}
      height={tamano}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      data-estado={estado}
    >
      {/* Cuerpo: babosa alargada con el vientre sobre el suelo. */}
      <path
        d="M3 25 C3 20 7 17 12 17 L24 17 C27 17 29 19 29 21.5 C29 24 27 25 25 25 Z"
        fill="currentColor"
      />
      {/* Concha: el auricular del telefono. */}
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2.25" />
      <path
        d="M12 12 m0 -1.5 a1.5 1.5 0 1 1 -1.5 1.5 a3.4 3.4 0 1 1 3.4 3.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Antenas oculares */}
      <path
        d="M22 18 L22 12 M26.5 18.5 L28 13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {dormido ? (
        <g
          className="den-den-mushi-ojos"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M20.2 11.5 h3.6 M26.2 12.5 h3.2" />
        </g>
      ) : (
        <g className="den-den-mushi-ojos" fill="currentColor">
          <circle cx="22" cy="11" r="2.4" />
          <circle cx="27.8" cy="12" r="2.2" />
        </g>
      )}
      {!dormido && (
        <g className="den-den-mushi-pupilas" fill="var(--den-ojo)">
          <circle cx="22.3" cy="11" r="0.9" />
          <circle cx="28.1" cy="12" r="0.85" />
        </g>
      )}
      {dormido && (
        <path
          className="den-den-mushi-z"
          d="M27 5 h4 l-4 4.5 h4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
