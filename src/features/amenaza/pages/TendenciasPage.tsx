import { useEffect, useState } from 'react';
import { useCatalogos } from '@core/catalogos/catalogos';
import { EVENTOS } from '@core/sync/eventos';
import { useCambiosSincronizados } from '@core/sync/sincronizacion';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { BadgeAmenaza } from '@shared/ui/BadgeAmenaza';
import { CampoSelect } from '@shared/ui/Campo';
import { EstadoError, EstadoVacio, Skeleton } from '@shared/ui/Estados';
import { InsigniaTipoCriminal } from '@shared/ui/InsigniaTipoCriminal';
import { MontoBerries } from '@shared/ui/MontoBerries';
import { PageHeader } from '@shared/ui/PageHeader';
import { TablaDatos, type ColumnaTabla } from '@shared/ui/TablaDatos';
import { formatearBerries } from '@shared/utils/berries';
import { etiquetaCategoria } from '@shared/utils/criminal';
import { etiquetaNivelAmenaza } from '@shared/utils/nivel-amenaza';
import { BarrasHorizontales, type BarraDato } from '@shared/ui/BarrasHorizontales';
import { BotonesExportar, motivoSinExportar } from '@shared/ui/BotonesExportar';
import { SeccionesAmenaza } from '../components/SeccionesAmenaza';
import { amenazaApi } from '../data-access/amenaza-api';
import { useAmenazaStore } from '../data-access/amenaza.store';
import {
  AGRUPACIONES,
  agregarTendencias,
  categoriaDeGrupo,
  esNivel,
  etiquetaAgrupacion,
  type AgrupacionTendencia,
  type BarraTendencia,
  type FilaTendencia,
} from '../models/amenaza';
import '../amenaza.css';

/** Que se mide en el grafico. Las tres son de la misma escala dentro de cada opcion. */
type Medida = 'activos' | 'recompensaActiva' | 'avistamientos';

const MEDIDAS: readonly { valor: Medida; etiqueta: string }[] = [
  { valor: 'activos', etiqueta: 'Criminales en búsqueda' },
  { valor: 'recompensaActiva', etiqueta: 'Recompensa activa' },
  { valor: 'avistamientos', etiqueta: 'Avistamientos recientes' },
];

function nombreGrupo(agrupacion: AgrupacionTendencia, grupo: string): string {
  if (agrupacion === 'nivel' && esNivel(grupo)) return etiquetaNivelAmenaza(grupo);
  if (agrupacion === 'afiliacion') {
    return etiquetaCategoria(categoriaDeGrupo(grupo));
  }
  return grupo;
}

function etiquetaGrupo(agrupacion: AgrupacionTendencia, grupo: string): React.ReactNode {
  if (agrupacion === 'nivel' && esNivel(grupo)) return <BadgeAmenaza nivel={grupo} />;
  if (agrupacion === 'afiliacion')
    return <InsigniaTipoCriminal categoria={categoriaDeGrupo(grupo)} />;
  return grupo;
}

function aBarra(b: BarraTendencia, agrupacion: AgrupacionTendencia, medida: Medida): BarraDato {
  const valor = b[medida];
  return {
    clave: b.clave,
    etiqueta: etiquetaGrupo(agrupacion, b.clave),
    nombre: nombreGrupo(agrupacion, b.clave),
    valor,
    textoValor:
      medida === 'recompensaActiva' ? formatearBerries(valor, true) : valor.toLocaleString('es-CO'),
    nivel:
      agrupacion === 'nivel' && esNivel(b.clave)
        ? (b.clave.toLowerCase() as BarraDato['nivel'])
        : undefined,
  };
}

function columnas(
  agrupacion: AgrupacionTendencia,
  ventana: number,
): readonly ColumnaTabla<FilaTendencia>[] {
  const grupo: ColumnaTabla<FilaTendencia> =
    agrupacion === 'zona'
      ? {
          clave: 'grupo',
          encabezado: 'Zona',
          principal: true,
          celda: (f) => (
            <span className="tendencia-grupo">
              <span className="tendencia-grupo-nombre">{f.grupo}</span>
              {f.subgrupo && <small>{f.subgrupo}</small>}
            </span>
          ),
        }
      : agrupacion === 'afiliacion'
        ? {
            clave: 'grupo',
            encabezado: 'Afiliación',
            principal: true,
            celda: (f) => (
              <span className="tendencia-grupo">
                <span className="tendencia-grupo-nombre">{f.subgrupo ?? 'Sin afiliación'}</span>
                <InsigniaTipoCriminal categoria={categoriaDeGrupo(f.grupo)} variante="icono" />
              </span>
            ),
          }
        : {
            clave: 'grupo',
            encabezado: 'Nivel',
            principal: true,
            celda: (f) => (esNivel(f.grupo) ? <BadgeAmenaza nivel={f.grupo} /> : f.grupo),
          };

  return [
    grupo,
    {
      clave: 'activos',
      encabezado: 'En búsqueda',
      numerica: true,
      celda: (f) => f.activos.toLocaleString('es-CO'),
    },
    {
      clave: 'capturados',
      encabezado: 'Capturados',
      numerica: true,
      ocultarEnMovil: true,
      celda: (f) => f.capturados.toLocaleString('es-CO'),
    },
    {
      clave: 'muertos',
      encabezado: 'Fallecidos',
      numerica: true,
      ocultarEnMovil: true,
      celda: (f) => f.muertos.toLocaleString('es-CO'),
    },
    {
      clave: 'recompensa',
      encabezado: 'Recompensa activa',
      numerica: true,
      celda: (f) => <MontoBerries valor={f.recompensaActiva} abreviado />,
    },
    {
      clave: 'avistamientos',
      encabezado: `Avistamientos (${ventana} d)`,
      numerica: true,
      celda: (f) => f.avistamientosRecientes.toLocaleString('es-CO'),
    },
  ];
}

