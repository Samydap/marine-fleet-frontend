import { motion, useReducedMotion } from 'motion/react';
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
  const reducir = useReducedMotion() ?? false;

  return (
    <ul
      className={`barras-h${anchoEtiqueta === 'amplio' ? ' barras-h--amplio' : ''}`}
      aria-label={titulo}
    >
      {datos.map((d, i) => {
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
                <motion.span
                  className={`barras-h-barra${d.nivel ? ` barras-h-barra--${d.nivel}` : ''}`}
                  // Crecen una tras otra desde la base. MotionConfig solo frena
                  // transformaciones, no el ancho: "reducir movimiento" se mira aqui.
                  initial={reducir ? false : { width: 0 }}
                  animate={{ width: `${ancho}%` }}
                  transition={{ duration: 0.45, delay: Math.min(i, 11) * 0.06, ease: 'easeOut' }}
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
