import type { CSSProperties, ReactNode } from 'react';
import { AccesoDenegado } from '@core/guards/AccesoDenegado';
import { ApiError } from '@core/models/api-response';
import { Boton, BotonEnlace } from './Boton';
import {
  IconoAlerta,
  IconoAnterior,
  IconoArchivoVacio,
  IconoRecargar,
  IconoSinSenal,
} from './iconos';

/**
 * Los cuatro estados que toda pantalla disena antes de darse por terminada
 * (DISENO.md, Estados): vacio, carga, error y sin permiso.
 */

/**
 * - `bloque` (defecto): recuadro propio, suelto en la pagina o en una tabla.
 * - `pantalla`: ocupa el area de contenido (ficha que no cargo, bandeja vacia).
 * - `en-panel`: dentro de un panel que ya tiene borde y fondo; sin marco
 *   propio, para no pintar una tarjeta dentro de otra.
 */
export type VarianteEstado = 'bloque' | 'pantalla' | 'en-panel';

interface PropsEstadoVacio {
  /** Que falta, en positivo: "Aún no hay operativos en tu base". */
  readonly titulo: string;
  /** Por que, o que hacer: "Cuando el Coordinador cree uno, aparecerá aquí." */
  readonly detalle?: ReactNode;
  /** Icono de shared/ui/iconos. Por defecto, un archivo vacio. */
  readonly icono?: ReactNode;
  /** La accion para salir del vacio (BotonEnlace "Registrar criminal"). */
  readonly children?: ReactNode;
  readonly variante?: VarianteEstado;
}

/**
 * Vacio. Dos casos distintos, dos textos distintos:
 *  - no hay datos todavia: titulo + accion para crearlos;
 *  - los filtros no devuelven nada: titulo + "Limpiar filtros".
 */
export function EstadoVacio({
  titulo,
  detalle,
  icono,
  children,
  variante = 'bloque',
}: PropsEstadoVacio): React.ReactElement {
  return (
    <div className={`estado estado--${variante}`} role="status">
      <span className="estado-icono">{icono ?? <IconoArchivoVacio tamano={28} />}</span>
      <p className="estado-titulo">{titulo}</p>
      {detalle && <p className="estado-detalle">{detalle}</p>}
      {children && <div className="estado-acciones">{children}</div>}
    </div>
  );
}

interface PropsEstadoError {
  /** El error capturado (ApiError o cualquier otro). Decide el texto por defecto. */
  readonly error?: unknown;
  readonly titulo?: string;
  readonly detalle?: ReactNode;
  /** Si existe, muestra "Reintentar" (salvo en un 404: reintentar no lo trae de vuelta). */
  readonly onReintentar?: () => void;
  /**
   * Salida de una ficha: { a: '/criminales', etiqueta: 'Criminales' } pinta
   * "Volver a Criminales". En un 404 es la unica accion.
   */
  readonly volver?: { readonly a: string; readonly etiqueta: string };
  readonly reintentando?: boolean;
  readonly variante?: VarianteEstado;
}

function describir(error: unknown): { titulo: string; detalle: string; sinRed: boolean } {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return {
        titulo: 'Sin conexión con el servidor',
        detalle: 'No hubo respuesta. Comprueba tu red; puedes reintentar sin perder nada.',
        sinRed: true,
      };
    }
    if (error.status === 403) {
      return {
        titulo: 'Tu rol no tiene acceso a esta información',
        detalle: error.message,
        sinRed: false,
      };
    }
    if (error.status === 404) {
      return {
        titulo: 'No encontramos este registro',
        detalle: 'Puede que se haya eliminado o que el enlace esté mal.',
        sinRed: false,
      };
    }
    if (error.status >= 500) {
      return {
        titulo: 'El servidor no pudo responder',
        detalle: 'Inténtalo en unos segundos. Si persiste, avisa al equipo de sistemas.',
        sinRed: false,
      };
    }
    return { titulo: 'No se pudo cargar la información', detalle: error.message, sinRed: false };
  }
  return {
    titulo: 'No se pudo cargar la información',
    detalle: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
    sinRed: false,
  };
}

/** Error de carga: que paso y la salida. Nunca un spinner eterno. */
export function EstadoError({
  error,
  titulo,
  detalle,
  onReintentar,
  reintentando,
  volver,
  variante = 'bloque',
}: PropsEstadoError): React.ReactElement {
  const base = describir(error);
  const noExiste = error instanceof ApiError && error.status === 404;
  const reintentar = noExiste ? undefined : onReintentar;
  return (
    <div className={`estado estado--${variante} estado--error`} role="alert">
      <span className="estado-icono">
        {base.sinRed ? <IconoSinSenal tamano={28} /> : <IconoAlerta tamano={28} />}
      </span>
      <p className="estado-titulo">{titulo ?? base.titulo}</p>
      <p className="estado-detalle">{detalle ?? base.detalle}</p>
      {(reintentar || volver) && (
        <div className="estado-acciones">
          {volver && (
            <BotonEnlace to={volver.a} icono={<IconoAnterior tamano={18} />}>
              Volver a {volver.etiqueta}
            </BotonEnlace>
          )}
          {reintentar && (
            <Boton
              icono={<IconoRecargar tamano={18} />}
              onClick={reintentar}
              cargando={reintentando}
              textoCargando="Reintentando…"
            >
              Reintentar
            </Boton>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Sin permiso dentro de una pagina (una pestana o un panel que el rol no ve).
 * Para una RUTA entera no hace falta: RequirePermiso ya lo pinta.
 */
export function EstadoSinPermiso({ recurso }: { readonly recurso?: string }): React.ReactElement {
  return <AccesoDenegado recurso={recurso} />;
}

interface PropsSkeleton {
  /** Ancho CSS: '60%', '12ch', 120. */
  readonly ancho?: number | string;
  readonly alto?: number | string;
  readonly forma?: 'linea' | 'bloque' | 'circulo';
  readonly className?: string;
}

/** Hueso de carga con la forma del contenido que viene. */
export function Skeleton({
  ancho = '100%',
  alto,
  forma = 'linea',
  className,
}: PropsSkeleton): React.ReactElement {
  const estilo: CSSProperties = { width: ancho, height: alto };
  return (
    <span
      className={['ui-skeleton', `ui-skeleton--${forma}`, className].filter(Boolean).join(' ')}
      style={estilo}
      aria-hidden="true"
    />
  );
}

/**
 * Carga de pagina completa: cabecera + barra de filtros + filas. Es el fallback
 * de las rutas lazy (conSuspense) y el estado inicial de una pagina de listado.
 */
export function EstadoCargando({
  mensaje = 'Cargando…',
  filas = 6,
}: {
  readonly mensaje?: string;
  readonly filas?: number;
}): React.ReactElement {
  return (
    <div className="estado-cargando" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{mensaje}</span>
      <div className="estado-cargando-cabecera">
        <Skeleton ancho="16rem" alto={28} />
        <Skeleton ancho="24rem" />
      </div>
      <Skeleton forma="bloque" alto={56} />
      <div className="estado-cargando-filas">
        {Array.from({ length: filas }, (_, i) => (
          <Skeleton key={i} ancho={`${92 - ((i * 13) % 30)}%`} />
        ))}
      </div>
    </div>
  );
}
