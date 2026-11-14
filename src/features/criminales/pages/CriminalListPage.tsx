import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Permiso } from '@core/session/permiso.enum';
import { EVENTOS } from '@core/sync/eventos';
import { useCambiosSincronizados } from '@core/sync/sincronizacion';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { useValorDiferido } from '@shared/hooks/useValorDiferido';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { BadgeAmenaza } from '@shared/ui/BadgeAmenaza';
import { BarraFiltros } from '@shared/ui/BarraFiltros';
import { BotonEnlace } from '@shared/ui/Boton';
import { CampoSelect } from '@shared/ui/Campo';
import { EstadoVacio } from '@shared/ui/Estados';
import { IconoBrujula, IconoMas } from '@shared/ui/iconos';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { InsigniaTipoCriminal } from '@shared/ui/InsigniaTipoCriminal';
import { MontoBerries } from '@shared/ui/MontoBerries';
import { PageHeader } from '@shared/ui/PageHeader';
import { Paginacion } from '@shared/ui/Paginacion';
import { RetratoCriminal } from '@shared/ui/RetratoCriminal';
import { TablaDatos, type ColumnaTabla } from '@shared/ui/TablaDatos';
import {
  etiquetaEstadoCriminal,
  opcionesCategoria,
  opcionesEstadoCriminal,
  tonoEstadoCriminal,
} from '@shared/utils/criminal';
import { opcionesNivelAmenaza, type NivelAmenaza } from '@shared/utils/nivel-amenaza';
import { TextoRecortado } from '@shared/ui/TextoRecortado';
import { SelectorOrganizacion } from '../components/SelectorOrganizacion';
import { CampoZona } from '@shared/ui/CampoZona';
import { useCriminalesStore } from '../data-access/criminales.store';
import { claveDeRango, RANGOS_RECOMPENSA, rangoPorClave } from '../utils/rangos-recompensa';
import '../criminales.css';
import type {
  CategoriaOrganizacion,
  Criminal,
  EstadoCriminal,
  FiltroCriminales,
} from '../models/criminal';

const COLUMNAS: readonly ColumnaTabla<Criminal>[] = [
  {
    clave: 'nombre',
    encabezado: 'Criminal',
    principal: true,
    celda: (c) => (
      <span className="criminal-celda">
        <RetratoCriminal fotoUrl={c.fotoUrl} nombre={c.nombre} tamano="sm" marco="cartel" />
        <span className="criminal-celda-texto">
          <Link to={c.id}>{c.nombre}</Link>
          {c.alias.length > 0 && (
            <TextoRecortado como="small" texto={`«${c.alias.join('», «')}»`} />
          )}
        </span>
      </span>
    ),
  },
  {
    clave: 'tipo',
    encabezado: 'Tipo',
    celda: (c) => <InsigniaTipoCriminal categoria={c.organizacion?.categoria ?? null} />,
  },
  {
    clave: 'afiliacion',
    encabezado: 'Afiliación',
    ocultarEnMovil: true,
    celda: (c) => c.organizacion?.organizacionNombre ?? '—',
  },
  {
    clave: 'recompensa',
    encabezado: 'Recompensa',
    numerica: true,
    celda: (c) => <MontoBerries valor={c.recompensaVigenteMonto} abreviado />,
  },
  {
    clave: 'amenaza',
    encabezado: 'Amenaza',
    celda: (c) => <BadgeAmenaza nivel={c.nivelAmenaza} />,
  },
  {
    clave: 'estado',
    encabezado: 'Estado',
    celda: (c) => (
      <InsigniaEstado
        etiqueta={etiquetaEstadoCriminal(c.estado)}
        tono={tonoEstadoCriminal(c.estado)}
      />
    ),
  },
];

type FiltrosVisibles = Pick<
  FiltroCriminales,
  | 'estado'
  | 'categoria'
  | 'nivelAmenaza'
  | 'zonaInfluenciaId'
  | 'organizacionId'
  | 'recompensaMin'
  | 'recompensaMax'
>;

/**
 * PAGINA DE REFERENCIA (RF-1) para los listados.
 *
 * Patron para todas las paginas del proyecto:
 *  - el estado se lee del store de la feature, nunca de un store global
 *  - se compone con shared/ui: PageHeader, BarraFiltros, TablaDatos, Paginacion
 *  - TablaDatos resuelve carga, recarga, error y vacio
 *  - las acciones se ocultan con useHasPermission
 *  - los cambios de otras bases llegan por useCambiosSincronizados
 *
 * Filtros de RF-1: nombre o alias, estado, tipo, amenaza, zona (agrupada por
 * mar), rango de recompensa y afiliacion concreta.
 */
