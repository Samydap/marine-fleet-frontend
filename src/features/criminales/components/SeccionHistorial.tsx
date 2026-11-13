import { useCatalogos } from '@core/catalogos/catalogos';
import type { PageMeta } from '@core/models/page-result';
import { Boton } from '@shared/ui/Boton';
import { EstadoError, EstadoVacio, Skeleton } from '@shared/ui/Estados';
import { IconoSiguiente } from '@shared/ui/iconos';
import { aIso, formatearFecha } from '@shared/utils/fecha';
import type { EntradaHistorial } from '../models/criminal';
import { describirCambio } from '../utils/historial';

interface Props {
  readonly entradas: readonly EntradaHistorial[];
  readonly meta: PageMeta;
  readonly cargando: boolean;
  readonly error: unknown;
  readonly onReintentar: () => void;
  readonly onMas: () => void;
}

/**
 * Historial de modificaciones (trazabilidad): cada cambio con su valor
 * anterior y nuevo, quien lo hizo y cuando. Lo escriben triggers de la base:
 * aqui solo se lee.
 */
export function SeccionHistorial({
  entradas,
  meta,
  cargando,
  error,
  onReintentar,
  onMas,
}: Props): React.ReactElement {
  const { nombreZona } = useCatalogos();

  return (
    <section className="expediente-seccion" aria-labelledby="sec-historial">
      <div className="expediente-seccion-cabecera">
        <h2 id="sec-historial">Historial de modificaciones</h2>
        {meta.total > 0 && (
          <span className="expediente-seccion-meta cifra">
            {meta.total === 1 ? '1 cambio' : `${meta.total.toLocaleString('es-CO')} cambios`}
          </span>
        )}
      </div>

      {error && entradas.length === 0 ? (
        <EstadoError variante="en-panel" error={error} onReintentar={onReintentar} />
      ) : cargando && entradas.length === 0 ? (
        <div className="historial-esqueleto" aria-busy="true">
          <Skeleton ancho="70%" />
          <Skeleton ancho="55%" />
          <Skeleton ancho="62%" />
        </div>
      ) : entradas.length === 0 ? (
        <EstadoVacio
          variante="en-panel"
          titulo="Sin cambios registrados"
          detalle="Cada modificación de datos, recompensa, estado o afiliación quedará aquí."
        />
      ) : (
        <>
          <ol className="historial">
            {entradas.map((e) => {
              const cambio = describirCambio(e, { nombreZona });
              return (
                <li key={e.id} className="historial-entrada">
                  <div className="historial-que">
                    <strong>{cambio.etiqueta}</strong>
                    {(cambio.anterior || cambio.nuevo) && (
                      <span className="historial-valores">
                        {cambio.anterior && (
                          <>
                            <del>{cambio.anterior}</del>
                            <IconoSiguiente tamano={14} className="historial-flecha" />
                            <span className="sr-only"> cambió a </span>
                          </>
                        )}
                        {cambio.nuevo ? <ins>{cambio.nuevo}</ins> : <span>Vacío</span>}
                      </span>
                    )}
                  </div>
                  <div className="historial-quien">
                    <span>{e.usuarioNombre ?? 'Sistema'}</span>
                    <time dateTime={aIso(e.fecha)}>{formatearFecha(e.fecha)}</time>
                  </div>
                </li>
              );
            })}
          </ol>
          {meta.hasNext && (
            <div className="historial-mas">
              <Boton
                variante="fantasma"
                cargando={cargando}
                textoCargando="Cargando cambios…"
                onClick={onMas}
              >
                Ver cambios anteriores
              </Boton>
            </div>
          )}
        </>
      )}
    </section>
  );
}
