import type { ReactNode } from 'react';

export interface BarraDato {
  readonly clave: string;
  /** Lo que se lee a la izquierda: texto, o una insignia que ya nombra la categoria. */
  readonly etiqueta: ReactNode;
  /** Nombre en texto plano para el tooltip y el lector de pantalla. */
  readonly nombre: string;
  readonly valor: number;
  /** Valor ya formateado para la punta de la barra ("12", "3,5 MM ฿"). */
  readonly textoValor: string;
  /**
   * Nivel de amenaza de la barra, si la agrupacion es por nivel: toma su color
   * semantico. Sin nivel, todas las barras son navy (una sola serie).
   */
  readonly nivel?: 'bajo' | 'medio' | 'alto' | 'pendiente';
  /** Abre un grupo nuevo con un filete (la Grand Line frente a los Cuatro Mares). */
  readonly separada?: boolean;
}

interface Props {
  readonly titulo: string;
  readonly datos: readonly BarraDato[];
  /** Ancho de la columna de etiquetas en escritorio. */
  readonly anchoEtiqueta?: 'normal' | 'amplio';
}

/**
 * Grafico de barras horizontales de una serie (lo usan amenaza y el reporte
 * de recompensas por mar), en HTML (se adapta al ancho sin
 * recalcular un SVG). Valor en la punta, extremo redondeado de 4px y base
 * recta; el detalle exacto queda en el `title` y en texto para el lector.
 */
export function BarrasHorizontales({
  titulo,
  datos,
  anchoEtiqueta = 'normal',
}: Props): React.ReactElement {
  const maximo = Math.max(0, ...datos.map((d) => d.valor));

  return (
    <ul
      className={`barras-h${anchoEtiqueta === 'amplio' ? ' barras-h--amplio' : ''}`}
      aria-label={titulo}
    >
      {datos.map((d) => {
        const ancho = maximo > 0 ? (d.valor / maximo) * 100 : 0;
        return (
          <li
            key={d.clave}
            className={`barras-h-fila${d.separada ? ' barras-h-fila--separada' : ''}`}
            title={`${d.nombre}: ${d.textoValor}`}
          >
            <span className="barras-h-etiqueta">{d.etiqueta}</span>
            <span className="barras-h-pista" aria-hidden="true">
              {ancho > 0 && (
                <span
                  className={`barras-h-barra${d.nivel ? ` barras-h-barra--${d.nivel}` : ''}`}
                  style={{ width: `${ancho}%` }}
                />
              )}
            </span>
            <span className="barras-h-valor cifra" aria-hidden="true">
              {d.textoValor}
            </span>
            <span className="sr-only">: {d.textoValor}</span>
          </li>
        );
      })}
    </ul>
  );
}
