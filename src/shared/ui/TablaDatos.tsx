import type { ReactNode } from 'react';
import { EstadoError, Skeleton } from './Estados';

export interface ColumnaTabla<T> {
  /** Identificador estable de la columna. */
  readonly clave: string;
  /** Texto del <th>. En movil se repite como etiqueta de cada dato. */
  readonly encabezado: string;
  readonly celda: (fila: T) => ReactNode;
  /** Cifras y montos: alineadas a la derecha con numeros tabulares. */
  readonly numerica?: boolean;
  readonly alinear?: 'inicio' | 'centro' | 'fin';
  /** Ancho CSS de la columna en escritorio ('9rem', '20%'). */
  readonly ancho?: string;
  /**
   * La columna que identifica la fila (nombre del criminal, codigo del
   * operativo). En movil encabeza la tarjeta, sin etiqueta. Una por tabla, y
   * es la que lleva el <Link> al detalle.
   */
  readonly principal?: boolean;
  /** Dato largo (relato, lugar): en la ficha movil ocupa todo el ancho. */
  readonly ancha?: boolean;
  /** Dato secundario que no cabe en movil (se oculta por debajo de 760px). */
  readonly ocultarEnMovil?: boolean;
}

interface Props<T> {
  readonly filas: readonly T[];
  readonly columnas: readonly ColumnaTabla<T>[];
  readonly claveFila: (fila: T) => string;
  /** Nombre de la tabla (caption; oculto a la vista). "Criminales registrados". */
  readonly titulo: string;
  /** Primera carga: filas esqueleto con la forma de la tabla. */
  readonly cargando?: boolean;
  /** Recarga con datos ya visibles (cambio de filtro o de pagina): atenua sin vaciar. */
  readonly actualizando?: boolean;
  /** Error de la carga. Si hay filas previas, se conservan y el error va arriba. */
  readonly error?: unknown;
  readonly onReintentar?: () => void;
  /** Que mostrar sin filas (un EstadoVacio con su texto y accion). */
  readonly vacio?: ReactNode;
  readonly filasSkeleton?: number;
  /** Resalta una fila (la abierta en un panel lateral, la recien creada). */
  readonly filaResaltada?: string | null;
  /** Clase extra por fila (p. ej. criminales dados de baja en tono apagado). */
  readonly claseFila?: (fila: T) => string | undefined;
}

function claseCelda<T>(col: ColumnaTabla<T>): string | undefined {
  const alinear = col.alinear ?? (col.numerica ? 'fin' : 'inicio');
  return (
    [
      alinear !== 'inicio' ? `ui-tabla-celda--${alinear}` : '',
      col.numerica ? 'cifra' : '',
      col.principal ? 'ui-tabla-celda--principal' : '',
      col.ocultarEnMovil ? 'ui-tabla-celda--solo-escritorio' : '',
      col.ancha ? 'ui-tabla-celda--ancha' : '',
    ]
      .filter(Boolean)
      .join(' ') || undefined
  );
}

/**
 * Tabla de datos densa y responsive. Por encima de 760px es una tabla; por
 * debajo, cada fila se vuelve una ficha apilada (la columna `principal` arriba
 * y el resto como pares etiqueta / valor), sin desplazamiento horizontal.
 *
 * Contempla sus estados: carga (skeleton), recarga (atenuada), error
 * (EstadoError con Reintentar) y vacio (lo que pases en `vacio`).
 *
 *   <TablaDatos
 *     titulo="Criminales registrados"
 *     filas={criminales}
 *     claveFila={(c) => c.id}
 *     cargando={cargando && criminales.length === 0}
 *     actualizando={cargando && criminales.length > 0}
 *     error={error}
 *     onReintentar={() => void cargar()}
 *     vacio={<EstadoVacio titulo="Ningún criminal coincide con los filtros" />}
 *     columnas={[
 *       { clave: 'nombre', encabezado: 'Nombre', principal: true,
 *         celda: (c) => <Link to={c.id}>{c.nombre}</Link> },
 *       { clave: 'recompensa', encabezado: 'Recompensa', numerica: true,
 *         celda: (c) => <MontoBerries valor={c.recompensaVigenteMonto} abreviado /> },
 *     ]}
 *   />
 */
export function TablaDatos<T>({
  filas,
  columnas,
  claveFila,
  titulo,
  cargando = false,
  actualizando = false,
  error,
  onReintentar,
  vacio,
  filasSkeleton = 6,
  filaResaltada,
  claseFila,
}: Props<T>): React.ReactElement {
  const hayFilas = filas.length > 0;
  // Respaldo ante claves repetidas (dos versiones con la misma fecha): React
  // mezclaria las filas. La primera conserva su clave; las demas, con indice.
  const vistas = new Set<string>();
  const marcar = (clave: string): string => {
    vistas.add(clave);
    return clave;
  };

  if (error && !hayFilas && !cargando) {
    return (
      <div className="ui-tabla-marco">
        <EstadoError error={error} onReintentar={onReintentar} />
      </div>
    );
  }

  if (!cargando && !hayFilas) {
    return <div className="ui-tabla-marco">{vacio}</div>;
  }

  return (
    <div className="ui-tabla-marco">
      {error && hayFilas ? (
        <EstadoError
          error={error}
          titulo="No se pudo actualizar la lista"
          detalle="Lo que ves es la última versión que llegó."
          onReintentar={onReintentar}
        />
      ) : null}
      <div className="ui-tabla-desplazable">
        <table
          className={actualizando ? 'ui-tabla ui-tabla--actualizando' : 'ui-tabla'}
          aria-busy={cargando || actualizando || undefined}
        >
          <caption className="sr-only">{titulo}</caption>
          <thead>
            <tr>
              {columnas.map((col) => (
                <th
                  key={col.clave}
                  scope="col"
                  className={claseCelda(col)}
                  style={col.ancho ? { width: col.ancho } : undefined}
                >
                  {col.encabezado}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando && !hayFilas
              ? Array.from({ length: filasSkeleton }, (_, i) => (
                  <tr key={`esqueleto-${i}`} className="ui-tabla-fila--esqueleto">
                    {columnas.map((col, j) => (
                      <td key={col.clave} className={claseCelda(col)}>
                        <Skeleton
                          ancho={col.numerica ? '5rem' : `${70 - (((i + j) * 11) % 35)}%`}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              : filas.map((fila, i) => {
                  const clave = claveFila(fila);
                  const extra = claseFila?.(fila);
                  const clases = [
                    clave === filaResaltada ? 'ui-tabla-fila--resaltada' : '',
                    extra ?? '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <tr
                      key={vistas.has(clave) ? `${clave}-${i}` : marcar(clave)}
                      className={clases || undefined}
                    >
                      {columnas.map((col) => (
                        <td
                          key={col.clave}
                          className={claseCelda(col)}
                          data-etiqueta={col.encabezado}
                        >
                          {col.celda(fila)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
