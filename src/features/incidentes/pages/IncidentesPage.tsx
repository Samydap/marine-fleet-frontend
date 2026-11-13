import {
  useNombresCriminales,
  useOpcionesCriminales,
} from '@core/directorio/directorio-criminales';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCatalogos } from '@core/catalogos/catalogos';
import { Permiso } from '@core/session/permiso.enum';
import { EVENTOS } from '@core/sync/eventos';
import { useCambiosSincronizados } from '@core/sync/sincronizacion';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { BarraFiltros } from '@shared/ui/BarraFiltros';
import { Boton, BotonEnlace } from '@shared/ui/Boton';
import { CampoSelect, CampoTexto } from '@shared/ui/Campo';
import { EstadoVacio } from '@shared/ui/Estados';
import { IconoBrujula, IconoMas } from '@shared/ui/iconos';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { PageHeader } from '@shared/ui/PageHeader';
import { Paginacion } from '@shared/ui/Paginacion';
import { TablaDatos, type ColumnaTabla } from '@shared/ui/TablaDatos';
import { aIso, formatearFecha, valorFechaLocal } from '@shared/utils/fecha';
import { useDirectorioIncidentes } from '../data-access/directorio.store';
import { useIncidentesStore } from '../data-access/incidentes.store';
import {
  etiquetaResultado,
  etiquetaTipo,
  limiteDelDia,
  opcionesTipo,
  resumirNombres,
  tonoResultado,
  type FiltroIncidentes,
  type Incidente,
  type TipoIncidente,
} from '../models/incidente';
import '../incidentes.css';

const fechaDeFiltro = (iso: string | undefined): string =>
  iso ? valorFechaLocal(new Date(iso)) : '';

/**
 * RF-6 Historial de enfrentamientos: consulta por criminal, base naval u
 * operativo de origen (filtros combinables de GET /incidentes).
 */
