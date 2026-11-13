import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { Boton } from './Boton';
import { IconoBuscar, IconoCerrar, IconoFiltro } from './iconos';

interface Props {
  /** Texto del buscador (controlado). Omitelo si la pantalla no busca por texto. */
  readonly busqueda?: string;
  readonly onBusquedaChange?: (valor: string) => void;
  /** "Buscar por nombre o alias". Es tambien la etiqueta accesible. */
  readonly etiquetaBusqueda?: string;
  /** Enter en el buscador (o "Aplicar" en movil). Si buscas con useValorDiferido, no hace falta. */
  readonly onAplicar?: () => void;
  /** Cuantos filtros (sin contar la busqueda) tienen valor. Muestra "Limpiar". */
  readonly filtrosActivos?: number;
  readonly onLimpiar?: () => void;
  /** Los CampoSelect / CampoTexto de filtro, con `etiquetaOculta` o etiqueta corta. */
  readonly children?: ReactNode;
  /** Texto a la derecha de la barra: "134 resultados", ActualizadoHace. */
  readonly resumen?: ReactNode;
}

/**
 * Barra de busqueda y filtros de un listado. En escritorio todo en una fila
 * que se envuelve; en movil la busqueda queda visible y los filtros se
 * pliegan tras "Filtros (n)" para no empujar la tabla fuera de la pantalla.
 *
 *   <BarraFiltros busqueda={texto} onBusquedaChange={setTexto}
 *     etiquetaBusqueda="Buscar por nombre o alias"
 *     filtrosActivos={activos} onLimpiar={limpiar} resumen={`${meta.total} criminales`}>
 *     <CampoSelect etiqueta="Estado" opcionVacia="Todos" ... />
 *     <CampoSelect etiqueta="Mar" opcionVacia="Todos los mares" ... />
 *   </BarraFiltros>
 */
export function BarraFiltros({
  busqueda,
  onBusquedaChange,
  etiquetaBusqueda = 'Buscar',
  onAplicar,
  filtrosActivos = 0,
  onLimpiar,
  children,
  resumen,
}: Props): React.ReactElement {
  const [abiertos, setAbiertos] = useState(false);
  const idBusqueda = `busqueda-${useId().replace(/:/g, '')}`;
  const idFiltros = `${idBusqueda}-filtros`;

  function enviar(evento: FormEvent<HTMLFormElement>): void {
    evento.preventDefault();
    onAplicar?.();
  }

  const conBusqueda = onBusquedaChange !== undefined;

  return (
    <form className="barra-filtros" role="search" onSubmit={enviar}>
      <div className="barra-filtros-principal">
        {conBusqueda && (
          <div className="barra-filtros-busqueda">
            <label htmlFor={idBusqueda} className="sr-only">
              {etiquetaBusqueda}
            </label>
            <IconoBuscar tamano={18} className="barra-filtros-lupa" />
            <input
              id={idBusqueda}
              type="search"
              className="ui-control barra-filtros-entrada"
              placeholder={`${etiquetaBusqueda}…`}
              value={busqueda ?? ''}
              enterKeyHint="search"
              autoComplete="off"
              onChange={(e) => onBusquedaChange(e.target.value)}
            />
            {busqueda ? (
              <button
                type="button"
                className="barra-filtros-borrar"
                aria-label="Borrar búsqueda"
                onClick={() => onBusquedaChange('')}
              >
                <IconoCerrar tamano={16} />
              </button>
            ) : null}
          </div>
        )}

        {children && (
          <button
            type="button"
            className="ui-boton ui-boton--secundario barra-filtros-alternar"
            aria-expanded={abiertos}
            aria-controls={idFiltros}
            onClick={() => setAbiertos((v) => !v)}
          >
            <IconoFiltro tamano={18} />
            Filtros
            {filtrosActivos > 0 && (
              <span className="barra-filtros-contador cifra">
                <span className="sr-only">, activos: </span>
                {filtrosActivos}
              </span>
            )}
          </button>
        )}
      </div>

      {children && (
        <div
          id={idFiltros}
          className={
            abiertos
              ? 'barra-filtros-campos barra-filtros-campos--abiertos'
              : 'barra-filtros-campos'
          }
        >
          {children}
        </div>
      )}

      {(resumen || (onLimpiar && filtrosActivos > 0)) && (
        <div className="barra-filtros-pie">
          {resumen && <p className="barra-filtros-resumen">{resumen}</p>}
          {onLimpiar && filtrosActivos > 0 && (
            <Boton variante="fantasma" tamano="compacto" onClick={onLimpiar}>
              Limpiar filtros
            </Boton>
          )}
        </div>
      )}
    </form>
  );
}
