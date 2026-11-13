import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCatalogos } from '@core/catalogos/catalogos';
import { Permiso } from '@core/session/permiso.enum';
import { EVENTOS } from '@core/sync/eventos';
import { useCambiosSincronizados } from '@core/sync/sincronizacion';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { BadgeAmenaza } from '@shared/ui/BadgeAmenaza';
import { CampoSelect } from '@shared/ui/Campo';
import { EstadoError, EstadoVacio, Skeleton } from '@shared/ui/Estados';
import { InsigniaTipoCriminal } from '@shared/ui/InsigniaTipoCriminal';
import { PageHeader } from '@shared/ui/PageHeader';
import { formatearBerries } from '@shared/utils/berries';
import { etiquetaCategoria } from '@shared/utils/criminal';
import { BarraNiveles } from '../components/BarraNiveles';
import { BarrasHorizontales, type BarraDato } from '@shared/ui/BarrasHorizontales';
import { BotonesExportar, motivoSinExportar } from '@shared/ui/BotonesExportar';
import { SeccionesAmenaza } from '../components/SeccionesAmenaza';
import { amenazaApi } from '../data-access/amenaza-api';
import { useAmenazaStore } from '../data-access/amenaza.store';
import {
  categoriaDeGrupo,
  completarNiveles,
  type CriterioAmenaza,
  type Estadisticas,
} from '../models/amenaza';
import '../amenaza.css';

const ORDEN_CATEGORIAS = ['PIRATA', 'REVOLUCIONARIO', 'CRIMINAL_INDEPENDIENTE', 'SIN_AFILIACION'];

function textoCriminales(n: number): string {
  return n.toLocaleString('es-CO');
}

function rango(c: CriterioAmenaza): string {
  if (c.montoMaximo === null) return `desde ${formatearBerries(c.montoMinimo, true)}`;
  return `menos de ${formatearBerries(c.montoMaximo + 1, true)}`;
}

function datosPorMar(e: Estadisticas, ordenMares: readonly string[]): BarraDato[] {
  const pos = (nombre: string): number => {
    const i = ordenMares.findIndex((m) => m.toLowerCase() === nombre.toLowerCase());
    return i === -1 ? ordenMares.length : i;
  };
  return [...e.porMar]
    .sort((a, b) => pos(a.etiqueta) - pos(b.etiqueta))
    .map((p) => ({
      clave: p.etiqueta,
      etiqueta: p.etiqueta,
      nombre: p.etiqueta,
      valor: p.valor,
      textoValor: textoCriminales(p.valor),
    }));
}

function datosPorTipo(e: Estadisticas): BarraDato[] {
  const pos = (k: string): number => {
    const i = ORDEN_CATEGORIAS.indexOf(k);
    return i === -1 ? ORDEN_CATEGORIAS.length : i;
  };
  return [...e.porCategoria]
    .sort((a, b) => pos(a.etiqueta) - pos(b.etiqueta))
    .map((p) => {
      const categoria = categoriaDeGrupo(p.etiqueta);
      return {
        clave: p.etiqueta,
        etiqueta: <InsigniaTipoCriminal categoria={categoria} />,
        nombre: etiquetaCategoria(categoria),
        valor: p.valor,
        textoValor: textoCriminales(p.valor),
      };
    });
}

/**
 * RF-5 · Distribucion de amenaza: cuantos criminales hay en cada nivel y
 * donde estan. El elemento principal es la barra de niveles; debajo, el mismo
 * archivo por mar y por tipo de criminal.
 */
