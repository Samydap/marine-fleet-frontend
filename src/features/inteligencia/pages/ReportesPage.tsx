import {
  resolverCriminales,
  useNombresCriminales,
  useOpcionesCriminales,
} from '@core/directorio/directorio-criminales';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Permiso } from '@core/session/permiso.enum';
import { EVENTOS } from '@core/sync/eventos';
import { useCambiosSincronizados } from '@core/sync/sincronizacion';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { BarraFiltros } from '@shared/ui/BarraFiltros';
import { Boton } from '@shared/ui/Boton';
import { CampoSelect } from '@shared/ui/Campo';
import { EstadoVacio } from '@shared/ui/Estados';
import { IconoArchivoVacio, IconoExito } from '@shared/ui/iconos';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { PageHeader } from '@shared/ui/PageHeader';
import { Paginacion } from '@shared/ui/Paginacion';
import { TablaDatos, type ColumnaTabla } from '@shared/ui/TablaDatos';
import { aIso, formatearFecha, tiempoRelativo } from '@shared/utils/fecha';
import { useAhora } from '@shared/hooks/useAhora';
import { TextoRecortado } from '@shared/ui/TextoRecortado';
import { DialogoRevisionReporte } from '../components/DialogoRevisionReporte';
import { OpcionesZona, useNombreZonaConMar } from '@shared/ui/CampoZona';
import { PestanasInteligencia } from '../components/PestanasInteligencia';
import { FILTRO_INICIAL_REPORTES, useReportesStore } from '../data-access/reportes.store';
import { etiquetaCriminal } from '../models/avistamiento';
import {
  etiquetaEstadoReporte,
  nombreInformante,
  opcionesEstadoReporte,
  tonoEstadoReporte,
  type EstadoReporte,
  type FiltroReportes,
  type ReporteCiudadano,
} from '../models/reporte';
import '../inteligencia.css';

/**
 * RF-3 Bandeja de reportes ciudadanos: la entrada no confiable del centro de
 * inteligencia. Se consulta con INTELIGENCIA_LEER; aprobar o rechazar exige
 * INTELIGENCIA_REVISAR_REPORTES. Abre en los pendientes, del mas antiguo al
 * mas reciente: lo que lleva mas tiempo esperando va primero.
 */
