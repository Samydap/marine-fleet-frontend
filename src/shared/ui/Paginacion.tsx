import type { PageMeta } from '@core/models/page-result';
import { Boton } from './Boton';
import { IconoAnterior, IconoSiguiente } from './iconos';

interface Props {
  /** `meta` de apiClient.getPage (PageMeta del backend: page, limit, total, totalPages, hasNext). */
  readonly meta: PageMeta;
  readonly onCambiarPagina: (pagina: number) => void;
  /** Mientras carga la pagina nueva. */
  readonly deshabilitada?: boolean;
  /** Sustantivo de lo que se cuenta: "criminales", "operativos". */
  readonly sustantivo?: string;
}

const formato = new Intl.NumberFormat('es-CO');

/**
 * Paginacion de los listados del backend (PageQueryDto: page desde 1, limit
 * hasta 100). Dice cuantos hay y en que tramo estas; no se muestra si todo
 * cabe en una pagina.
 *
 *   <Paginacion meta={meta} onCambiarPagina={(p) => void irAPagina(p)} sustantivo="criminales" />
 */
export function Paginacion({
  meta,
  onCambiarPagina,
  deshabilitada = false,
  sustantivo = 'registros',
}: Props): React.ReactElement | null {
  if (meta.total === 0) return null;

  const desde = (meta.page - 1) * meta.limit + 1;
  const hasta = Math.min(meta.page * meta.limit, meta.total);
  const resumen = `${formato.format(desde)}–${formato.format(hasta)} de ${formato.format(meta.total)} ${sustantivo}`;

  if (meta.totalPages <= 1) {
    return (
      <p className="paginacion-resumen paginacion-resumen--solo cifra">
        {formato.format(meta.total)} {sustantivo}
      </p>
    );
  }

  return (
    <nav className="paginacion" aria-label="Paginación">
      <p className="paginacion-resumen cifra" aria-live="polite">
        {resumen}
      </p>
      <div className="paginacion-controles">
        <Boton
          tamano="compacto"
          icono={<IconoAnterior tamano={16} />}
          disabled={deshabilitada || meta.page <= 1}
          onClick={() => onCambiarPagina(meta.page - 1)}
        >
          Anterior
        </Boton>
        <span className="paginacion-pagina cifra">
          Página {meta.page} de {meta.totalPages}
        </span>
        <Boton
          tamano="compacto"
          disabled={deshabilitada || !meta.hasNext}
          onClick={() => onCambiarPagina(meta.page + 1)}
        >
          Siguiente
          <IconoSiguiente tamano={16} />
        </Boton>
      </div>
    </nav>
  );
}
