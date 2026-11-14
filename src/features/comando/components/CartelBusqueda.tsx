import { useState } from 'react';
import { Eye, Settings, Star, Trash2 } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { formatearRecompensa, type CartelBuscado } from '../datos';
import { FOCO } from './estilos';
import { Retrato } from './Retrato';

interface CartelBusquedaProps {
  readonly cartel: CartelBuscado;
  readonly onCapturar: (id: string) => void;
  readonly onPriorizar: (id: string) => void;
}

const ACCION =
  'grid h-6 cursor-pointer place-items-center rounded-sm border transition-colors aria-pressed:text-white';

/** Borde irregular de papel rasgado. */
const RASGADO =
  '[clip-path:polygon(1%_1%,18%_0,37%_1.2%,58%_0,80%_1%,99%_0,100%_22%,99%_45%,100%_70%,99%_99%,78%_100%,55%_99%,30%_100%,1%_99%,0_72%,1%_48%,0_24%)]';

/** El nombre se encoge segun su longitud para caber en el ancho del cartel. */
function tamanoNombre(nombre: string): string {
  if (nombre.length <= 6) return 'text-[15cqw]';
  if (nombre.length <= 8) return 'text-[12cqw]';
  return 'text-[10cqw]';
}

/**
 * Cartel de SE BUSCA sobre papel envejecido, con sus tres acciones debajo:
 * ver la ficha, marcarlo como prioritario y registrar la captura.
 *
 * Los textos se dimensionan con unidades de contenedor (cqw): el cartel guarda
 * sus proporciones a cualquier ancho de columna.
 */
export function CartelBusqueda({
  cartel,
  onCapturar,
  onPriorizar,
}: CartelBusquedaProps): React.ReactElement {
  const [verFicha, setVerFicha] = useState(false);

  return (
    <article
      aria-label={`Cartel de ${cartel.nombre}`}
      className="@container flex min-w-0 flex-col gap-1.5"
    >
      <div className="relative drop-shadow-[0_5px_6px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-1 hover:-rotate-1 motion-reduce:transition-none">
        <div
          className={cn(
            RASGADO,
            'bg-[radial-gradient(ellipse_at_center,#f1e1b6_45%,#d3b077_100%)] px-[6cqw] pt-[3cqw] pb-[4cqw] font-hq-cartel text-hq-tinta',
          )}
        >
          <p className="m-0 text-center text-[19cqw] leading-none font-black tracking-[0.04em]">
            WANTED
          </p>

          <div className="relative mt-[2cqw] aspect-[5/4] overflow-hidden border-2 border-hq-tinta/80">
            <Retrato
              clave={cartel.id}
              rasgo={cartel.rasgo}
              fondo={cartel.fondo}
              className="h-full w-full"
            />

            {cartel.capturado && (
              <span className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="-rotate-12 border-[0.9cqw] border-red-600 bg-white/55 px-[2cqw] py-[0.5cqw] font-hq-rotulo text-[12.5cqw] leading-none font-extrabold tracking-wide text-red-600">
                  CAPTURED
                </span>
              </span>
            )}

            {verFicha && (
              <dl className="absolute inset-0 m-0 flex flex-col justify-center gap-[2cqw] bg-hq-abismo/92 px-[5cqw] font-mono text-[7cqw] leading-tight text-cyan-50">
                <div>
                  <dt className="text-cyan-300/75">Alias</dt>
                  <dd className="m-0 font-bold">{cartel.alias}</dd>
                </div>
                <div>
                  <dt className="text-cyan-300/75">Zona</dt>
                  <dd className="m-0 font-bold">{cartel.zona}</dd>
                </div>
                <div>
                  <dt className="text-cyan-300/75">Amenaza</dt>
                  <dd
                    className={cn(
                      'm-0 font-bold',
                      cartel.amenaza === 'ALTA' ? 'text-red-300' : 'text-hq-ambar',
                    )}
                  >
                    {cartel.amenaza}
                  </dd>
                </div>
              </dl>
            )}
          </div>

          <p className="m-0 pt-[2cqw] text-center text-[6.5cqw] leading-none font-bold tracking-[0.12em]">
            DEAD OR ALIVE
          </p>
          <h3
            className={cn(
              'm-0 text-center leading-[1.05] font-black tracking-wide whitespace-nowrap',
              tamanoNombre(cartel.nombre),
            )}
          >
            {cartel.nombre}
          </h3>
          <p className="m-0 text-center text-[8.5cqw] leading-tight font-bold whitespace-nowrap">
            {formatearRecompensa(cartel.recompensa)}
          </p>
          <p className="m-0 text-right text-[4.5cqw] leading-none tracking-[0.3em]">MARINE</p>
        </div>

        {cartel.prioritario && (
          <span
            title="Prioritario"
            className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full bg-hq-ambar text-hq-tinta shadow-[0_0_8px_rgba(245,184,61,0.9)]"
          >
            <Star size={14} aria-hidden="true" fill="currentColor" />
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1">
        <button
          type="button"
          aria-pressed={verFicha}
          aria-label={`Ver la ficha de ${cartel.nombre}`}
          onClick={() => setVerFicha(!verFicha)}
          className={cn(
            FOCO,
            ACCION,
            'border-blue-300/60 bg-blue-700 text-blue-100 hover:bg-blue-600 aria-pressed:bg-blue-500',
          )}
        >
          <Eye size={14} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-pressed={cartel.prioritario}
          aria-label={`Marcar a ${cartel.nombre} como prioritario`}
          onClick={() => onPriorizar(cartel.id)}
          className={cn(
            FOCO,
            ACCION,
            'border-sky-300/60 bg-sky-700 text-sky-100 hover:bg-sky-600 aria-pressed:bg-sky-500',
          )}
        >
          <Settings size={14} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-pressed={cartel.capturado}
          aria-label={`Registrar la captura de ${cartel.nombre}`}
          onClick={() => onCapturar(cartel.id)}
          className={cn(
            FOCO,
            ACCION,
            'border-red-300/60 bg-red-700 text-red-100 hover:bg-red-600 aria-pressed:bg-red-500',
          )}
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
