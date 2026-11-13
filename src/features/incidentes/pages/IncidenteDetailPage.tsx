import { useNombresCriminales } from '@core/directorio/directorio-criminales';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCatalogos } from '@core/catalogos/catalogos';
import { Permiso } from '@core/session/permiso.enum';
import { EVENTOS } from '@core/sync/eventos';
import { useCambiosSincronizados } from '@core/sync/sincronizacion';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { AlertaConflicto, esConflictoDeVersion } from '@shared/ui/Alerta';
import { BotonEnlace } from '@shared/ui/Boton';
import { EstadoError, Skeleton } from '@shared/ui/Estados';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { PageHeader } from '@shared/ui/PageHeader';
import { aIso, formatearFecha, formatearSoloFecha } from '@shared/utils/fecha';
import { useDirectorioIncidentes } from '../data-access/directorio.store';
import { incidentesApi } from '../data-access/incidentes-api';
import {
  etiquetaDesenlace,
  etiquetaResultado,
  etiquetaRol,
  etiquetaTipo,
  tonoDesenlace,
  tonoResultado,
  type Incidente,
} from '../models/incidente';
import { FormularioCierre } from '../components/FormularioCierre';
import { PanelVinculo } from '../components/PanelVinculo';
import '../incidentes.css';

/**
 * RF-6 Ficha de un enfrentamiento: lo ocurrido, los participantes, el vinculo
 * con su operativo de origen y, si sigue en curso, su cierre con resultado.
 * Vincular y cerrar envian `version`: si otra base lo cambio antes, 409 y
 * AlertaConflicto en lugar de sobrescribir.
 */
