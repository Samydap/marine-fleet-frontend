import { BadgeAmenaza } from '@shared/ui/BadgeAmenaza';
import { etiquetaNivelAmenaza, type NivelAmenaza } from '@shared/utils/nivel-amenaza';

interface Nivel {
  readonly nivel: NivelAmenaza;
  readonly total: number;
  readonly porcentaje: number;
}

interface Props {
  readonly niveles: readonly Nivel[];
  readonly total: number;
}

function formatearPorcentaje(p: number): string {
  return `${p.toLocaleString('es-CO', { maximumFractionDigits: 1 })} %`;
}

/**
 * Barra segmentada: el archivo entero partido por nivel de amenaza, del mas
 * grave al menos grave. Cada bloque usa el color base del nivel (area grande,
 * sin texto encima: DISENO.md prohibe texto sobre el naranja). La leyenda, con
 * el BadgeAmenaza de siempre, nombra cada parte y da cantidad y porcentaje, asi
 * que nada depende solo del color.
 */
export function BarraNiveles({ niveles, total }: Props): React.ReactElement {
  const descripcion = niveles
    .map(
      (n) =>
        `${etiquetaNivelAmenaza(n.nivel)}: ${n.total.toLocaleString('es-CO')} (${formatearPorcentaje(n.porcentaje)})`,
    )
    .join('; ');

  return (
    <div className="barra-niveles">
      <div
        className="barra-niveles-pista"
        role="img"
        aria-label={`Distribución por nivel de amenaza. ${descripcion}.`}
      >
        {total > 0 &&
          niveles
            .filter((n) => n.total > 0)
            .map((n) => (
              <span
                key={n.nivel}
                className={`barra-niveles-bloque barra-niveles-bloque--${n.nivel.toLowerCase()}`}
                style={{ flexGrow: n.total }}
                title={`${etiquetaNivelAmenaza(n.nivel)}: ${n.total.toLocaleString('es-CO')} criminales, ${formatearPorcentaje(n.porcentaje)}`}
              />
            ))}
      </div>

      <ul className="barra-niveles-leyenda">
        {niveles.map((n) => (
          <li key={n.nivel} className="barra-niveles-item">
            <BadgeAmenaza nivel={n.nivel} />
            <span className="barra-niveles-cifra cifra">{n.total.toLocaleString('es-CO')}</span>
            <span className="barra-niveles-porcentaje cifra">
              {formatearPorcentaje(n.porcentaje)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
