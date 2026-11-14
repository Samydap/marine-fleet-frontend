import type { ReactNode } from 'react';

/**
 * Iconos de shared/ui. Regla del sistema: SVG propios, caja de 24, trazo 1.75,
 * extremos redondeados y `currentColor`. Nunca emojis ni caracteres Unicode.
 *
 * Todos son decorativos (aria-hidden): el texto que los acompana da el sentido.
 * Si un boton solo lleva icono, el boton lleva `aria-label`.
 */
interface PropsIcono {
  readonly tamano?: number;
  readonly className?: string;
}

function Trazo({
  children,
  tamano = 20,
  className,
}: PropsIcono & { readonly children: ReactNode }): React.ReactElement {
  return (
    <svg
      className={className ? `icono ${className}` : 'icono'}
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

export type Icono = (props: PropsIcono) => React.ReactElement;

const crear =
  (trazos: ReactNode): Icono =>
  (props) => <Trazo {...props}>{trazos}</Trazo>;

// --- Acciones -----------------------------------------------------------------

export const IconoBuscar = crear(
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.4-4.4" />
  </>,
);

export const IconoCerrar = crear(<path d="M6 6l12 12M18 6 6 18" />);

export const IconoMas = crear(<path d="M12 5v14M5 12h14" />);

export const IconoFiltro = crear(
  <>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </>,
);

export const IconoDescargar = crear(
  <>
    <path d="M12 4v11" />
    <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
    <path d="M5 19.5h14" />
  </>,
);

export const IconoImprimir = crear(
  <>
    <path d="M7 9V4h10v5" />
    <rect x="4" y="9" width="16" height="7" rx="1.5" />
    <path d="M7 14h10v6H7z" />
  </>,
);

export const IconoRecargar = crear(
  <>
    <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
    <path d="M19.5 4.5v4h-4" />
  </>,
);

export const IconoEditar = crear(
  <>
    <path d="M14.5 5.5 18.5 9.5" />
    <path d="M4.5 19.5 5.5 15 15.8 4.7a1.4 1.4 0 0 1 2 0l1.5 1.5a1.4 1.4 0 0 1 0 2L9 18.5z" />
  </>,
);

export const IconoAnterior = crear(<path d="m14.5 6-6 6 6 6" />);
export const IconoSiguiente = crear(<path d="m9.5 6 6 6-6 6" />);
export const IconoChevronAbajo = crear(<path d="m6 9.5 6 6 6-6" />);

// --- Estados ------------------------------------------------------------------

export const IconoAlerta = crear(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.25" />
    <path d="M12 16.25h.01" />
  </>,
);

export const IconoInfo = crear(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 7.75h.01" />
  </>,
);

export const IconoExito = crear(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 2.75 2.75L16 9.75" />
  </>,
);

export const IconoCandado = crear(
  <>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    <path d="M12 14.5v2" />
  </>,
);

export const IconoSinSenal = crear(
  <>
    <path d="M2.5 8.5a14 14 0 0 1 6-3.2" />
    <path d="M15.5 5.3a14 14 0 0 1 6 3.2" />
    <path d="M5.5 12a9.5 9.5 0 0 1 3.6-2.1" />
    <path d="M14.9 9.9a9.5 9.5 0 0 1 3.6 2.1" />
    <path d="M9 15.4a4.5 4.5 0 0 1 6 0" />
    <path d="M12 19h.01" />
    <path d="M3 3l18 18" />
  </>,
);

/** Archivo vacio: el icono por defecto de EstadoVacio. */
export const IconoArchivoVacio = crear(
  <>
    <path d="M4 8.5 6 4.5h12l2 4" />
    <path d="M4 8.5h5l1 2h4l1-2h5v10a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" />
  </>,
);

/** Brujula: "sin resultados para estos filtros". */
export const IconoBrujula = crear(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m14.8 9.2-1.9 3.7-3.7 1.9 1.9-3.7z" />
  </>,
);

// --- Tipos de criminal (InsigniaTipoCriminal) --------------------------------
// El pirata lleva el Jolly Roger (calavera sobre dos huesos cruzados), motivo
// del universo; el revolucionario y el independiente son disenos propios.

/** Pirata: Jolly Roger sobrio, craneo sobre dos huesos cruzados. */
export const IconoPirata = crear(
  <>
    <path d="M5 14.5 19 20M19 14.5 5 20" />
    <path d="M12 3.5a5.5 5.5 0 0 0-5.5 5.5c0 2 .9 3.3 2.2 4.2V15h6.6v-1.8c1.3-.9 2.2-2.2 2.2-4.2A5.5 5.5 0 0 0 12 3.5z" />
    <circle cx="9.9" cy="9.6" r="1" />
    <circle cx="14.1" cy="9.6" r="1" />
    <path d="M12 11.5v1.2" />
  </>,
);

/** Ejercito Revolucionario: antorcha encendida. */
export const IconoRevolucionario = crear(
  <>
    <path d="M12 3.5c2.2 2 3.3 3.8 3.3 5.4a3.3 3.3 0 0 1-6.6 0c0-1 .5-2 1.3-2.9.2 1 .7 1.6 1.4 1.8-.2-1.4.1-2.8.6-4.3z" />
    <path d="M8.5 12.5h7l-1.5 2.5h-4z" />
    <path d="M11 15v5.5h2V15" />
  </>,
);

/** Organizacion criminal independiente: eslabones de cadena (sindicato, carteles). */
export const IconoIndependiente = crear(
  <>
    <rect x="3" y="9" width="9.5" height="6" rx="3" transform="rotate(-30 7.75 12)" />
    <rect x="11.5" y="9" width="9.5" height="6" rx="3" transform="rotate(-30 16.25 12)" />
  </>,
);

/** Sin afiliacion: circulo discontinuo. */
export const IconoSinAfiliacion = crear(<circle cx="12" cy="12" r="7.5" strokeDasharray="3 3" />);