export function CriminalListPage(): React.ReactElement {
  const { criminales, meta, cargando, error, consultadoEn, filtro, cargar, irAPagina } =
    useCriminalesStore();
  const puedeEscribir = useHasPermission(Permiso.CRIMINALES_ESCRIBIR);

  const [texto, setTexto] = useState(filtro.q ?? '');
  const q = useValorDiferido(texto.trim(), 350);

  useEffect(() => {
    void cargar({ q: q || undefined, page: 1 });
  }, [cargar, q]);

  // Otra base registro o modifico un criminal: se recarga la pagina actual.
  useCambiosSincronizados(
    [EVENTOS.CRIMINAL_REGISTRADO, EVENTOS.CRIMINAL_ACTUALIZADO, EVENTOS.CRIMINAL_ESTADO_CAMBIADO],
    () => void cargar(),
  );

  function filtrar(cambio: Partial<FiltrosVisibles>): void {
    void cargar({ ...cambio, page: 1 });
  }

  const activos = [
    filtro.estado,
    filtro.categoria,
    filtro.nivelAmenaza,
    filtro.zonaInfluenciaId,
    filtro.organizacionId,
    filtro.recompensaMin ?? filtro.recompensaMax,
  ].filter((v) => v !== undefined && v !== '').length;

  function limpiar(): void {
    setTexto('');
    void cargar({
      q: undefined,
      estado: undefined,
      categoria: undefined,
      nivelAmenaza: undefined,
      zonaInfluenciaId: undefined,
      organizacionId: undefined,
      recompensaMin: undefined,
      recompensaMax: undefined,
      page: 1,
    });
  }

  const hayFiltros = activos > 0 || Boolean(q);

  return (
    <>
      <PageHeader
        titulo="Criminales"
        descripcion="Piratas, revolucionarios y organizaciones independientes con orden de captura."
        meta={consultadoEn && <ActualizadoHace fecha={consultadoEn} prefijo="Consultado" />}
      >
        <BotonEnlace to="organizaciones">Tripulaciones y organizaciones</BotonEnlace>
        {puedeEscribir && (
          <BotonEnlace variante="principal" to="nuevo" icono={<IconoMas tamano={18} />}>
            Registrar criminal
          </BotonEnlace>
        )}
      </PageHeader>

      <BarraFiltros
        busqueda={texto}
        onBusquedaChange={setTexto}
        etiquetaBusqueda="Buscar por nombre o alias"
        filtrosActivos={activos}
        onLimpiar={limpiar}
      >
        <CampoSelect
          etiqueta="Estado"
          opcionVacia="Todos"
          value={filtro.estado ?? ''}
          opciones={opcionesEstadoCriminal()}
          onChange={(e) => filtrar({ estado: (e.target.value || undefined) as EstadoCriminal })}
        />
        <CampoSelect
          etiqueta="Tipo"
          opcionVacia="Todos"
          value={filtro.categoria ?? ''}
          opciones={opcionesCategoria()}
          onChange={(e) =>
            filtrar({ categoria: (e.target.value || undefined) as CategoriaOrganizacion })
          }
        />
        <CampoSelect
          etiqueta="Amenaza"
          opcionVacia="Todas"
          value={filtro.nivelAmenaza ?? ''}
          opciones={opcionesNivelAmenaza(true)}
          onChange={(e) => filtrar({ nivelAmenaza: (e.target.value || undefined) as NivelAmenaza })}
        />
        <CampoZona
          etiqueta="Zona"
          opcionVacia="Todos los mares"
          value={filtro.zonaInfluenciaId ?? ''}
          onChange={(e) => filtrar({ zonaInfluenciaId: e.target.value || undefined })}
        />
        <CampoSelect
          etiqueta="Recompensa"
          opcionVacia="Cualquier monto"
          value={claveDeRango(filtro.recompensaMin, filtro.recompensaMax)}
          opciones={RANGOS_RECOMPENSA.map((r) => ({ valor: r.clave, etiqueta: r.etiqueta }))}
          onChange={(e) => {
            const rango = rangoPorClave(e.target.value);
            filtrar({ recompensaMin: rango?.min, recompensaMax: rango?.max });
          }}
        />
        <SelectorOrganizacion
          etiqueta="Afiliación"
          opcionVacia="Todas"
          value={filtro.organizacionId ?? ''}
          onChange={(e) => filtrar({ organizacionId: e.target.value || undefined })}
        />
      </BarraFiltros>

      <TablaDatos
        titulo="Criminales registrados"
        filas={criminales}
        columnas={COLUMNAS}
        claveFila={(c) => c.id}
        cargando={cargando && criminales.length === 0}
        actualizando={cargando && criminales.length > 0}
        error={error}
        onReintentar={() => void cargar()}
        claseFila={(c) =>
          c.estado !== 'ACTIVO'
            ? 'criminal-fila--baja'
            : c.nivelAmenaza === 'ALTO'
              ? 'fila-amenaza-alta'
              : undefined
        }
        vacio={
          hayFiltros ? (
            <EstadoVacio
              icono={<IconoBrujula tamano={28} />}
              titulo="Ningún criminal coincide con la búsqueda"
              detalle="Prueba con otro nombre o alias, o quita algún filtro."
            />
          ) : (
            <EstadoVacio
              titulo="Aún no hay criminales en el archivo"
              detalle="Los registros de todas las bases aparecerán aquí."
            >
              {puedeEscribir && (
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
        sustantivo="criminales"
        deshabilitada={cargando}
        onCambiarPagina={(p) => void irAPagina(p)}
      />
    </>
  );
}
