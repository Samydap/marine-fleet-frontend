import { useState } from 'react';
import { Bell, ChevronDown, LogOut, Mail, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ETIQUETA_ROL } from '@core/session/permiso.enum';
import { useUsuario } from '@core/session/session.store';
import { cn } from '@shared/utils/cn';
import { MENSAJES, NOTIFICACIONES, type Aviso } from '../datos';
import { FOCO, ROTULO } from './estilos';
import { Retrato } from './Retrato';

const DESPLEGABLE =
  'absolute top-full right-0 z-30 mt-2 rounded-lg border border-hq-neon/45 bg-hq-casco p-2 shadow-[0_0_18px_rgba(0,210,255,0.35)]';

const SEPARADOR = 'mx-1 h-8 w-px bg-hq-neon/30';

/** Gaviota de la Marina sobre el rotulo. */
function LogoMarina(): React.ReactElement {
  return (
    <span className="flex flex-col items-center rounded-md border border-hq-neon/60 px-2.5 py-1 text-hq-neon shadow-[inset_0_0_12px_rgba(0,210,255,0.25)]">
      <svg viewBox="0 0 48 14" aria-hidden="true" focusable="false" className="block h-3.5 w-12">
        <path
          d="M1 12C7 3 16 1 24 8c8-7 17-5 23 4-7-5-15-5-23 1-8-6-16-6-23-1z"
          fill="currentColor"
        />
      </svg>
      <span className="font-hq-rotulo text-sm leading-none font-extrabold tracking-[0.1em]">
        MARINE
      </span>
    </span>
  );
}

/** Escudo alado de rango, en dorado y azul. */
function Emblema(): React.ReactElement {
  return (
    <svg viewBox="0 0 60 44" aria-hidden="true" focusable="false" className="block h-10 w-14">
      <g fill="#e2b34a" stroke="#8a6414" strokeWidth="1">
        <path d="M22 12C14 8 6 8 1 12c6 0 10 2 13 6-5-1-8 0-11 2 6 0 10 3 13 8l8-6z" />
        <path d="M38 12c8-4 16-4 21 0-6 0-10 2-13 6 5-1 8 0 11 2-6 0-10 3-13 8l-8-6z" />
      </g>
      <path d="M30 4l13 5v11c0 9-5 15-13 20-8-5-13-11-13-20V9z" fill="#1c4f9c" stroke="#e2b34a" />
      <path
        d="M30 13l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"
        fill="#f4d27a"
      />
    </svg>
  );
}

interface BandejaProps {
  readonly etiqueta: string;
  readonly icono: LucideIcon;
  readonly avisos: readonly Aviso[];
}

/** Icono con contador rojo; al abrirlo muestra los avisos y los da por leidos. */
function Bandeja({ etiqueta, icono: Icono, avisos }: BandejaProps): React.ReactElement {
  const [abierta, setAbierta] = useState(false);
  const [leidos, setLeidos] = useState(false);
  const pendientes = leidos ? 0 : avisos.length;

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={abierta}
        aria-label={`${etiqueta}: ${pendientes} sin leer`}
        onClick={() => {
          setAbierta(!abierta);
          setLeidos(true);
        }}
        className={cn(
          FOCO,
          'relative grid size-10 cursor-pointer place-items-center rounded-md text-hq-neon transition-colors hover:bg-hq-neon/15 hover:text-white',
          abierta && 'bg-hq-neon/20 text-white',
        )}
      >
        <Icono size={22} aria-hidden="true" fill="currentColor" fillOpacity={0.25} />
        {pendientes > 0 && (
          <span className="absolute top-0.5 right-0.5 grid size-4 place-items-center rounded-full bg-hq-alerta text-[11px] leading-none font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.9)]">
            {pendientes}
          </span>
        )}
      </button>

      {abierta && (
        <div className={cn(DESPLEGABLE, 'w-64')}>
          <p className={cn(ROTULO, 'm-0 px-2 pb-1')}>{etiqueta}</p>
          <ul className="m-0 list-none p-0">
            {avisos.map((aviso) => (
              <li key={aviso.id} className="rounded-md px-2 py-1.5 text-sm text-cyan-50">
                {aviso.texto}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Oficial de guardia; su menu lleva de vuelta al sistema. */
function Perfil(): React.ReactElement {
  const usuario = useUsuario();
  const [abierto, setAbierto] = useState(false);
  const nombre = usuario?.nombreCompleto ?? 'Oficial';
  const cargo = usuario ? ETIQUETA_ROL[usuario.rol] : 'Almirante';

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={abierto}
        aria-label={`Menú de ${nombre}`}
        onClick={() => setAbierto(!abierto)}
        className={cn(
          FOCO,
          'flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-hq-neon/15',
        )}
      >
        <span className="relative block size-9 shrink-0">
          <Retrato
            clave="oficial"
            rasgo="gorra"
            fondo="#1e3a5f"
            tinta="#0a1422"
            className="size-9 rounded-full border border-hq-neon/70"
          />
          <span
            title="En línea"
            className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-hq-casco bg-emerald-400"
          />
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block max-w-36 truncate font-hq-rotulo text-sm font-extrabold tracking-wide text-white uppercase">
            {nombre}
          </span>
          <span className="block max-w-36 truncate text-xs text-cyan-300/75">{cargo}</span>
        </span>
        <ChevronDown size={16} aria-hidden="true" className="shrink-0 text-hq-neon" />
      </button>

      {abierto && (
        <div className={cn(DESPLEGABLE, 'w-52')}>
          <Link
            to="/"
            className={cn(
              FOCO,
              'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-cyan-50 no-underline transition-colors hover:bg-hq-neon/15',
            )}
          >
            <LogOut size={15} aria-hidden="true" />
            Volver al sistema
          </Link>
        </div>
      )}
    </div>
  );
}

/** Cabecera del centro de comando: logo, emblema, titulo, bandejas y perfil. */
export function BarraSuperior(): React.ReactElement {
  return (
    <header className="relative z-20 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-hq-neon/45 bg-linear-to-b from-hq-panel to-hq-casco px-3 py-1.5 shadow-[0_2px_14px_rgba(0,210,255,0.2)]">
      <LogoMarina />
      <Emblema />
      <h1 className="order-last m-0 basis-full font-hq-rotulo text-lg font-extrabold tracking-wide text-white uppercase sm:order-none sm:basis-auto sm:text-xl">
        Marine Fleet &amp; Bounty <span className="text-hq-neon">HQ</span>
      </h1>

      <div className="ml-auto flex items-center">
        <span aria-hidden="true" className={SEPARADOR} />
        <Bandeja etiqueta="Notificaciones" icono={Bell} avisos={NOTIFICACIONES} />
        <Bandeja etiqueta="Mensajes" icono={Mail} avisos={MENSAJES} />
        <span aria-hidden="true" className={SEPARADOR} />
        <Perfil />
      </div>
    </header>
  );
}
