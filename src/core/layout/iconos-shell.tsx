import type { ReactNode } from 'react';
import type { ClaveFeature } from '../session/navegacion';

/**
 * Iconos del shell (barra lateral, avisos, acceso denegado). Mismo trazo que
 * los de shared/ui/iconos.tsx: 24px de caja, trazo 1.75, `currentColor`.
 * Viven aparte porque core/ no puede importar de shared/.
 */
function Trazo({
  children,
  tamano = 20,
}: {
  readonly children: ReactNode;
  readonly tamano?: number;
}): React.ReactElement {
  return (
    <svg
      className="icono"
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

const ICONOS_FEATURE: Readonly<Record<ClaveFeature, ReactNode>> = {
  // Expediente con ficha de identificacion.
  criminales: (
    <>
      <path d="M5 3.5h10l4 4v13H5z" />
      <path d="M15 3.5v4h4" />
      <circle cx="12" cy="11.5" r="2.25" />
      <path d="M8.5 17.5c.7-1.8 2-2.75 3.5-2.75s2.8.95 3.5 2.75" />
    </>
  ),
  // Cartel clavado.
  carteles: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="1" />
      <circle cx="12" cy="4" r="1.25" />
      <path d="M8.5 8.5h7" />
      <rect x="8.5" y="11" width="7" height="5" />
      <path d="M9.5 18.5h5" />
    </>
  ),
  // Pila de monedas.
  recompensas: (
    <>
      <ellipse cx="12" cy="6.5" rx="6.5" ry="2.5" />
      <path d="M5.5 6.5v4c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-4" />
      <path d="M5.5 10.5v4c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-4" />
      <path d="M5.5 14.5v3c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-3" />
    </>
  ),
  // Catalejo sobre tripode.
  inteligencia: (
    <>
      <path d="M3.5 13.5 15 8l1.6 3.4-11.5 5.5z" />
      <path d="m16.6 11.4 3.3-1.6-1.6-3.4-3.3 1.6" />
      <path d="M10.5 14.6 8 21" />
      <path d="M10.5 14.6 13 21" />
    </>
  ),
  // Escudo con aviso.
  amenaza: (
    <>
      <path d="M12 3.5 19 6v5.5c0 4.3-2.9 7.6-7 9-4.1-1.4-7-4.7-7-9V6z" />
      <path d="M12 8.5v4" />
      <path d="M12 15.75h.01" />
    </>
  ),
  // Timon.
  operativos: (
    <>
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="1.75" />
      <path d="M12 2.5v3.5M12 18v3.5M2.5 12H6M18 12h3.5" />
      <path d="m5.3 5.3 2.5 2.5M16.2 16.2l2.5 2.5M5.3 18.7l2.5-2.5M16.2 7.8l2.5-2.5" />
    </>
  ),
  // Sables cruzados.
  incidentes: (
    <>
      <path d="m4 4 11.5 11.5" />
      <path d="M20 4 8.5 15.5" />
      <path d="m13.5 17.5 4-4M10.5 17.5l-4-4" />
      <path d="m17 17 3 3M7 17l-3 3" />
    </>
  ),
  // Reglaje: controles de mando.
  admin: (
    <>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
      <path d="M4 12h3M11 12h9" />
      <circle cx="9" cy="12" r="0.5" />
    </>
  ),
};

export function IconoFeature({ clave }: { readonly clave: ClaveFeature }): React.ReactElement {
  return <Trazo>{ICONOS_FEATURE[clave]}</Trazo>;
}

export function IconoMenu(): React.ReactElement {
  return (
    <Trazo tamano={22}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Trazo>
  );
}

export function IconoCerrar({ tamano = 20 }: { readonly tamano?: number }): React.ReactElement {
  return (
    <Trazo tamano={tamano}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Trazo>
  );
}

export function IconoSalir(): React.ReactElement {
  return (
    <Trazo tamano={18}>
      <path d="M14 4h4a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 18 20h-4" />
      <path d="M10 8l-4 4 4 4" />
      <path d="M6 12h9" />
    </Trazo>
  );
}

export function IconoCandado(): React.ReactElement {
  return (
    <Trazo tamano={28}>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      <path d="M12 14.5v2" />
    </Trazo>
  );
}

export function IconoAviso({
  tipo,
}: {
  readonly tipo: 'info' | 'exito' | 'error';
}): React.ReactElement {
  if (tipo === 'exito') {
    return (
      <Trazo>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12.5 2.75 2.75L16 9.75" />
      </Trazo>
    );
  }
  if (tipo === 'error') {
    return (
      <Trazo>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5.25" />
        <path d="M12 16.25h.01" />
      </Trazo>
    );
  }
  return (
    <Trazo>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 7.75h.01" />
    </Trazo>
  );
}
