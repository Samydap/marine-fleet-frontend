import { CARTA } from '../datos';

/** Lineas de rumbo que irradian del centro, como en una carta nautica antigua. */
const RUMBOS = Array.from({ length: 8 }, (_, i) => {
  const angulo = (i * Math.PI) / 8;
  const dx = Math.cos(angulo) * 500;
  const dy = Math.sin(angulo) * 500;
  return `M${300 - dx} ${200 - dy}L${300 + dx} ${200 + dy}`;
}).join('');

interface CartaNavalProps {
  /** Dibuja las rutas navales sobre el mar. */
  readonly rutas: boolean;
}

/**
 * Dibujo de la carta: mar, tierras en pergamino y rutas. Se estira para llenar
 * el panel (preserveAspectRatio none), asi las naves, que se colocan en
 * porcentajes del mismo lienzo, quedan siempre sobre sus rutas.
 */
export function CartaNaval({ rutas }: CartaNavalProps): React.ReactElement {
  return (
    <svg
      viewBox={`0 0 ${CARTA.ancho} ${CARTA.alto}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className="absolute inset-0 block h-full w-full"
    >
      <defs>
        <radialGradient id="hq-mar" cx="50%" cy="45%" r="80%">
          <stop offset="0" stopColor="#3193b3" />
          <stop offset="1" stopColor="#0e3b5c" />
        </radialGradient>
        <linearGradient id="hq-tierra" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ecdaa8" />
          <stop offset="1" stopColor="#c8a566" />
        </linearGradient>
        <pattern id="hq-reticula" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M50 0H0v50" fill="none" stroke="#d6f4ff" strokeOpacity="0.13" />
        </pattern>
      </defs>

      <rect width={CARTA.ancho} height={CARTA.alto} fill="url(#hq-mar)" />
      <rect width={CARTA.ancho} height={CARTA.alto} fill="url(#hq-reticula)" />
      <path d={RUMBOS} stroke="#eafaff" strokeOpacity="0.09" />

      <g fill="url(#hq-tierra)" stroke="#6f5128" strokeWidth="2.5" strokeLinejoin="round">
        {/* Continente central */}
        <path d="M252 62c44-22 104-8 136 28 40-10 82 22 72 62 42 20 50 72 10 96 12 44-30 84-80 74-32 30-90 24-110-10-40 10-80-22-64-62-36-20-32-70 4-84-14-44 2-86 32-104z" />
        {/* Islas y costas */}
        <path d="M0 312c36-10 80 12 78 46-2 30-38 42-78 42z" />
        <path d="M30 42c26-16 66-6 70 22 4 26-30 38-56 28-24-10-34-36-14-50z" />
        <path d="M600 60c-36 10-52 50-40 80 10 22 40 25 40 25z" />
        <path d="M440 350c30-12 76-2 76 22 0 23-46 28-68 18-20-10-26-32-8-40z" />
        <path d="M200 350c14-8 36-4 38 10s-16 20-30 16-18-18-8-26z" />
      </g>

      {/* Curvas de nivel y relieve del continente */}
      <g fill="none" stroke="#7d5f33" strokeOpacity="0.5">
        <path
          d="M268 92c36-16 84-6 108 22 34-6 64 18 58 50 30 18 34 54 6 72 8 34-24 62-60 56-26 20-66 16-82-8-30 6-58-18-48-46-24-18-22-52 4-62-10-34 2-66 14-84z"
          strokeDasharray="3 5"
        />
        <path d="M320 150l10-16 10 16m6 6l8-13 8 13m-74 40l9-14 9 14m70 22l10-16 10 16m-60 30l8-13 8 13" />
      </g>

      {rutas && (
        <g fill="none" strokeLinecap="round" strokeWidth="2">
          <path
            d="M80 222c20-22 45-30 70-27s28-45 25-90"
            stroke="#f5d06a"
            strokeDasharray="7 6"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M80 222c50 78 160 143 265 130s155-32 185-117"
            stroke="#f3f7fa"
            strokeOpacity="0.9"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M175 105C260 18 430 8 520 90c40 40 25 100 10 145"
            stroke="#f3f7fa"
            strokeOpacity="0.55"
            strokeDasharray="2 6"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      )}
    </svg>
  );
}
