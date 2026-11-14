export type TonoEstado = 'neutro' | 'info' | 'exito' | 'aviso' | 'peligro' | 'autoridad';

interface Props {
  readonly etiqueta: string;
  /**
   * - neutro: estados finales sin juicio (archivado, historico, fallecido).
   * - info: en preparacion (planificado, pendiente de revision).
   * - exito: resuelto a favor (capturado, verificado, aprobado, exitoso).
   * - aviso: requiere atencion (en busqueda, pendiente de validacion, parcial).
   * - peligro: fallido o rechazado (abortado, descartado, fracaso).
   * - autoridad: decidido por rango (vigente validada por el Almirante). Dorado.
   */
  readonly tono: TonoEstado;
  /** Estado en curso que cambia en vivo (operativo EN_CURSO): anillo exterior en el marcador. */
  readonly enCurso?: boolean;
}

/**
 * Marcador por tono: cada tono tiene FORMA propia (circulo lleno, hueco,
 * rombo, cuadrado, estrella) para que el estado se lea sin color.
 */
function Marcador({
  tono,
  enCurso,
}: {
  readonly tono: TonoEstado;
  readonly enCurso?: boolean;
}): React.ReactElement {
  let forma: React.ReactElement;
  switch (tono) {
    case 'exito':
      forma = (
        <path
          d="M2.5 6.2 5 8.5l4.5-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
      break;
    case 'peligro':
      forma = (
        <path
          d="m3 3 6 6M9 3 3 9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      );
      break;
    case 'aviso':
      forma = <path d="M6 1.5 10.5 6 6 10.5 1.5 6z" fill="currentColor" />;
      break;
    case 'autoridad':
      forma = (
        <path
          d="m6 1.2 1.4 3 3.3.4-2.4 2.3.6 3.3L6 8.6 3.1 10.2l.6-3.3L1.3 4.6l3.3-.4z"
          fill="currentColor"
        />
      );
      break;
    case 'info':
      forma = <circle cx="6" cy="6" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />;
      break;
    default:
      forma = <circle cx="6" cy="6" r="3" fill="currentColor" />;
  }

  return (
    <svg
      className={
        enCurso ? 'insignia-estado-marca insignia-estado-marca--en-curso' : 'insignia-estado-marca'
      }
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
    >
      {forma}
    </svg>
  );
}

/**
 * Insignia de estado generica. Cada feature mapea SUS estados a un tono (el
 * vocabulario es suyo; la forma, del sistema):
 *
 *   const TONO: Record<EstadoOperativo, TonoEstado> = {
 *     PLANIFICADO: 'info', EN_CURSO: 'aviso', CERRADO: 'exito', ABORTADO: 'peligro',
 *   };
 *   <InsigniaEstado etiqueta="En curso" tono={TONO[op.estado]} enCurso={op.estado === 'EN_CURSO'} />
 *
 * Para el estado del criminal ya existe el mapeo: tonoEstadoCriminal() y
 * etiquetaEstadoCriminal() de shared/utils/criminal.
 */
export function InsigniaEstado({ etiqueta, tono, enCurso = false }: Props): React.ReactElement {
  return (
    <span className={`insignia-estado insignia-estado--${tono}`}>
      <Marcador tono={tono} enCurso={enCurso} />
      {etiqueta}
    </span>
  );
}
