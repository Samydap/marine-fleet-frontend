import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

export type VarianteBoton =
  'principal' | 'secundario' | 'peligro' | 'peligro-sutil' | 'fantasma' | 'autoridad';
export type TamanoBoton = 'normal' | 'compacto';

interface PropsComunes {
  /**
   * - principal: la accion de la pantalla (una por vista).
   * - secundario: acciones de apoyo (exportar, cancelar).
   * - peligro: rojo solido, SOLO para confirmar lo irreversible (el boton del
   *   DialogoConfirmacion).
   * - peligro-sutil: la accion destructiva en una cabecera o barra ("Dar de
   *   baja", "Abortar"): contorno con texto de error, sin competir con la
   *   accion principal. Abre la confirmacion.
   * - fantasma: acciones terciarias dentro de tablas y barras.
   * - autoridad: SOLO validaciones de rango (aprobar una recompensa de alto
   *   rango). Lleva el dorado: regla del galon.
   */
  readonly variante?: VarianteBoton;
  readonly tamano?: TamanoBoton;
  /** Icono a la izquierda del texto (de shared/ui/iconos). */
  readonly icono?: ReactNode;
}

function clases(variante: VarianteBoton, tamano: TamanoBoton, extra?: string): string {
  return [
    'ui-boton',
    `ui-boton--${variante}`,
    tamano === 'compacto' ? 'ui-boton--compacto' : '',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

export interface BotonProps extends PropsComunes, ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accion en curso: se deshabilita, conserva el ancho y nombra la accion. */
  readonly cargando?: boolean;
  /** Texto mientras `cargando` ("Guardando…"). Si falta, se conserva el texto. */
  readonly textoCargando?: string;
}

/**
 * Boton del sistema. `type="button"` por defecto: un boton dentro de un
 * formulario solo envia si se pide `type="submit"` explicitamente.
 *
 *   <Boton variante="principal" type="submit" cargando={guardando} textoCargando="Guardando…">
 *     Guardar criminal
 *   </Boton>
 */
export const Boton = forwardRef<HTMLButtonElement, BotonProps>(function Boton(
  {
    variante = 'secundario',
    tamano = 'normal',
    icono,
    cargando = false,
    textoCargando,
    className,
    children,
    disabled,
    type = 'button',
    ...resto
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={clases(variante, tamano, className)}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      {...resto}
    >
      {cargando ? <span className="ui-boton-indicador" aria-hidden="true" /> : icono}
      {cargando && textoCargando ? textoCargando : children}
    </button>
  );
});

export interface BotonEnlaceProps extends PropsComunes, LinkProps {}

/**
 * Enlace con forma de boton, para acciones que NAVEGAN ("Registrar criminal"
 * abre /criminales/nuevo). Si la accion no cambia de URL, es un Boton.
 */
export function BotonEnlace({
  variante = 'secundario',
  tamano = 'normal',
  icono,
  className,
  children,
  ...resto
}: BotonEnlaceProps): React.ReactElement {
  return (
    <Link className={clases(variante, tamano, className)} {...resto}>
      {icono}
      {children}
    </Link>
  );
}

export interface BotonIconoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Obligatorio: es el nombre accesible del boton. */
  readonly etiqueta: string;
  readonly icono: ReactNode;
  readonly tamano?: TamanoBoton;
}

/** Boton de solo icono (cerrar, editar en una fila). Area tactil de 40px. */
export const BotonIcono = forwardRef<HTMLButtonElement, BotonIconoProps>(function BotonIcono(
  { etiqueta, icono, tamano = 'normal', className, type = 'button', ...resto },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={etiqueta}
      title={etiqueta}
      className={[
        'ui-boton-icono',
        tamano === 'compacto' ? 'ui-boton-icono--compacto' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...resto}
    >
      {icono}
    </button>
  );
});
