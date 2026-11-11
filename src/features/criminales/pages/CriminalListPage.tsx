import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Permiso } from '@core/session/permiso.enum';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { BadgeAmenaza } from '@shared/ui/BadgeAmenaza';
import { EmptyState } from '@shared/ui/EmptyState';
import { PageHeader } from '@shared/ui/PageHeader';
import { formatearBerries } from '@shared/utils/berries';
import { useCriminalesStore } from '../data-access/criminales.store';

/**
 * PAGINA DE REFERENCIA (RF-1).
 *
 * Patron para todas las paginas del proyecto:
 *  - el estado se lee del store de la feature, nunca de un store global
 *  - usa componentes tontos de shared/ui
 *  - contempla los tres estados: cargando, vacio y con datos
 *  - las acciones se ocultan con useHasPermission, no con condicionales ad hoc
 */
export function CriminalListPage(): React.ReactElement {
  const { criminales, meta, cargando, cargar, buscar, irAPagina } = useCriminalesStore();
  const puedeEscribir = useHasPermission(Permiso.CRIMINALES_ESCRIBIR);
  const [termino, setTermino] = useState('');

  useEffect(() => {
    void cargar();
  }, [cargar]);

  function enviarBusqueda(evento: FormEvent<HTMLFormElement>): void {
    evento.preventDefault();
    void buscar(termino);
  }

  const estaVacio = !cargando && criminales.length === 0;

  return (
    <>
      <PageHeader
        kicker="ARCHIVO CRIMINAL"
        titulo="Criminales"
        descripcion="Piratas, revolucionarios y organizaciones criminales independientes."
      >
        {puedeEscribir && (
          <Link className="primary-button" to="nuevo">
            Registrar criminal
          </Link>
        )}
      </PageHeader>

      <form className="search-wrap" onSubmit={enviarBusqueda}>
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          placeholder="Buscar por nombre o alias..."
          aria-label="Buscar criminales"
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
        />
        <button className="secondary-button" type="submit">
          Buscar
        </button>
      </form>

      {cargando ? (
        <EmptyState titulo="Consultando el registro…" icono="◷" />
      ) : estaVacio ? (
        <EmptyState
          titulo="Sin resultados"
          detalle="Ningún criminal coincide con los filtros aplicados."
        />
      ) : (
        <>
          <table className="tabla">
            <caption className="sr-only">Listado de criminales registrados</caption>
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Alias</th>
                <th scope="col">Recompensa</th>
                <th scope="col">Amenaza</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {criminales.map((criminal) => (
                <tr key={criminal.id}>
                  <td>
                    <Link to={criminal.id}>{criminal.nombre}</Link>
                  </td>
                  <td>{criminal.alias.join(', ') || '—'}</td>
                  <td>{formatearBerries(criminal.recompensaVigenteMonto, true)}</td>
                  <td>
                    <BadgeAmenaza nivel={criminal.nivelAmenaza} />
                  </td>
                  <td>{criminal.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <nav className="paginacion" aria-label="Paginación">
            <button
              type="button"
              className="secondary-button"
              disabled={meta.page <= 1}
              onClick={() => void irAPagina(meta.page - 1)}
            >
              Anterior
            </button>
            <span>
              Página {meta.page} de {meta.totalPages}
            </span>
            <button
              type="button"
              className="secondary-button"
              disabled={!meta.hasNext}
              onClick={() => void irAPagina(meta.page + 1)}
            >
              Siguiente
            </button>
          </nav>
        </>
      )}
    </>
  );
}
