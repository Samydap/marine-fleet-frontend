import { Check, Plus, Star } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import type { Mision } from '../datos';
import { FOCO } from './estilos';
import { Retrato } from './Retrato';

interface TarjetaMisionProps {
  readonly mision: Mision;
  readonly onAvanzar: (id: string) => void;
}

const FICHA =
  'inline-flex h-6 min-w-11 items-center justify-center gap-1 rounded-sm border px-1.5 font-mono text-[11px] font-bold';

/**
 * Mision de la flota: barra de avance, premio y el oficial al mando, cuyo
 * retrato ocupa el lado derecho de la tarjeta.
 */
export function TarjetaMision({ mision, onAvanzar }: TarjetaMisionProps): React.ReactElement {
  const completa = mision.progreso >= mision.total;
  const porcentaje = (mision.progreso / mision.total) * 100;

  return (
    <article
      aria-label={`Misión ${mision.nombre}`}
      className={cn(
        'relative min-h-30 overflow-hidden rounded-md border bg-linear-to-r from-[#102a4d] to-[#0a1a31]',
        completa ? 'border-emerald-400/70' : 'border-hq-neon/40',
      )}
    >
      <div
        title={mision.nombreEjecutor}
        className="absolute top-0 right-0 bottom-0 w-[38%] overflow-hidden bg-linear-to-l from-hq-azul/35 to-transparent"
      >
        <Retrato
          clave={mision.ejecutor}
          rasgo="gorra"
          fondo={mision.fondo}
          tinta="#0a1422"
          ajuste="busto"
          className="h-full w-full"
        />
      </div>

      <div className="relative w-[64%] p-2.5">
        <h3 className="m-0 truncate font-hq-rotulo text-[15px] leading-tight font-extrabold text-white">
          {mision.nombre}
        </h3>

        <div
          role="progressbar"
          aria-label={`${mision.objetivo} de ${mision.nombre}`}
          aria-valuemin={0}
          aria-valuemax={mision.total}
          aria-valuenow={mision.progreso}
          className="mt-2 h-2 overflow-hidden rounded-full border border-hq-neon/35 bg-hq-abismo"
        >
          <span
            style={{ width: `${porcentaje}%` }}
            className={cn(
              'block h-full transition-[width] duration-300 motion-reduce:transition-none',
              completa
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                : 'bg-linear-to-r from-hq-azul to-hq-neon shadow-[0_0_8px_rgba(0,210,255,0.8)]',
            )}
          />
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-2 text-xs text-cyan-100/85">
          <span className="truncate">{mision.objetivo}</span>
          <span className="font-mono font-bold text-white">
            {mision.progreso}/{mision.total}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <span className={cn(FICHA, 'border-hq-ambar/70 bg-hq-ambar/15 text-hq-ambar')}>
            {mision.premio.tipo === 'merito' ? (
              <Star size={12} aria-label="Méritos" fill="currentColor" />
            ) : (
              <span aria-label="Millones de berries">฿</span>
            )}
            {mision.premio.valor}
          </span>
          <span
            title="Misiones completadas"
            className={cn(FICHA, 'border-hq-neon/35 bg-hq-abismo/70 text-cyan-50')}
          >
            {completa ? '1/1' : '0/1'}
          </span>
          <button
            type="button"
            disabled={completa}
            aria-label={completa ? 'Completada' : 'Registrar avance'}
            title={completa ? 'Completada' : 'Registrar avance'}
            onClick={() => onAvanzar(mision.id)}
            className={cn(
              FOCO,
              FICHA,
              'cursor-pointer border-hq-neon/60 bg-hq-neon/15 text-cyan-50 transition-colors hover:bg-hq-neon/40',
              'disabled:cursor-not-allowed disabled:border-emerald-400/60 disabled:bg-emerald-400/15 disabled:text-emerald-200',
            )}
          >
            {completa ? (
              <Check size={13} aria-hidden="true" />
            ) : (
              <Plus size={13} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
