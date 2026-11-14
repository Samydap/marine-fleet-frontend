import { cn } from '@shared/utils/cn';
import { PANEL, TITULO_MENOR } from './estilos';
import { Esquinas } from './Marco';

interface LecturaProps {
  readonly etiqueta: string;
  readonly valor: string;
}

function Lectura({ etiqueta, valor }: LecturaProps): React.ReactElement {
  return (
    <div className="rounded border border-hq-neon/40 bg-hq-abismo/80 px-2 py-0.5 text-center">
      <dt className="sr-only">{etiqueta}</dt>
      <dd title={etiqueta} className="m-0 font-mono text-xs font-bold text-cyan-50">
        {valor}
      </dd>
    </div>
  );
}

/** Mapamundi punteado con dos lecturas: deriva y cobertura cartografica. */
export function PanelMapas(): React.ReactElement {
  return (
    <section aria-label="Mapas" className={cn(PANEL, 'flex flex-col gap-2 p-3')}>
      <h3 className={cn(TITULO_MENOR, 'uppercase')}>Mapas</h3>

      <svg
        viewBox="0 0 200 96"
        aria-hidden="true"
        focusable="false"
        className="block min-h-0 w-full flex-1"
      >
        <defs>
          <pattern id="hq-puntos" width="4.5" height="4.5" patternUnits="userSpaceOnUse">
            <circle cx="1.3" cy="1.3" r="1.15" fill="#3fd8ff" />
          </pattern>
        </defs>
        <g fill="url(#hq-puntos)">
          <path d="M14 20c10-10 30-12 42-6s8 14 0 18-8 8-12 14-10 2-12-6-14-6-18-12z" />
          <path d="M48 52c8-4 16 0 16 10s-4 18-10 26-8-4-8-14-6-18 2-22z" />
          <path d="M90 18c8-6 20-6 24 0s0 10-8 12-12 0-16-4-4-6 0-8z" />
          <path d="M92 38c10-6 22-2 26 8s-2 22-8 30-14 2-16-10-10-22-2-28z" />
          <path d="M120 14c16-10 46-10 62 0s10 22-4 26-18 16-30 12-12-12-22-14-16-16-6-24z" />
          <path d="M156 66c10-6 22-2 24 6s-6 12-14 12-14-10-10-18z" />
        </g>
        <path d="M0 48h200M100 0v96" stroke="#00d2ff" strokeOpacity="0.25" strokeDasharray="2 4" />
      </svg>

      <dl className="m-0 grid grid-cols-2 gap-2">
        <Lectura etiqueta="Deriva" valor="0/h" />
        <Lectura etiqueta="Cobertura" valor="52%" />
      </dl>

      <Esquinas />
    </section>
  );
}