export function ReportesPage(): React.ReactElement {
  const { reportes, meta, cargando, error, consultadoEn, filtro, pendientes, cargar, irAPagina } =
    useReportesStore();
  const { opciones: criminales } = useOpcionesCriminales();
  const nombreCriminal = useNombresCriminales();
  const nombreZona = useNombreZonaConMar();
  const ahora = useAhora();
  const puedeRevisar = useHasPermission(Permiso.INTELIGENCIA_REVISAR_REPORTES);
  const [abierto, setAbierto] = useState<ReporteCiudadano | null>(null);
  const [resaltado, setResaltado] = useState<string | null>(null);

  useEffect(() => {
    void cargar({ page: 1 });
  }, [cargar]);

  // Los reportes traen el nombre del criminal; solo se piden los que no lo traigan.
  useEffect(() => {
    void resolverCriminales(
      reportes.filter((r) => r.criminalNombre === undefined).map((r) => r.criminalId),
    );
  }, [reportes]);

  useCambiosSincronizados([EVENTOS.REPORTE_RECIBIDO, EVENTOS.REPORTE_APROBADO], () => {
    void cargar();
  });

  const nombreDe = useCallback(
    (r: ReporteCiudadano): string =>
      r.criminalNombre ?? nombreCriminal(r.criminalId, 'Criminal sin identificar'),
    [nombreCriminal],
  );

  function filtrar(cambio: Partial<FiltroReportes>): void {
    void cargar({ ...cambio, page: 1 });
  }

  const activos = [
    filtro.estado !== FILTRO_INICIAL_REPORTES.estado ? 'estado' : '',
    filtro.criminalId,
    filtro.zonaInfluenciaId,
  ].filter(Boolean).length;

  function limpiar(): void {
    void cargar({
      estado: FILTRO_INICIAL_REPORTES.estado,
      criminalId: undefined,
      zonaInfluenciaId: undefined,
      page: 1,
    });
  }

  const columnas = useMemo<readonly ColumnaTabla<ReporteCiudadano>[]>(
    () => [
      {
        clave: 'criminal',
        encabezado: 'Sobre',
        principal: true,
        ancho: '14rem',
        celda: (r) => (
          <button type="button" className="intel-enlace" onClick={() => setAbierto(r)}>
            {nombreDe(r)}
          </button>
        ),
      },
      {
        clave: 'relato',
        encabezado: 'Lo que vio',
        ancha: true,
        celda: (r) => (
          <TextoRecortado className="intel-relato-corto" texto={r.descripcion} lineas={2} />
        ),
      },
      {
        clave: 'lugar',
        ancha: true,
        encabezado: 'Lugar',
        ocultarEnMovil: true,
        celda: (r) => (
          <span className="intel-celda-doble">
            <span className="intel-texto-largo">{r.ubicacion}</span>
            {nombreZona(r.zonaInfluenciaId) && <small>{nombreZona(r.zonaInfluenciaId)}</small>}
          </span>
        ),
      },
      {
        clave: 'informante',
        encabezado: 'Informante',
        ocultarEnMovil: true,
        celda: (r) => (
          <span className={r.informante.anonimo ? 'intel-anonimo' : 'intel-texto-largo'}>
            {nombreInformante(r.informante)}
          </span>
        ),
      },
      {
        clave: 'recibido',
        encabezado: 'Recibido',
        ancho: '8.5rem',
        celda: (r) => (
          <time dateTime={aIso(r.createdAt)} title={formatearFecha(r.createdAt)}>
            {tiempoRelativo(r.createdAt, new Date(ahora))}
          </time>
        ),
      },
      {
        clave: 'estado',
        encabezado: 'Estado',
        ancho: '8.5rem',
        celda: (r) => (
          <InsigniaEstado
            etiqueta={etiquetaEstadoReporte(r.estado)}
            tono={tonoEstadoReporte(r.estado)}
          />
        ),
      },
    ],
    [ahora, nombreZona, nombreDe],
  );

  const viendoPendientes = filtro.estado === 'PENDIENTE';

  return (
    <>
      <PageHeader
        titulo="Reportes ciudadanos"
        descripcion="Lo que informan ciudadanos e informantes. Nada entra al archivo hasta que un oficial lo revisa."
        meta={consultadoEn && <ActualizadoHace fecha={consultadoEn} prefijo="Consultado" />}
      />

      <PestanasInteligencia pendientes={pendientes} />

      <BarraFiltros filtrosActivos={activos} onLimpiar={limpiar}>
        <CampoSelect
          etiqueta="Estado"
          opcionVacia="Todos"
          value={filtro.estado ?? ''}
          opciones={opcionesEstadoReporte()}
          onChange={(e) => filtrar({ estado: (e.target.value || undefined) as EstadoReporte })}
        />
        <CampoSelect
          etiqueta="Criminal"
          opcionVacia="Todos"
          value={filtro.criminalId ?? ''}
          opciones={criminales.map((c) => ({ valor: c.id, etiqueta: etiquetaCriminal(c) }))}
          onChange={(e) => filtrar({ criminalId: e.target.value || undefined })}
        />
        <CampoSelect
          etiqueta="Zona"
          opcionVacia="Todos los mares"
          value={filtro.zonaInfluenciaId ?? ''}
          onChange={(e) => filtrar({ zonaInfluenciaId: e.target.value || undefined })}
        >
          <OpcionesZona />
        </CampoSelect>
      </BarraFiltros>

      <TablaDatos
        titulo="Reportes ciudadanos"
        filas={reportes}
        columnas={columnas}
        claveFila={(r) => r.id}
        cargando={cargando && reportes.length === 0}
        actualizando={cargando && reportes.length > 0}
        error={error}
        onReintentar={() => void cargar()}
        filaResaltada={resaltado}
        vacio={
          viendoPendientes && activos === 0 ? (
            <EstadoVacio
              icono={<IconoExito tamano={28} />}
              titulo="Bandeja al día: no hay reportes por revisar"
              detalle="Los reportes que envíe la ciudadanía desde el formulario público llegarán aquí."
            />
          ) : (
            <EstadoVacio
              icono={<IconoArchivoVacio tamano={28} />}
              titulo="Ningún reporte coincide con los filtros"
              detalle="Cambia el estado o quita el filtro de criminal o zona."
            >
              <Boton variante="fantasma" onClick={limpiar}>
                Volver a los pendientes
              </Boton>
            </EstadoVacio>
          )
        }
      />

      <Paginacion
        meta={meta}
        sustantivo="reportes"
        deshabilitada={cargando}
        onCambiarPagina={(p) => void irAPagina(p)}
      />

      <DialogoRevisionReporte
        reporte={abierto}
        nombreCriminal={abierto ? nombreDe(abierto) : ''}
        zona={abierto ? nombreZona(abierto.zonaInfluenciaId) : null}
        puedeRevisar={puedeRevisar}
        onCerrar={() => setAbierto(null)}
        onRevisado={(revisado) => {
          setAbierto(null);
          setResaltado(revisado.id);
          void cargar();
          void useReportesStore.getState().contarPendientes();
        }}
      />
    </>
  );
}
