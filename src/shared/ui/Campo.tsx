import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { IconoAlerta } from './iconos';

interface PropsBaseCampo {
  /** Siempre visible: el placeholder nunca sustituye a la etiqueta. */
  readonly etiqueta: string;
  /** Texto de apoyo bajo el control ("Entre 1 y 150 caracteres"). */
  readonly ayuda?: ReactNode;
  /** Mensaje de error; lo enlaza aria-describedby y marca aria-invalid. */
  readonly error?: string | null;
  /** Oculta la etiqueta a la vista (sigue para lectores). Solo en barras de filtros. */
  readonly etiquetaOculta?: boolean;
  /** Clase del contenedor (para colocarlo en una grilla). */
  readonly claseContenedor?: string;
}

interface IdsCampo {
  readonly id: string;
  readonly describedBy: string | undefined;
  readonly invalido: boolean;
}

interface PropsMarco extends PropsBaseCampo {
  readonly id?: string;
  readonly obligatorio?: boolean;
  /** Recibe los ids para conectar un control propio (subida de foto, casillas). */
  readonly children: (ids: IdsCampo) => ReactNode;
}

/**
 * Marco de campo: etiqueta + control + ayuda + error, con los ids conectados.
 * CampoTexto, CampoSelect y CampoAreaTexto lo usan; usalo tambien para
 * controles propios.
 *
 *   <Campo etiqueta="Foto" error={errorFoto}>
 *     {({ id, describedBy }) => <input id={id} type="file" aria-describedby={describedBy} />}
 *   </Campo>
 */
