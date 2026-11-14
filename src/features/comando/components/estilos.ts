/**
 * Clases de Tailwind que se repiten en el tablero.
 *
 * Todo boton lleva al menos una variante (`hover:`, `focus-visible:`): asi lo
 * reconoce la regla de src/tailwind.css que le quita el borde y el fondo del
 * navegador (Preflight esta desactivado en este proyecto).
 */
export const FOCO =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hq-neon';

/** Marco de un panel: fondo marino, borde cian fino y resplandor. */
export const PANEL =
  'relative rounded-lg border border-hq-neon/50 bg-linear-to-b from-hq-panel to-hq-casco shadow-[0_0_14px_rgba(0,210,255,0.18),inset_0_0_22px_rgba(0,210,255,0.05)]';

/** Icono de accion en la cabecera de un panel. */
export const BOTON_BARRA = `inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded text-hq-neon/85 transition-colors hover:bg-hq-neon/15 hover:text-white aria-pressed:bg-hq-neon/25 aria-pressed:text-white ${FOCO}`;

/** Titulo de un panel pequeno. */
export const TITULO_MENOR = 'm-0 font-hq-rotulo text-sm font-extrabold tracking-wide text-white';

/** Rotulo pequeno de lectura de instrumentos. */
export const ROTULO = 'font-mono text-[11px] tracking-[0.14em] text-cyan-300/75 uppercase';

/** Barra de desplazamiento fina y del color del tablero. */
export const SCROLL = '[scrollbar-color:rgba(0,210,255,0.55)_transparent] [scrollbar-width:thin]';

/** Recuadro de datos superpuesto al mapa. */
export const SOBREIMPRESO =
  'rounded border border-hq-neon/45 bg-hq-abismo/80 font-mono text-[11px] text-cyan-50 shadow-[0_0_8px_rgba(0,210,255,0.2)]';
