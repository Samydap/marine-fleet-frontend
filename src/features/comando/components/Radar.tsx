import { cn } from '@shared/utils/cn';

interface RadarProps {
  /** En pausa, el barrido y los ecos se detienen. */
  readonly activo: boolean;
  readonly className?: string;
}

/** Ecos detectados, en porcentaje del diametro de la pantalla. */
const CONTACTOS = [
  { id: 'c1', x: 63, y: 29 },
  { id: 'c2', x: 33, y: 58 },
  { id: 'c3', x: 71, y: 69 },
] as const;

const ANILLO = 'absolute rounded-full border border-emerald-300/40';
const EJE =
  'absolute top-1/2 left-1/2 h-px w-full -translate-x-1/2 -translate-y-1/2 bg-emerald-300/30';

/** Esfera de radar: anillos de distancia, ejes y barrido giratorio. */
export function Radar({ activo, className }: RadarProps): React.ReactElement {
  return (
    <div
      role="img"
      aria-label={activo ? `Radar en barrido: ${CONTACTOS.length} contactos` : 'Radar en pausa'}
      className={cn(
        'relative aspect-square overflow-hidden rounded-full border-2 border-emerald-300/85',
        'bg-[radial-gradient(circle,rgba(16,185,129,0.4)_0%,rgba(4,34,44,0.94)_75%)]',
        'shadow-[0_0_16px_rgba(52,211,153,0.6),inset_0_0_18px_rgba(52,211,153,0.35)]',
        className,
      )}
    >
      <span className={cn(ANILLO, 'inset-[16%]')} />
      <span className={cn(ANILLO, 'inset-[33%]')} />
      <span className={EJE} />
      <span className={cn(EJE, 'rotate-45')} />
      <span className={cn(EJE, 'rotate-90')} />
      <span className={cn(EJE, 'rotate-135')} />

      <span
        className={cn(
          'absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,rgba(110,231,183,0.7),transparent_80deg)] motion-reduce:animate-none',
          activo ? 'animate-hq-barrido' : 'opacity-40',
        )}
      />

      {CONTACTOS.map((contacto) => (
        <span
          key={contacto.id}
          style={{ left: `${contacto.x}%`, top: `${contacto.y}%` }}
          className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-200 shadow-[0_0_8px_rgba(167,243,208,0.95)]"
        >
          {activo && (
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-200 motion-reduce:animate-none" />
          )}
        </span>
      ))}
    </div>
  );
}
