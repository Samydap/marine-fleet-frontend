import { NavLink } from 'react-router-dom';

export interface SeccionPestana {
  /** Ruta absoluta de la seccion ('/amenaza/tendencias'). */
  readonly a: string;
  readonly etiqueta: string;
  /** Pendientes de la seccion (reportes por revisar). Sin numero o en 0, no se pinta. */
  readonly contador?: number | null;
  /** Que cuenta el contador, para el lector de pantalla: "por revisar". */
  readonly contadorEtiqueta?: string;
}

interface Props {
  readonly secciones: readonly SeccionPestana[];
  /** Nombre del grupo: "Secciones de amenaza". */
  readonly etiqueta: string;
}

/**
 * Pestanas entre las secciones de una feature. Van SIEMPRE debajo del
 * PageHeader (nunca encima del titulo ni del enlace "volver") y solo con las
 * secciones que el cargo puede abrir: filtra antes de pasarlas. Con una sola
 * no se pinta nada, no hay entre que elegir.
 *
 * En el telefono no se apilan: la fila se desplaza en horizontal.
 *
 *   <PageHeader titulo="Distribución de amenaza" … />
 *   <PestanasSeccion etiqueta="Secciones de amenaza" secciones={[
 *     { a: '/amenaza', etiqueta: 'Distribución' },
 *     { a: '/amenaza/criterios', etiqueta: 'Criterios' },
 *   ]} />
 */
export function PestanasSeccion({ secciones, etiqueta }: Props): React.ReactElement | null {
  if (secciones.length < 2) return null;

  return (
    <nav className="ui-pestanas" aria-label={etiqueta}>
      {secciones.map((s) => (
        <NavLink key={s.a} to={s.a} end className="ui-pestana">
          {s.etiqueta}
          {s.contador != null && s.contador > 0 && (
            <span className="ui-pestana-contador cifra">
              {s.contador > 99 ? '99+' : s.contador}
              {s.contadorEtiqueta && <span className="sr-only"> {s.contadorEtiqueta}</span>}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