export function Campo({
  id: idPropio,
  etiqueta,
  ayuda,
  error,
  obligatorio,
  etiquetaOculta,
  claseContenedor,
  children,
}: PropsMarco): React.ReactElement {
  const generado = useId();
  const id = idPropio ?? `campo-${generado.replace(/:/g, '')}`;
  const idAyuda = ayuda ? `${id}-ayuda` : '';
  const idError = error ? `${id}-error` : '';
  const describedBy = [idError, idAyuda].filter(Boolean).join(' ') || undefined;

  return (
    <div className={['ui-campo', claseContenedor].filter(Boolean).join(' ')}>
      <label htmlFor={id} className={etiquetaOculta ? 'sr-only' : 'ui-campo-etiqueta'}>
        {etiqueta}
        {obligatorio && (
          <span className="ui-campo-obligatorio" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children({ id, describedBy, invalido: Boolean(error) })}
      {ayuda && (
        <p id={idAyuda} className="ui-campo-ayuda">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={idError} className="ui-campo-error">
          <IconoAlerta tamano={16} />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Junta los ids de ayuda y error del campo con los que pase quien lo usa
 * (una nota fuera del campo): ninguno sustituye al otro.
 */
function unirIds(...ids: (string | undefined)[]): string | undefined {
  return ids.filter(Boolean).join(' ') || undefined;
}

export interface CampoTextoProps
  extends PropsBaseCampo, Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> {}

/**
 * Campo de una linea (texto, numero, fecha, correo, busqueda).
 *
 *   <CampoTexto etiqueta="Nombre" required value={nombre}
 *     onChange={(e) => setNombre(e.target.value)} error={errores.nombre} />
 */
export const CampoTexto = forwardRef<HTMLInputElement, CampoTextoProps>(function CampoTexto(
  {
    etiqueta,
    ayuda,
    error,
    etiquetaOculta,
    claseContenedor,
    id,
    required,
    className,
    'aria-describedby': describedByExterno,
    ...resto
  },
  ref,
) {
  return (
    <Campo
      id={id}
      etiqueta={etiqueta}
      ayuda={ayuda}
      error={error}
      obligatorio={required}
      etiquetaOculta={etiquetaOculta}
      claseContenedor={claseContenedor}
    >
      {(ids) => (
        <input
          ref={ref}
          id={ids.id}
          required={required}
          aria-invalid={ids.invalido || undefined}
          aria-describedby={unirIds(ids.describedBy, describedByExterno)}
          className={['ui-control', className].filter(Boolean).join(' ')}
          {...resto}
        />
      )}
    </Campo>
  );
});

export interface OpcionSelect {
  readonly valor: string;
  readonly etiqueta: string;
  readonly deshabilitada?: boolean;
}

export interface CampoSelectProps
  extends PropsBaseCampo, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  readonly opciones?: readonly OpcionSelect[];
  /** Primera opcion con valor '' ("Todas las zonas", "Elige una base"). */
  readonly opcionVacia?: string;
  /** Para <optgroup> (zonas agrupadas por mar). Se pinta despues de `opciones`. */
  readonly children?: ReactNode;
}

/**
 * Lista desplegable nativa (en movil abre el selector del sistema).
 *
 *   <CampoSelect etiqueta="Estado" opcionVacia="Todos" value={estado}
 *     onChange={(e) => setEstado(e.target.value)} opciones={opcionesEstadoCriminal()} />
 */
export const CampoSelect = forwardRef<HTMLSelectElement, CampoSelectProps>(function CampoSelect(
  {
    etiqueta,
    ayuda,
    error,
    etiquetaOculta,
    claseContenedor,
    id,
    required,
    className,
    opciones = [],
    opcionVacia,
    children,
    'aria-describedby': describedByExterno,
    ...resto
  },
  ref,
) {
  return (
    <Campo
      id={id}
      etiqueta={etiqueta}
      ayuda={ayuda}
      error={error}
      obligatorio={required}
      etiquetaOculta={etiquetaOculta}
      claseContenedor={claseContenedor}
    >
      {(ids) => (
        <div className="ui-select">
          <select
            ref={ref}
            id={ids.id}
            required={required}
            aria-invalid={ids.invalido || undefined}
            aria-describedby={unirIds(ids.describedBy, describedByExterno)}
            className={['ui-control', className].filter(Boolean).join(' ')}
            {...resto}
          >
            {opcionVacia !== undefined && <option value="">{opcionVacia}</option>}
            {opciones.map((o) => (
              <option key={o.valor} value={o.valor} disabled={o.deshabilitada}>
                {o.etiqueta}
              </option>
            ))}
            {children}
          </select>
        </div>
      )}
    </Campo>
  );
});

export interface CampoAreaTextoProps
  extends PropsBaseCampo, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> {
  /** Muestra "120 / 500" si hay maxLength. */
  readonly contador?: boolean;
}

/** Texto largo (descripcion fisica, observaciones del cierre). */
export const CampoAreaTexto = forwardRef<HTMLTextAreaElement, CampoAreaTextoProps>(
  function CampoAreaTexto(
    {
      etiqueta,
      ayuda,
      error,
      etiquetaOculta,
      claseContenedor,
      id,
      required,
      className,
      contador,
      maxLength,
      value,
      rows = 4,
      'aria-describedby': describedByExterno,
      ...resto
    },
    ref,
  ) {
    const largo = typeof value === 'string' ? value.length : 0;
    const ayudaFinal =
      contador && maxLength ? (
        <span className="ui-campo-ayuda-fila">
          <span>{ayuda}</span>
          <span className="cifra" aria-live="polite">
            {largo} / {maxLength}
          </span>
        </span>
      ) : (
        ayuda
      );

    return (
      <Campo
        id={id}
        etiqueta={etiqueta}
        ayuda={ayudaFinal}
        error={error}
        obligatorio={required}
        etiquetaOculta={etiquetaOculta}
        claseContenedor={claseContenedor}
      >
        {(ids) => (
          <textarea
            ref={ref}
            id={ids.id}
            required={required}
            rows={rows}
            maxLength={maxLength}
            value={value}
            aria-invalid={ids.invalido || undefined}
            aria-describedby={unirIds(ids.describedBy, describedByExterno)}
            className={['ui-control', 'ui-control--area', className].filter(Boolean).join(' ')}
            {...resto}
          />
        )}
      </Campo>
    );
  },
);
