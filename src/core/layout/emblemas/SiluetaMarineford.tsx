import { useId } from 'react';

interface Props {
  readonly className?: string;
}

/** Nivel del mar en el viewBox: todo lo de arriba es tierra o cielo. */
const MAR = 246;

/** Almenas de la muralla de la bahia: una cada 16 unidades. */
const ALMENAS = Array.from({ length: 33 }, (_, i) => 64 + i * 16);

/** Ventanas del cuartel: [x, y] de cada fila, sin la puerta del centro. */
const VENTANAS: ReadonlyArray<readonly [number, number]> = [
  ...[174, 190].flatMap((y) =>
    Array.from({ length: 17 }, (_, i) => 202 + i * 14)
      .filter((x) => x < 296 || x > 338)
      .map((x) => [x, y] as const),
  ),
  ...Array.from({ length: 7 }, (_, i) => [262 + i * 18, 100] as const),
  ...[148, 164].map((x) => [x, 180] as const),
  ...[488, 504].map((x) => [x, 180] as const),
];

/**
 * Silueta de la fortaleza de Marineford: la torre del Cuartel General con el
 * 正義 en la fachada, la muralla de la bahia y el mar nocturno al pie, a
 * contraluz sobre el resplandor del horizonte. Es la escena del acceso.
 *
 * Decorativo: oculto para lectores de pantalla. El mar y el resplandor se
 * extienden fuera del viewBox, asi que la escena llena cualquier ancho sin
 * deformar la fortaleza (quien la usa recorta con overflow del contenedor).
 */
export function SiluetaMarineford({ className }: Props): React.ReactElement {
  const idResplandor = `marineford-${useId().replace(/:/g, '')}`;

  return (
    <svg
      className={['marineford', className ?? ''].join(' ').trim()}
      viewBox="0 0 640 300"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={idResplandor} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="marineford-horizonte-alto" />
          <stop offset="1" className="marineford-horizonte-bajo" />
        </linearGradient>
      </defs>

      {/* Resplandor del horizonte y mar: mas anchos que el viewBox. */}
      <rect x="-1000" y="96" width="2640" height={MAR - 96} fill={`url(#${idResplandor})`} />
      <rect className="marineford-mar" x="-1000" y={MAR} width="2640" height="400" />

      {/* Gaviotas lejanas */}
      <path
        className="marineford-gaviotas"
        d="M96 70 q6 -6 12 0 q6 -6 12 0 M138 92 q4 -4 8 0 q4 -4 8 0 M520 58 q5 -5 10 0 q5 -5 10 0"
      />

      <g className="marineford-fortaleza">
        {/* Torre del Cuartel General: chapitel, gallardete y tejado. */}
        <rect x="318.5" y="10" width="3" height="22" />
        <path d="M321.5 10 L338 14.5 L321.5 19 Z" />
        <path d="M284 42 L292 30 L348 30 L356 42 Z" />
        <rect x="292" y="42" width="56" height="52" />
        {/* Tercer cuerpo y su alero */}
        <rect x="246" y="90" width="148" height="6" />
        <rect x="252" y="96" width="136" height="26" />
        {/* Segundo cuerpo: la fachada del 正義 */}
        <rect x="204" y="118" width="232" height="6" />
        <rect x="212" y="124" width="216" height="38" />
        {/* Cuerpo principal */}
        <rect x="184" y="158" width="272" height="6" />
        <rect x="192" y="164" width="256" height="64" />
        {/* Torres de la bahia */}
        <path d="M136 170 L148 156 L160 156 L172 170 Z" />
        <rect x="140" y="170" width="28" height="58" />
        <path d="M480 170 L492 156 L504 156 L516 170 Z" />
        <rect x="484" y="170" width="28" height="58" />
        {/* Muralla de la bahia con almenas y bastiones */}
        <rect x="56" y="226" width="528" height={MAR - 226} />
        {ALMENAS.map((x) => (
          <rect key={x} x={x} y="219" width="8" height="7" />
        ))}
        <rect x="34" y="204" width="44" height={MAR - 204} />
        <rect x="562" y="204" width="44" height={MAR - 204} />
        {[34, 52, 70, 562, 580, 598].map((x) => (
          <rect key={x} x={x} y="197" width="8" height="7" />
        ))}
        {/* Rompeolas que abren la bahia */}
        <path d={`M-1000 ${MAR} L34 ${MAR} L34 236 L-1000 240 Z`} />
        <path d={`M606 236 L1640 240 L1640 ${MAR} L606 ${MAR} Z`} />
      </g>

      {/* Ventanas encendidas y la puerta mayor */}
      <g className="marineford-luces">
        {VENTANAS.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="6" height="9" />
        ))}
        <path d="M306 228 L306 206 Q320 194 334 206 L334 228 Z" />
      </g>

      {/* Blason de la torre y el 正義 de la fachada */}
      <circle className="marineford-blason" cx="320" cy="64" r="11" />
      <text className="marineford-kanji" x="320" y="153" textAnchor="middle" lang="ja">
        正義
      </text>

      {/* Mar: oleaje y reflejo de la puerta */}
      <path
        className="marineford-olas"
        d="M-40 258 h90 M90 266 h120 M250 262 h40 M352 262 h40 M430 268 h130 M590 258 h90 M20 282 h70 M180 286 h90 M380 288 h110 M540 280 h70"
      />
      <path className="marineford-reflejo" d="M308 254 h24 M312 262 h16 M316 270 h8" />
    </svg>
  );
}
