import es from '../../assets/i18n/es.json';

/** Prioridad de un operativo (o del incidente que surgio de uno). */
export type Prioridad = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

const NIVEL: Readonly<Record<Prioridad, 1 | 2 | 3 | 4>> = {
  BAJA: 1,
  MEDIA: 2,
  ALTA: 3,
  CRITICA: 4,
};

function etiquetaPrioridad(p: Prioridad): string {
  return (es.operativos.prioridad as Record<string, string>)[p] ?? p;
}

interface Props {
  readonly prioridad: Prioridad;
  /** Solo los galones (la etiqueta queda para el lector y el tooltip). */
  readonly soloMarca?: boolean;
}

/**
 * Prioridad del operativo como galones de manga: uno (baja) a cuatro
 * (critica) llenos sobre cuatro. Se lee por la cantidad, no por el color; la
 * critica ademas pasa a tinta de error. Siempre lleva su etiqueta. Vive en
 * shared porque operativos e incidentes la muestran igual.
 */
export function MarcaPrioridad({ prioridad, soloMarca = false }: Props): React.ReactElement {
  const nivel = NIVEL[prioridad];
  const etiqueta = `Prioridad ${etiquetaPrioridad(prioridad).toLowerCase()}`;
  return (
    <span
      className={`prioridad prioridad--${prioridad.toLowerCase()}`}
      title={soloMarca ? etiqueta : undefined}
    >
      <svg
        className="prioridad-galones"
        width="14"
        height="18"
        viewBox="0 0 14 18"
        aria-hidden="true"
        focusable="false"
      >
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M1.5 ${15.5 - i * 4} 7 ${12 - i * 4} 12.5 ${15.5 - i * 4}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={i < nivel ? 'prioridad-galon' : 'prioridad-galon prioridad-galon--vacio'}
          />
        ))}
      </svg>
      <span className={soloMarca ? 'sr-only' : 'prioridad-texto'}>
        {soloMarca ? etiqueta : etiquetaPrioridad(prioridad)}
      </span>
    </span>
  );
}