/**
 * RF-5 · Tendencias criminales por zona, afiliacion o nivel de amenaza. El
 * grafico resume al nivel que se lee de un vistazo (mar, tipo de criminal o
 * nivel); la tabla da el detalle (cada zona u organizacion).
 */
export function TendenciasPage(): React.ReactElement {
  const { agrupacion, tendencias, cargarTendencias } = useAmenazaStore();
  const { mares } = useCatalogos();
  const [medida, setMedida] = useState<Medida>('activos');

  useEffect(() => {
    void cargarTendencias();
  }, [cargarTendencias]);

  useCambiosSincronizados(
    [
      EVENTOS.AMENAZA_RECLASIFICADA,
      EVENTOS.CRIMINAL_REGISTRADO,
      EVENTOS.CRIMINAL_ESTADO_CAMBIADO,
      EVENTOS.RECOMPENSA_VIGENTE,
      EVENTOS.AVISTAMIENTO_REGISTRADO,
    ],
    () => void cargarTendencias(),
  );

  const t = tendencias.datos;
  const filas = t?.filas ?? [];
  const barras = t
    ? agregarTendencias(
        t,
        mares.map((m) => m.nombre),
      ).map((b) => aBarra(b, agrupacion, medida))
    : [];
  const ventana = t?.ventanaDias ?? 90;
  const etiquetaMedida = MEDIDAS.find((m) => m.valor === medida)?.etiqueta ?? '';
  const resumenGrafico =
    agrupacion === 'zona' ? 'por mar' : agrupacion === 'afiliacion' ? 'por tipo' : 'por nivel';

  return (
    <>
      <PageHeader
        titulo="Tendencias"
        descripcion={`Criminales, recompensa activa y avistamientos de los últimos ${ventana} días, por zona, afiliación o nivel.`}
        meta={
          tendencias.consultadoEn && (
            <ActualizadoHace fecha={tendencias.consultadoEn} prefijo="Consultado" />
          )
        }
      >
        <BotonesExportar
          exportar={(formato) => amenazaApi.exportarTendencias(agrupacion, formato)}
          motivoDeshabilitado={motivoSinExportar({
            error: tendencias.error,
            cargado: Boolean(t),
            vacio: filas.length === 0,
          })}
        />
      </PageHeader>
      <SeccionesAmenaza />

      <div className="tendencias-controles">
        <CampoSelect
          etiqueta="Agrupar por"
          value={agrupacion}
          opciones={AGRUPACIONES.map((a) => ({ valor: a, etiqueta: etiquetaAgrupacion(a) }))}
          onChange={(e) => void cargarTendencias(e.target.value as AgrupacionTendencia)}
        />
        <CampoSelect
          etiqueta="Medir"
          value={medida}
          opciones={MEDIDAS}
          onChange={(e) => setMedida(e.target.value as Medida)}
        />
      </div>

      {tendencias.error && !t ? (
        <EstadoError
          error={tendencias.error}
          onReintentar={() => void cargarTendencias()}
          reintentando={tendencias.cargando}
        />
      ) : t && filas.length === 0 ? (
        <EstadoVacio
          variante="pantalla"
          titulo="Aún no hay datos para esta agrupación"
          detalle="Cuando las bases registren criminales y avistamientos, las tendencias aparecerán aquí."
        />
      ) : (
        <>
          <section
            className={`amenaza-panel amenaza-principal${tendencias.cargando && t ? ' amenaza-actualizando' : ''}`}
            aria-labelledby="tendencias-grafico"
            aria-busy={tendencias.cargando || undefined}
          >
            <h2 id="tendencias-grafico" className="amenaza-panel-titulo">
              {etiquetaMedida} {resumenGrafico}
            </h2>
            {!t ? (
              <div className="amenaza-esqueleto">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} ancho={`${90 - i * 14}%`} alto={20} />
                ))}
                <span className="sr-only">Cargando tendencias</span>
              </div>
            ) : (
              <BarrasHorizontales
                titulo={`${etiquetaMedida} ${resumenGrafico}`}
                datos={barras}
                anchoEtiqueta={agrupacion === 'afiliacion' ? 'amplio' : 'normal'}
              />
            )}
          </section>

          <section aria-labelledby="tendencias-detalle">
            <h2 id="tendencias-detalle" className="amenaza-subtitulo">
              Detalle por {etiquetaAgrupacion(agrupacion).toLowerCase()}
            </h2>
            <TablaDatos
              titulo={`Tendencias por ${etiquetaAgrupacion(agrupacion).toLowerCase()}`}
              filas={filas}
              columnas={columnas(agrupacion, ventana)}
              claveFila={(f) => `${f.grupo}|${f.subgrupo ?? ''}`}
              cargando={!t}
              actualizando={tendencias.cargando && Boolean(t)}
              error={tendencias.error}
              onReintentar={() => void cargarTendencias()}
            />
          </section>
        </>
      )}
    </>
  );
}