export function IncidentesPage(): React.ReactElement {
  const { incidentes, meta, cargando, error, consultadoEn, filtro, cargar, irAPagina } =
    useIncidentesStore();
  const {
    operativos,
    operativosPorId,
    cargar: cargarDirectorio,
    resolver,
  } = useDirectorioIncidentes();
  const { opciones: criminales } = useOpcionesCriminales();
  const nombreCriminal = useNombresCriminales();
  const { bases, nombreBase } = useCatalogos();
  const puedeRegistrar = useHasPermission(Permiso.INCIDENTES_ESCRIBIR);

  useEffect(() => {
    void cargar({ page: 1 });
    void cargarDirectorio();
  }, [cargar, cargarDirectorio]);

  useEffect(() => {
    void resolver(
      // Los incidentes ya traen el nombre de cada criminal: solo se piden los que falten.
      incidentes.flatMap((i) =>
        i.criminales.filter((c) => c.criminalNombre === undefined).map((c) => c.criminalId),
      ),
      incidentes.flatMap((i) => (i.operativoId ? [i.operativoId] : [])),
    );
  }, [incidentes, resolver]);

  useCambiosSincronizados([EVENTOS.INCIDENTE_REGISTRADO, EVENTOS.INCIDENTE_CERRADO], () => {
    void cargar();
  });

  function filtrar(cambio: Partial<FiltroIncidentes>): void {
    const siguiente = { ...filtro, ...cambio, page: 1 };
    if (siguiente.desde && siguiente.hasta && siguiente.desde > siguiente.hasta) {
      useIncidentesStore.setState({ filtro: siguiente });
      return;
    }
    void cargar(siguiente);
  }

  const activos = [
    filtro.criminalId,
    filtro.baseNavalId,
    filtro.operativoId,
    filtro.tipo,
    filtro.desde,
    filtro.hasta,
  ].filter(Boolean).length;
  const rangoInvalido = Boolean(filtro.desde && filtro.hasta && filtro.desde > filtro.hasta);

  function limpiar(): void {
    void cargar({
      criminalId: undefined,
      baseNavalId: undefined,
      operativoId: undefined,
      tipo: undefined,
      desde: undefined,
      hasta: undefined,
      page: 1,
    });
  }

  const columnas = useMemo<readonly ColumnaTabla<Incidente>[]>(
    () => [
      {
        clave: 'incidente',
        encabezado: 'Incidente',
        principal: true,
        celda: (i) => (
          <span className="inc-celda-doble">
            <Link to={i.id}>{etiquetaTipo(i.tipo)}</Link>
            <small>{i.ubicacion}</small>
          </span>
        ),
      },
      {
        clave: 'fecha',
        encabezado: 'Fecha',
        ancho: '10.5rem',
        celda: (i) => (
          <time className="cifra" dateTime={aIso(i.fechaHora)}>
            {formatearFecha(i.fechaHora)}
          </time>
        ),
      },
      {
        clave: 'criminales',
        encabezado: 'Criminales',
        celda: (i) => (
          <span className="inc-texto-largo">
            {resumirNombres(
              i.criminales.map(
                (c) => c.criminalNombre ?? nombreCriminal(c.criminalId, 'Criminal sin identificar'),
              ),
            )}
          </span>
        ),
      },
      {
        clave: 'base',
        encabezado: 'Base naval',
        ocultarEnMovil: true,
        celda: (i) =>
          i.baseNavalId ? (i.baseNavalNombre ?? nombreBase(i.baseNavalId)) : 'Sin base',
      },
      {
        clave: 'operativo',
        encabezado: 'Operativo',
        celda: (i) =>
          i.operativoId ? (
            <Link className="inc-codigo" to={`/operativos/${encodeURIComponent(i.operativoId)}`}>
              {operativosPorId[i.operativoId]?.codigo ?? 'Ver operativo'}
            </Link>
          ) : (
            <span className="inc-sin-dato">Sin vincular</span>
          ),
      },
      {
        clave: 'resultado',
        encabezado: 'Resultado',
        ancho: '8.5rem',
        celda: (i) => (
          <InsigniaEstado
            etiqueta={etiquetaResultado(i.resultado)}
            tono={tonoResultado(i.resultado)}
            enCurso={i.resultado === 'EN_CURSO'}
          />
        ),
      },
      {
        clave: 'bajas',
        encabezado: 'Bajas M / E',
        numerica: true,
        ocultarEnMovil: true,
        ancho: '6.5rem',
        celda: (i) => (
          <span title={`${i.bajasMarina} de la Marina, ${i.bajasEnemigas} enemigas`}>
            <span aria-hidden="true">
              {i.bajasMarina} / {i.bajasEnemigas}
            </span>
            <span className="sr-only">
              {i.bajasMarina} de la Marina, {i.bajasEnemigas} enemigas
            </span>
          </span>
        ),
      },
    ],
    [nombreBase, nombreCriminal, operativosPorId],
  );

  return (
    <>
      <PageHeader
        titulo="Incidentes"
        descripcion="Enfrentamientos, capturas y fugas registrados por la flota, con su operativo de origen."
        meta={consultadoEn && <ActualizadoHace fecha={consultadoEn} prefijo="Consultado" />}
      >
        {puedeRegistrar && (
          <BotonEnlace variante="principal" to="nuevo" icono={<IconoMas tamano={18} />}>
            Registrar enfrentamiento
          </BotonEnlace>
        )}
      </PageHeader>

      <BarraFiltros filtrosActivos={activos} onLimpiar={limpiar}>
        <CampoSelect
          etiqueta="Criminal"
          opcionVacia="Todos"
          value={filtro.criminalId ?? ''}
          opciones={criminales.map((c) => ({ valor: c.id, etiqueta: c.nombre }))}
          onChange={(e) => filtrar({ criminalId: e.target.value || undefined })}
        />
        <CampoSelect
          etiqueta="Base naval"
          opcionVacia="Todas"
          value={filtro.baseNavalId ?? ''}
          opciones={bases.map((b) => ({ valor: b.id, etiqueta: b.nombre }))}
          onChange={(e) => filtrar({ baseNavalId: e.target.value || undefined })}
        />
        <CampoSelect
          etiqueta="Operativo"
          opcionVacia="Todos"
          value={filtro.operativoId ?? ''}
          opciones={operativos.map((o) => ({ valor: o.id, etiqueta: `${o.codigo} · ${o.nombre}` }))}
          onChange={(e) => filtrar({ operativoId: e.target.value || undefined })}
        />
        <CampoSelect
          etiqueta="Tipo"
          opcionVacia="Todos"
          value={filtro.tipo ?? ''}
          opciones={opcionesTipo()}
          onChange={(e) => filtrar({ tipo: (e.target.value || undefined) as TipoIncidente })}
        />
        <CampoTexto
          etiqueta="Desde"
          type="date"
          value={fechaDeFiltro(filtro.desde)}
          onChange={(e) => filtrar({ desde: limiteDelDia(e.target.value, 'inicio') })}
          error={rangoInvalido ? 'Debe ser anterior a "hasta".' : undefined}
        />
        <CampoTexto
          etiqueta="Hasta"
          type="date"
          value={fechaDeFiltro(filtro.hasta)}
          onChange={(e) => filtrar({ hasta: limiteDelDia(e.target.value, 'fin') })}
        />
      </BarraFiltros>

      <TablaDatos
        titulo="Incidentes registrados"
        filas={incidentes}
        columnas={columnas}
        claveFila={(i) => i.id}
        cargando={cargando && incidentes.length === 0}
        actualizando={cargando && incidentes.length > 0}
        error={error}
        onReintentar={() => void cargar()}
        vacio={
          activos > 0 ? (
            <EstadoVacio
              icono={<IconoBrujula tamano={28} />}
              titulo="Ningún incidente coincide con los filtros"
              detalle="Prueba con otra base, otro operativo o un rango de fechas más amplio."
            >
              <Boton variante="fantasma" onClick={limpiar}>
                Limpiar filtros
              </Boton>
            </EstadoVacio>
          ) : (
            <EstadoVacio
              titulo="Aún no hay incidentes registrados"
              detalle="Los enfrentamientos que registren las bases aparecerán aquí."
            >
              {puedeRegistrar && (
                <BotonEnlace variante="secundario" to="nuevo">
                  Registrar el primero
                </BotonEnlace>
              )}
            </EstadoVacio>
          )
        }
      />

      <Paginacion
        meta={meta}
        sustantivo="incidentes"
        deshabilitada={cargando}
        onCambiarPagina={(p) => void irAPagina(p)}
      />
    </>
  );
}
