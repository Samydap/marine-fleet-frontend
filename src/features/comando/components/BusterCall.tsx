import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { FOCO, PANEL } from './estilos';
import { Esquinas } from './Marco';

function estadoDe(armado: boolean, emitida: boolean): string {
  if (emitida) return 'Orden emitida: diez buques de guerra en camino';
  return armado ? 'Sin seguro: lista para emitir' : 'Seguro puesto';
}

const TORNILLO =
  'absolute size-1.5 rounded-full bg-zinc-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)]';

/**
 * Accion critica. El boton solo responde con la palanca del seguro abajo;
 * subirla de nuevo cancela la orden. Dos gestos para algo sin vuelta atras.
 */
export function BusterCall({ className }: { className?: string }): React.ReactElement {
  const [armado, setArmado] = useState(false);
  const [emitida, setEmitida] = useState(false);
  const estado = estadoDe(armado, emitida);

  const alternarSeguro = (): void => {
    if (armado) setEmitida(false);
    setArmado(!armado);
  };

  return (
    <section aria-label="Buster Call" className={cn(PANEL, 'grid gap-2.5 p-3', className)}>
      <p role="status" className="sr-only">
        {estado}
      </p>

      <div className="flex items-stretch gap-3">
        <button
          type="button"
          disabled={!armado}
          aria-pressed={emitida}
          title={estado}
          onClick={() => setEmitida(!emitida)}
          className={cn(
            FOCO,
            'min-h-20 flex-1 rounded-lg border-[3px] border-zinc-800 px-2 font-hq-rotulo text-2xl leading-none font-extrabold tracking-wide transition-all sm:text-3xl xl:text-2xl 2xl:text-3xl',
            'shadow-[0_0_0_2px_#52525b,inset_0_3px_0_rgba(255,255,255,0.3),inset_0_-8px_12px_rgba(0,0,0,0.4)]',
            !armado && 'cursor-not-allowed bg-linear-to-b from-red-700 to-red-950 text-red-100/75',
            armado && 'cursor-pointer text-white active:translate-y-0.5',
            armado &&
              !emitida &&
              'bg-linear-to-b from-red-500 via-red-600 to-red-800 hover:from-red-400 hover:via-red-500',
            emitida && 'animate-pulse bg-hq-alerta motion-reduce:animate-none',
          )}
        >
          BUSTER CALL
        </button>

        <button
          type="button"
          role="switch"
          aria-checked={armado}
          aria-label="Quitar el seguro de la Buster Call"
          title={armado ? 'Poner el seguro' : 'Quitar el seguro'}
          onClick={alternarSeguro}
          className={cn(
            FOCO,
            'relative w-16 shrink-0 cursor-pointer rounded-md border border-zinc-500 bg-linear-to-b from-zinc-400 to-zinc-600',
            'shadow-[inset_0_2px_2px_rgba(255,255,255,0.45),0_4px_8px_rgba(0,0,0,0.7)] hover:from-zinc-300',
          )}
        >
          <span className={cn(TORNILLO, 'top-1 left-1')} />
          <span className={cn(TORNILLO, 'top-1 right-1')} />
          <span className={cn(TORNILLO, 'bottom-1 left-1')} />
          <span className={cn(TORNILLO, 'right-1 bottom-1')} />
          <span className="absolute top-3 bottom-3 left-1/2 w-5 -translate-x-1/2 rounded-sm bg-zinc-900 shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)]" />
          <span
            className={cn(
              'absolute left-1/2 h-[46%] w-6 -translate-x-1/2 rounded-sm border border-red-950 transition-[top] duration-200 motion-reduce:transition-none',
              'shadow-[0_4px_6px_rgba(0,0,0,0.7),inset_0_2px_1px_rgba(255,255,255,0.4)]',
              armado
                ? 'top-[46%] bg-linear-to-b from-red-700 to-red-400'
                : 'top-[8%] bg-linear-to-b from-red-400 to-red-700',
            )}
          />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="grid size-6 shrink-0 place-items-center rounded-sm border border-hq-alerta bg-hq-alerta/20 text-hq-alerta">
          <TriangleAlert size={14} aria-hidden="true" />
        </span>
        <span
          aria-hidden="true"
          className={cn(
            'h-4 flex-1 rounded-sm border border-hq-alerta/60 bg-[repeating-linear-gradient(135deg,#ef4444_0_14.14px,#450a0a_14.14px_28.28px)]',
            armado ? 'animate-hq-franjas motion-reduce:animate-none' : 'opacity-70',
          )}
        />
      </div>

      <Esquinas />
    </section>
  );
}