export function DistribucionPage(): React.ReactElement {
  const {
    soloActivos,
    distribucion,
    estadisticas,
    criterios,
    cargarDistribucion,
    cargarEstadisticas,
    cargarCriterios,
  } = useAmenazaStore();
  const puedeReportes = useHasPermission(Permiso.REPORTES_LEER);
  const { mares } = useCatalogos();

  useEffect(() => {
    void cargarDistribucion();
    void cargarCriterios();
    if (puedeReportes) void cargarEstadisticas();
  }, [cargarDistribucion, cargarEstadisticas, cargarCriterios, puedeReportes]);

  useCambiosSincronizados(
    [
      EVENTOS.AMENAZA_RECLASIFICADA,
      EVENTOS.CRITERIOS_AMENAZA_ACTUALIZADOS,
      EVENTOS.CRIMINAL_REGISTRADO,
      EVENTOS.CRIMINAL_ESTADO_CAMBIADO,
    ],
    (cambio) => {
      void cargarDistribucion();
      if (puedeReportes) void cargarEstadisticas();
      if (cambio.evento === EVENTOS.CRITERIOS_AMENAZA_ACTUALIZADOS) void cargarCriterios();
    },
  );

  const d = distribucion.datos;
  const niveles = d ? completarNiveles(d.niveles) : [];
  const vigentes = (criterios.datos ?? []).filter((c) => c.vigente);
  const ordenVigentes = ['BAJO', 'MEDIO', 'ALTO'];
  vigentes.sort((a, b) => ordenVigentes.indexOf(a.nivel) - ordenVigentes.indexOf(b.nivel));
  const e = estadisticas.datos;

  return (
    <>
      <PageHeader
        titulo="Amenaza"
        descripcion="Cada criminal se clasifica solo, según su recompensa vigente: Bajo, Medio o Alto."
        meta={
          distribucion.consultadoEn && (
            <ActualizadoHace fecha={distribucion.consultadoEn} prefijo="Consultado" />
          )
        }
      >
        {puedeReportes && (
          <BotonesExportar
            exportar={(formato) => amenazaApi.exportarEstadisticas(formato)}
            motivoDeshabilitado={motivoSinExportar({
              error: estadisticas.error,
              cargado: Boolean(e),
              vacio: d?.total === 0,
            })}
          />
        )}
      </PageHeader>
      <SeccionesAmenaza />

      <section className="amenaza-panel amenaza-principal" aria-labelledby="distribucion-titulo">
        <div className="amenaza-panel-cabecera">
          <div>
            <h2 id="distribucion-titulo" className="amenaza-panel-titulo">
              Criminales por nivel de amenaza
            </h2>
            {d && (
              <p className="amenaza-total">
                <span className="amenaza-total-cifra">{textoCriminales(d.total)}</span>{' '}
                {d.soloActivos ? 'criminales en búsqueda' : 'criminales en el archivo'}
              </p>
            )}
          </div>
          <CampoSelect
            etiqueta="Alcance"
            value={soloActivos ? 'activos' : 'todos'}
            opciones={[
              { valor: 'activos', etiqueta: 'Solo en búsqueda' },
              { valor: 'todos', etiqueta: 'Todo el archivo' },
            ]}
            onChange={(ev) => void cargarDistribucion(ev.target.value === 'activos')}
          />
        </div>

        {distribucion.error && !d ? (
          <EstadoError
            variante="en-panel"
            error={distribucion.error}
            onReintentar={() => void cargarDistribucion()}
            reintentando={distribucion.cargando}
          />
        ) : !d ? (
          <div className="amenaza-esqueleto" aria-busy="true">
            <Skeleton alto={28} />
            <Skeleton ancho="60%" />
            <span className="sr-only">Cargando la distribución</span>
          </div>
        ) : d.total === 0 ? (
          <EstadoVacio
            variante="en-panel"
            titulo={
              d.soloActivos
                ? 'No hay criminales en búsqueda'
                : 'Aún no hay criminales en el archivo'
            }
            detalle="Cuando una base registre uno con recompensa, aparecerá clasificado aquí."
          />
        ) : (
          <div className={distribucion.cargando ? 'amenaza-actualizando' : undefined}>
            <BarraNiveles niveles={niveles} total={d.total} />
          </div>
        )}

        {vigentes.length === 3 && (
          <p className="amenaza-rangos">
            <span>Rangos vigentes:</span>
            {vigentes.map((c) => (
              <span key={c.id} className="amenaza-rango">
                <BadgeAmenaza nivel={c.nivel} /> <span className="cifra">{rango(c)}</span>
              </span>
            ))}
            <Link to="/amenaza/criterios">Ver criterios</Link>
          </p>
        )}
      </section>

      {puedeReportes && (
        <div className="amenaza-par">
          <section className="amenaza-panel" aria-labelledby="por-mar-titulo">
            <h2 id="por-mar-titulo" className="amenaza-panel-titulo">
              En búsqueda por mar
            </h2>
            {estadisticas.error && !e ? (
              <EstadoError
                variante="en-panel"
                error={estadisticas.error}
                onReintentar={() => void cargarEstadisticas()}
              />
            ) : !e ? (
              <div className="amenaza-esqueleto" aria-busy="true">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} ancho={`${90 - i * 14}%`} alto={20} />
                ))}
              </div>
            ) : (
              <BarrasHorizontales
                titulo="Criminales en búsqueda por mar"
                datos={datosPorMar(
                  e,
                  mares.map((m) => m.nombre),
                )}
              />
            )}
          </section>

          <section className="amenaza-panel" aria-labelledby="por-tipo-titulo">
            <h2 id="por-tipo-titulo" className="amenaza-panel-titulo">
              En búsqueda por tipo
            </h2>
            {estadisticas.error && !e ? (
              <EstadoError
                variante="en-panel"
                error={estadisticas.error}
                onReintentar={() => void cargarEstadisticas()}
              />
            ) : !e ? (
              <div className="amenaza-esqueleto" aria-busy="true">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} ancho={`${90 - i * 16}%`} alto={20} />
                ))}
              </div>
            ) : (
              <BarrasHorizontales
                titulo="Criminales en búsqueda por tipo"
                datos={datosPorTipo(e)}
                anchoEtiqueta="amplio"
              />
            )}
          </section>
        </div>
      )}
    </>
  );
}