export function IncidenteDetailPage(): React.ReactElement {
  const { id = '' } = useParams<{ id: string }>();
  const { nombreBase, nombreZona } = useCatalogos();
  const {
    operativos,
    operativosPorId,
    cargar: cargarDirectorio,
    resolver,
  } = useDirectorioIncidentes();
  const nombreCriminal = useNombresCriminales();
  const puedeEscribir = useHasPermission(Permiso.INCIDENTES_ESCRIBIR);

  const [incidente, setIncidente] = useState<Incidente | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [cargando, setCargando] = useState(true);
  const [conflicto, setConflicto] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await incidentesApi.obtener(id);
      setIncidente(datos);
      setError(null);
      setConflicto(false);
    } catch (e) {
      setError(e);
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    void cargar();
    void cargarDirectorio();
  }, [cargar, cargarDirectorio]);

  useEffect(() => {
    if (!incidente) return;
    void resolver(
      incidente.criminales.filter((c) => c.criminalNombre === undefined).map((c) => c.criminalId),
      incidente.operativoId ? [incidente.operativoId] : [],
    );
  }, [incidente, resolver]);

  // Otra base cerro o vinculo este mismo enfrentamiento.
  useCambiosSincronizados<{ incidenteId?: string }>(
    [EVENTOS.INCIDENTE_CERRADO, EVENTOS.INCIDENTE_REGISTRADO],
    (cambio) => {
      if (cambio.datos?.incidenteId === id) void cargar();
    },
  );

  if (!incidente) {
    return (
      <>
        <PageHeader titulo="Incidente" volver={{ a: '/incidentes', etiqueta: 'Incidentes' }} />
        {error && !cargando ? (
          <EstadoError
            variante="pantalla"
            error={error}
            onReintentar={() => void cargar()}
            volver={{ a: '/incidentes', etiqueta: 'Incidentes' }}
          />
        ) : (
          <FichaEsqueleto />
        )}
      </>
    );
  }

  const nombreDe = (criminalId: string): string =>
    incidente.criminales.find((c) => c.criminalId === criminalId)?.criminalNombre ??
    nombreCriminal(criminalId, 'Criminal sin identificar');
  const operativo = incidente.operativoId ? operativosPorId[incidente.operativoId] : undefined;

  function trasCambio(actualizado: Incidente): void {
    setIncidente(actualizado);
    setConflicto(false);
  }

  function siConflicto(e: unknown): void {
    if (esConflictoDeVersion(e)) {
      setConflicto(true);
      return;
    }
    throw e;
  }

  return (
    <>
      <PageHeader
        titulo={`${etiquetaTipo(incidente.tipo)} del ${formatearSoloFecha(incidente.fechaHora)}`}
        descripcion={incidente.ubicacion}
        volver={{ a: '/incidentes', etiqueta: 'Incidentes' }}
        meta={
          <>
            <InsigniaEstado
              etiqueta={etiquetaResultado(incidente.resultado)}
              tono={tonoResultado(incidente.resultado)}
              enCurso={incidente.resultado === 'EN_CURSO'}
            />
            <ActualizadoHace fecha={incidente.updatedAt} prefijo="Actualizado" />
          </>
        }
      >
        {puedeEscribir && (
          <BotonEnlace
            to={`/incidentes/nuevo${incidente.operativoId ? `?operativo=${encodeURIComponent(incidente.operativoId)}` : ''}`}
          >
            Registrar otro
          </BotonEnlace>
        )}
      </PageHeader>

      {conflicto && <AlertaConflicto onRecargar={() => void cargar()} />}

      <div className="inc-ficha">
        <div className="inc-ficha-principal">
          <section className="inc-panel" aria-labelledby="inc-hecho">
            <h2 id="inc-hecho" className="inc-panel-titulo">
              Qué ocurrió
            </h2>
            <p className="inc-relato">{incidente.descripcion}</p>
            {incidente.observaciones && (
              <>
                <h3 className="inc-subtitulo">Observaciones</h3>
                <p className="inc-relato">{incidente.observaciones}</p>
              </>
            )}
          </section>

          {/* Primero el hecho; el cierre se decide despues de leerlo. */}
          {!incidente.cerrado && puedeEscribir && (
            <FormularioCierre
              incidente={incidente}
              nombreDe={nombreDe}
              onCerrado={trasCambio}
              onConflicto={siConflicto}
            />
          )}

          <section className="inc-panel" aria-labelledby="inc-criminales">
            <h2 id="inc-criminales" className="inc-panel-titulo">
              Criminales involucrados
              <span className="inc-cuenta">{incidente.criminales.length}</span>
            </h2>
            <ul className="inc-lista">
              {incidente.criminales.map((c) => (
                <li key={c.criminalId} className="inc-lista-fila">
                  <span className="inc-celda-doble">
                    <Link to={`/criminales/${encodeURIComponent(c.criminalId)}`}>
                      {nombreDe(c.criminalId)}
                    </Link>
                    <small>{etiquetaRol(c.rolEnIncidente)}</small>
                    {c.observaciones && <small>{c.observaciones}</small>}
                  </span>
                  <InsigniaEstado
                    etiqueta={etiquetaDesenlace(c.desenlace)}
                    tono={tonoDesenlace(c.desenlace)}
                  />
                </li>
              ))}
            </ul>
          </section>

          <section className="inc-panel" aria-labelledby="inc-marinos">
            <h2 id="inc-marinos" className="inc-panel-titulo">
              Marinos que participaron
              {incidente.marinos.length > 0 && (
                <span className="inc-cuenta">{incidente.marinos.length}</span>
              )}
            </h2>
            {incidente.marinos.length === 0 ? (
              <p className="inc-nota">No se registraron marinos en este enfrentamiento.</p>
            ) : (
              <ul className="inc-lista">
                {incidente.marinos.map((m, i) => (
                  <li key={`${m.nombre}-${i}`} className="inc-lista-fila">
                    <span className="inc-texto-largo">{m.nombre}</span>
                    {m.rango && <span className="inc-rango">{m.rango}</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="inc-ficha-lateral">
          <section className="inc-panel" aria-labelledby="inc-datos">
            <h2 id="inc-datos" className="inc-panel-titulo">
              Datos del registro
            </h2>
            <dl className="inc-datos">
              <div>
                <dt>Fecha y hora</dt>
                <dd>
                  <time dateTime={aIso(incidente.fechaHora)}>
                    {formatearFecha(incidente.fechaHora)}
                  </time>
                </dd>
              </div>
              <div>
                <dt>Lugar</dt>
                <dd>{incidente.ubicacion}</dd>
              </div>
              <div>
                <dt>Zona</dt>
                <dd>
                  {incidente.zonaInfluenciaId ? nombreZona(incidente.zonaInfluenciaId) : 'Sin zona'}
                </dd>
              </div>
              <div>
                <dt>Base naval</dt>
                <dd>
                  {incidente.baseNavalId
                    ? (incidente.baseNavalNombre ?? nombreBase(incidente.baseNavalId))
                    : 'Sin base'}
                </dd>
              </div>
              <div>
                <dt>Bajas</dt>
                <dd className="cifra">
                  {incidente.bajasMarina} de la Marina · {incidente.bajasEnemigas} enemigas
                </dd>
              </div>
              <div>
                <dt>Registrado</dt>
                <dd>
                  <time dateTime={aIso(incidente.createdAt)}>
                    {formatearFecha(incidente.createdAt)}
                  </time>
                </dd>
              </div>
            </dl>
          </section>

          <section className="inc-panel" aria-labelledby="inc-operativo">
            <h2 id="inc-operativo" className="inc-panel-titulo">
              Operativo de origen
            </h2>
            {incidente.operativoId ? (
              <p className="inc-operativo">
                <Link
                  className="inc-codigo"
                  to={`/operativos/${encodeURIComponent(incidente.operativoId)}`}
                >
                  {operativo?.codigo ?? 'Ver operativo'}
                </Link>
                {operativo && <span>{operativo.nombre}</span>}
              </p>
            ) : puedeEscribir ? (
              <PanelVinculo
                incidente={incidente}
                opciones={operativos.map((o) => ({
                  valor: o.id,
                  etiqueta: `${o.codigo} · ${o.nombre}`,
                }))}
                onVinculado={trasCambio}
                onConflicto={siConflicto}
              />
            ) : (
              <p className="inc-nota">Este enfrentamiento no está vinculado a ningún operativo.</p>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}

function FichaEsqueleto(): React.ReactElement {
  return (
    <div className="inc-ficha" aria-busy="true" aria-label="Cargando el incidente">
      <div className="inc-ficha-principal">
        <div className="inc-panel">
          <Skeleton ancho="40%" alto={20} />
          <Skeleton ancho="100%" />
          <Skeleton ancho="85%" />
          <Skeleton ancho="60%" />
        </div>
        <div className="inc-panel">
          <Skeleton ancho="35%" alto={20} />
          <Skeleton ancho="70%" />
          <Skeleton ancho="55%" />
        </div>
      </div>
      <aside className="inc-ficha-lateral">
        <div className="inc-panel">
          <Skeleton ancho="50%" alto={20} />
          <Skeleton ancho="80%" />
          <Skeleton ancho="65%" />
          <Skeleton ancho="75%" />
        </div>
      </aside>
    </div>
  );
}
