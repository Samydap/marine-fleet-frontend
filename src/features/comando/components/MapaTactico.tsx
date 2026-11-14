import { useState } from 'react';
import { Sailboat } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { CARTA, NAVES, SECTORES } from '../datos';
import { CartaNaval } from './CartaNaval';
import { FOCO, SOBREIMPRESO } from './estilos';
import { Radar } from './Radar';

interface MapaTacticoProps {
  readonly barrido: boolean;
  readonly rutas: boolean;
}

const CELDA = 'px-1.5 py-px text-right tabular-nums';

/**
 * Carta de la Grand Line con el radar, las tablas y las naves superpuestas.
 * Al elegir una nave se resalta su fila en la tabla de coordenadas.
 */
export function MapaTactico({ barrido, rutas }: MapaTacticoProps): React.ReactElement {
  const [seleccion, setSeleccion] = useState(NAVES[0].id);

  return (
    <div className="relative h-full min-h-80 overflow-hidden rounded-md border border-hq-neon/40">
      <CartaNaval rutas={rutas} />

      <span className="absolute top-[70%] left-[58%] font-hq-cartel text-sm font-bold text-hq-tinta/80 italic">
        Grand Line
      </span>

      {NAVES.map((nave) => {
        const elegida = nave.id === seleccion;
        return (
          <button
            key={nave.id}
            type="button"
            aria-pressed={elegida}
            aria-label={nave.nombre}
            title={nave.nombre}
            onClick={() => setSeleccion(nave.id)}
            style={{
              left: `${(nave.x / CARTA.ancho) * 100}%`,
              top: `${(nave.y / CARTA.alto) * 100}%`,
            }}
            className={cn(
              FOCO,
              'absolute grid size-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full transition-transform hover:scale-125',
              nave.bando === 'marina'
                ? 'bg-hq-azul text-white shadow-[0_0_10px_rgba(0,210,255,0.9)]'
                : 'bg-[#3b0d0d] text-red-200 shadow-[0_0_8px_rgba(0,0,0,0.7)]',
              elegida && 'scale-125 outline-2 outline-offset-1 outline-white',
            )}
          >
            <Sailboat size={18} aria-hidden="true" />
          </button>
        );
      })}

      <Radar activo={barrido} className="absolute top-[4%] left-[3%] w-[27%] max-w-40 min-w-24" />

      <p
        className={cn(
          SOBREIMPRESO,
          'absolute top-[47%] left-[3%] m-0 px-1.5 py-0.5 font-bold tracking-wider',
        )}
      >
        CÓDIGO: <span className="text-hq-neon">25.345</span>
      </p>

      <p
        className={cn(
          SOBREIMPRESO,
          'absolute top-2 left-1/2 m-0 -translate-x-1/2 px-2 py-0.5 font-bold tracking-[0.14em]',
        )}
      >
        GRAND LINE
      </p>

      <table className={cn(SOBREIMPRESO, 'absolute top-2 right-2 border-collapse')}>
        <caption className="border-b border-hq-neon/40 px-1.5 py-0.5 text-center font-bold text-hq-neon">
          Coordenadas
        </caption>
        <tbody>
          {NAVES.map((nave) => (
            <tr
              key={nave.id}
              className={cn(nave.id === seleccion && 'bg-hq-neon/25 font-bold text-white')}
            >
              <th scope="row" className="px-1.5 py-px text-left font-normal text-cyan-300/80">
                {nave.id}
              </th>
              <td className={CELDA}>{nave.latitud}</td>
              <td className={CELDA}>{nave.longitud}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table
        className={cn(SOBREIMPRESO, 'absolute right-2 bottom-2 hidden border-collapse sm:table')}
      >
        <thead>
          <tr className="border-b border-hq-neon/40 text-hq-neon">
            <th scope="col" title="Sector" className={CELDA}>
              N
            </th>
            <th scope="col" title="Buques desplegados" className={CELDA}>
              B
            </th>
            <th scope="col" title="Contactos" className={CELDA}>
              C
            </th>
          </tr>
        </thead>
        <tbody>
          {SECTORES.map(([sector, buques, contactos]) => (
            <tr key={sector}>
              <td className={cn(CELDA, 'text-cyan-300/80')}>{sector}</td>
              <td className={CELDA}>{buques}</td>
              <td className={CELDA}>{contactos}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className={cn(SOBREIMPRESO, 'absolute bottom-2 left-2 m-0 px-2 py-1')}>
        <dt className="font-bold text-hq-neon">Rutas</dt>
        <dd className="m-0 flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-[#f5d06a]" />
          Patrulla <span className="ml-auto pl-2 tabular-nums">106.6</span>
        </dd>
        <dd className="m-0 flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-white" />
          Intercepción <span className="ml-auto pl-2 tabular-nums">96.3</span>
        </dd>
      </dl>
    </div>
  );
}
