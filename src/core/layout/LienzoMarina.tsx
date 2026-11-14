import { EmblemaGaviota } from './emblemas/EmblemaGaviota';

/** Centro de la rosa de los vientos en la carta (coordenadas del viewBox). */
const ROSA = { x: 1080, y: 250 } as const;

/** Rumbos de la rosa: 16 lineas que cruzan toda la carta. */
const RUMBOS = Array.from({ length: 16 }, (_, i) => (i * 360) / 16);

/** Puntas de la rosa: [angulo, largo, semiancho]. */
const PUNTAS: ReadonlyArray<readonly [number, number, number]> = [
  [0, 150, 16],
  [90, 150, 16],
  [180, 150, 16],
  [270, 150, 16],
  [45, 92, 11],
  [135, 92, 11],
  [225, 92, 11],
  [315, 92, 11],
];

/**
 * Lienzo "Marineford" del shell: capas fijas detras del contenido, de abajo
 * hacia arriba:
 *
 * 1. Carta nautica: rumbos, rosa de los vientos grande y la franja de la Grand
 *    Line cruzando en diagonal, con la Red Line en vertical.
 * 2. Trama de tinta (puntos de manga) que se intensifica hacia los bordes.
 * 3. Gaviota de la Marina en marca de agua, abajo a la derecha.
 *
 * El color base lo pone `.shell` (`--lienzo`). Todo es decorativo y estatico:
 * oculto para lectores de pantalla y sin animacion de fondo.
 */
export function LienzoMarina(): React.ReactElement {
  return (
    <div className="lienzo" aria-hidden="true">
      <svg
        className="lienzo-carta"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        <g className="lienzo-carta-rumbos">
          {RUMBOS.map((angulo) => (
            <line
              key={angulo}
              x1={ROSA.x}
              y1={ROSA.y}
              x2={ROSA.x + 2000}
              y2={ROSA.y}
              transform={`rotate(${angulo} ${ROSA.x} ${ROSA.y})`}
            />
          ))}
        </g>

        <g className="lienzo-carta-rosa" transform={`translate(${ROSA.x} ${ROSA.y})`}>
          <circle r="190" />
          <circle r="178" strokeDasharray="2 10" />
          <circle r="120" />
          {PUNTAS.map(([angulo, largo, ancho]) => (
            <path
              key={angulo}
              transform={`rotate(${angulo})`}
              d={`M0 ${-largo} L${-ancho} ${-ancho} L0 0 L${ancho} ${-ancho} Z M0 ${-largo} L0 0`}
            />
          ))}
        </g>

        {/* Grand Line: franja diagonal de borde a borde, con su eje punteado. */}
        <g className="lienzo-carta-grand-line">
          <path d="M-80 760 L1520 180" />
          <path d="M-80 880 L1520 300" />
          <path className="lienzo-carta-eje" d="M-80 820 L1520 240" />
        </g>

        {/* Red Line: el continente que parte el mundo en vertical. */}
        <path className="lienzo-carta-red-line" d="M430 -20 C445 220 410 520 440 920" />
      </svg>

      <div className="lienzo-trama" />

      <EmblemaGaviota variante="silueta" tamano={420} className="lienzo-gaviota" />
    </div>
  );
}
