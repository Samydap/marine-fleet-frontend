import type { ReactNode } from 'react';

/** Iconos de la pantalla de acceso: 20px, trazo 1.75 y `currentColor`. */
function Icono({ children }: { readonly children: ReactNode }): React.ReactElement {
  return (
    <svg
      className="icono"
      width="20"
      height="20"
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

export function IconoAlerta(): React.ReactElement {
  return (
    <Icono>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.25" />
      <path d="M12 16.25h.01" />
    </Icono>
  );
}

export function IconoCandado(): React.ReactElement {
  return (
    <Icono>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      <path d="M12 14.5v2" />
    </Icono>
  );
}

export function IconoSinSenal(): React.ReactElement {
  return (
    <Icono>
      <path d="M2.5 8.5a14 14 0 0 1 6-3.2" />
      <path d="M15.5 5.3a14 14 0 0 1 6 3.2" />
      <path d="M5.5 12a9.5 9.5 0 0 1 3.6-2.1" />
      <path d="M14.9 9.9a9.5 9.5 0 0 1 3.6 2.1" />
      <path d="M9 15.4a4.5 4.5 0 0 1 6 0" />
      <path d="M12 19h.01" />
      <path d="M3 3l18 18" />
    </Icono>
  );
}

export function IconoOjo(): React.ReactElement {
  return (
    <Icono>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Icono>
  );
}

export function IconoOjoTachado(): React.ReactElement {
  return (
    <Icono>
      <path d="M10.6 5.6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16.7 16.7 0 0 1-2.6 3.4" />
      <path d="M6.6 6.6C3.9 8.3 2.5 12 2.5 12S6 18.5 12 18.5a9.3 9.3 0 0 0 5.4-1.7" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="M3 3l18 18" />
    </Icono>
  );
}
