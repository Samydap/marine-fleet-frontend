import { useId } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { PANEL, SCROLL } from './estilos';

interface MarcoProps {
  readonly titulo: string;
  readonly subtitulo?: string;
  readonly icono?: LucideIcon;
  /** Botones a la derecha del titulo. */
  readonly acciones?: React.ReactNode;
  readonly className?: string;
  /** Clases del cuerpo; por defecto lleva relleno y desplazamiento propio. */
  readonly cuerpoClassName?: string;
  readonly children: React.ReactNode;
}

const ESQUINA = 'pointer-events-none absolute size-2.5 border-hq-neon';

/** Las cuatro esquinas brillantes que rematan el borde de un panel. */
export function Esquinas(): React.ReactElement {
  return (
    <>
      <span aria-hidden="true" className={cn(ESQUINA, '-top-px -left-px border-t-2 border-l-2')} />
      <span aria-hidden="true" className={cn(ESQUINA, '-top-px -right-px border-t-2 border-r-2')} />
      <span
        aria-hidden="true"
        className={cn(ESQUINA, '-bottom-px -left-px border-b-2 border-l-2')}
      />
      <span
        aria-hidden="true"
        className={cn(ESQUINA, '-right-px -bottom-px border-r-2 border-b-2')}
      />
    </>
  );
}

/** Panel grande del tablero: titulo en la esquina, acciones y cuerpo. */
export function Marco({
  titulo,
  subtitulo,
  icono: Icono,
  acciones,
  className,
  cuerpoClassName,
  children,
}: MarcoProps): React.ReactElement {
  const idTitulo = useId();

  return (
    <section aria-labelledby={idTitulo} className={cn(PANEL, 'flex min-h-0 flex-col', className)}>
      <header className="flex items-start gap-2 px-3 pt-2.5 pb-2">
        {Icono && <Icono size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-hq-neon" />}
        <div className="min-w-0 flex-1">
          <h2
            id={idTitulo}
            className="m-0 truncate font-hq-rotulo text-[15px] leading-tight font-extrabold tracking-wide text-white uppercase"
          >
            {titulo}
          </h2>
          {subtitulo && <p className="m-0 truncate text-xs text-cyan-300/75">{subtitulo}</p>}
        </div>
        {acciones && <div className="flex shrink-0 items-center gap-0.5">{acciones}</div>}
      </header>
      <div className={cn('min-h-0 flex-1 overflow-y-auto px-3 pb-3', SCROLL, cuerpoClassName)}>
        {children}
      </div>
      <Esquinas />
    </section>
  );
}
