import { useState } from 'react';
import { ChevronDown, Snail, Volume2 } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { CANALES } from '../datos';
import { imagenDe } from '../imagenes';
import { FOCO, PANEL, ROTULO, TITULO_MENOR } from './estilos';
import { Esquinas } from './Marco';

const SEGMENTOS = 14;
/** Segmentos encendidos con la linea en espera. */
const NIVEL_EN_ESPERA = 6;

const BOTON =
  'cursor-pointer rounded border px-2 py-1 font-hq-rotulo text-xs font-extrabold tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-40';

/**
 * Den Den Mushi: se elige un canal, "Decidir" abre la linea (el indicador de
 * senal se mueve mientras dura) y "Cancelar" la cierra.
 */
export function DenDenMushi(): React.ReactElement {
  const [canal, setCanal] = useState(CANALES[0].id);
  const [enLinea, setEnLinea] = useState(false);
  const actual = CANALES.find((c) => c.id === canal) ?? CANALES[0];
  const caracol = imagenDe('den-den-mushi');

  return (
    <section
      aria-label="Den Den Mushi"
      className={cn(PANEL, 'grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 p-3')}
    >
      <div className={cn('w-24', enLinea && 'animate-pulse motion-reduce:animate-none')}>
        {caracol ? (
          <img src={caracol} alt="" draggable={false} className="block h-auto w-full" />
        ) : (
          <span className="grid aspect-square place-items-center rounded-full border border-hq-ambar/70 bg-hq-ambar/15 text-hq-ambar shadow-[0_0_14px_rgba(245,184,61,0.35)]">
            <Snail size={52} aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="grid min-w-0 gap-2">
        <div>
          <h3 className={TITULO_MENOR}>Den Den Mushi</h3>
          <p role="status" className="m-0 truncate text-xs text-cyan-300/75">
            {enLinea ? `En línea con ${actual.nombre}` : 'En espera'}
          </p>
        </div>

        <div className="relative flex items-center rounded border border-hq-neon/40 bg-hq-abismo/80 text-cyan-50">
          <Volume2 size={15} aria-hidden="true" className="ml-2 shrink-0 text-hq-neon" />
          <select
            aria-label="Canal de radio"
            value={canal}
            disabled={enLinea}
            onChange={(evento) => setCanal(evento.target.value)}
            className={cn(
              FOCO,
              'min-w-0 flex-1 cursor-pointer appearance-none truncate py-1 pr-7 pl-2 text-sm text-cyan-50 disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            {CANALES.map((c) => (
              <option key={c.id} value={c.id} className="bg-hq-casco text-cyan-50">
                {c.nombre}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute right-2 text-hq-neon"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className={ROTULO}>Radio</span>
          <span aria-hidden="true" className="flex h-3 flex-1 items-stretch gap-0.5">
            {Array.from({ length: SEGMENTOS }, (_, i) => (
              <span
                key={i}
                style={{ animationDelay: `${i * 60}ms` }}
                className={cn(
                  'flex-1 rounded-[1px]',
                  enLinea && 'animate-hq-ecualizador bg-hq-neon motion-reduce:animate-none',
                  !enLinea && (i < NIVEL_EN_ESPERA ? 'bg-hq-neon/80' : 'bg-hq-neon/20'),
                )}
              />
            ))}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!enLinea}
            onClick={() => setEnLinea(false)}
            className={cn(
              FOCO,
              BOTON,
              'border-hq-neon/70 bg-hq-neon/20 text-cyan-50 hover:bg-hq-neon/40',
            )}
          >
            CANCELAR
          </button>
          <button
            type="button"
            disabled={enLinea}
            onClick={() => setEnLinea(true)}
            className={cn(FOCO, BOTON, 'border-red-400/70 bg-red-700 text-white hover:bg-red-600')}
          >
            DECIDIR
          </button>
        </div>
      </div>

      <Esquinas />
    </section>
  );
}
