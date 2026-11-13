import { useEffect, useState } from 'react';
import { useCatalogos } from '@core/catalogos/catalogos';
import { Permiso } from '@core/session/permiso.enum';
import { EVENTOS, type OperativoActualizadoDatos } from '@core/sync/eventos';
import { useCambiosSincronizados } from '@core/sync/sincronizacion';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { useValorDiferido } from '@shared/hooks/useValorDiferido';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { BarraFiltros } from '@shared/ui/BarraFiltros';
import { BotonEnlace } from '@shared/ui/Boton';
import { CampoSelect } from '@shared/ui/Campo';
import { EstadoError, EstadoVacio, Skeleton } from '@shared/ui/Estados';
import { IconoBrujula, IconoMas } from '@shared/ui/iconos';
import { PageHeader } from '@shared/ui/PageHeader';
import { Paginacion } from '@shared/ui/Paginacion';
import { FilaOperativo } from '../components/FilaOperativo';
import { DURACION_MARCA_MS, useTableroStore } from '../data-access/operativos.store';
import {
  agruparTablero,
  opcionesEstadoOperativo,
  opcionesPrioridad,
  type EstadoOperativo,
  type PrioridadOperativo,
} from '../models/operativo';
import '../operativos.css';

function EncabezadoColumnas(): React.ReactElement {
  return (
    <div className="despliegue-encabezado" aria-hidden="true">
      <span>Prioridad</span>
      <span>Operativo</span>
      <span>Estado</span>
      <span>Bases asignadas</span>
      <span>Último cambio</span>
    </div>
  );
}

function FilasEsqueleto(): React.ReactElement {
  return (
    <ul className="despliegue-lista" aria-hidden="true">
      {Array.from({ length: 4 }, (_, i) => (
        <li key={i} className="despliegue-fila">
          <Skeleton ancho="4.5rem" />
          <span className="despliegue-ident">
            <Skeleton ancho="5rem" />
            <Skeleton ancho={`${60 + ((i * 13) % 30)}%`} />
          </span>
          <Skeleton ancho="6rem" />
          <Skeleton ancho="80%" />
          <Skeleton ancho="7rem" />
        </li>
      ))}
    </ul>
  );
}

/**
 * RF-4 Tablero de despliegue. Agrupa por lo que esta pasando (en curso),
 * lo que viene (planificados) y el archivo, y se actualiza solo cuando otra
 * base cambia un operativo (evento operativo.actualizado, <= 15 s).
 */
export function TableroPage(): React.ReactElement {
  const { operativos, meta, cargando, error, consultadoEn, filtro, recientes, ...acciones } =
    useTableroStore();
  const { cargar, irAPagina, refrescar, olvidarRecientes } = acciones;
  const { mares, zonasDeMar, bases, nombreBase, nombreZona } = useCatalogos();
  const puedeCoordinar = useHasPermission(Permiso.OPERATIVOS_COORDINAR);

  const [texto, setTexto] = useState(filtro.q ?? '');
  const q = useValorDiferido(texto.trim(), 350);

  useEffect(() => {
    void cargar({ q: q || undefined, page: 1 });
  }, [cargar, q]);

  useCambiosSincronizados<OperativoActualizadoDatos>([EVENTOS.OPERATIVO_ACTUALIZADO], (c) => {
    void refrescar(c.datos?.operativoId);
  });

  const hayRecientes = Object.keys(recientes).length > 0;
  useEffect(() => {
    if (!hayRecientes) return;
    const t = setTimeout(() => olvidarRecientes(), DURACION_MARCA_MS);
    return () => clearTimeout(t);
  }, [hayRecientes, recientes, olvidarRecientes]);

  const activos = [filtro.estado, filtro.prioridad, filtro.baseNavalId].filter(Boolean).length;
  const hayFiltros = activos > 0 || Boolean(q);

  function limpiar(): void {
    setTexto('');
    void cargar({
      q: undefined,
      estado: undefined,
      prioridad: undefined,
      baseNavalId: undefined,
      page: 1,
    });
  }

  const grupos = agruparTablero(operativos);
  const primeraCarga = cargando && operativos.length === 0;

  let contenido: React.ReactNode;
  if (primeraCarga) {
    contenido = (
      <section className="despliegue-grupo" aria-busy="true">
        <span className="sr-only">Cargando operativos…</span>
        <EncabezadoColumnas />
        <FilasEsqueleto />
      </section>
    );
  } else if (error && operativos.length === 0) {
    contenido = (
      <div className="despliegue-grupo">
        <EstadoError error={error} onReintentar={() => void cargar()} />
      </div>
    );
  } else if (operativos.length === 0) {
    contenido = (
      <div className="despliegue-grupo">
        {hayFiltros ? (
          <EstadoVacio
            icono={<IconoBrujula tamano={28} />}
            titulo="Ningún operativo coincide con los filtros"
            detalle="Prueba con otro código o nombre, o quita algún filtro."
          />
        ) : (
          <EstadoVacio
            titulo="No hay operativos desplegados"
            detalle={
              puedeCoordinar
                ? 'Cuando organices una captura, aparecerá aquí con sus bases asignadas.'
                : 'Cuando el mando asigne tu base a un operativo, aparecerá aquí.'
            }
          >
            {puedeCoordinar && (
              <BotonEnlace variante="principal" to="nuevo">
                Planificar el primero
              </BotonEnlace>
            )}
          </EstadoVacio>
        )}
      </div>
    );
  } else {
    contenido = (
      <div className={cargando ? 'despliegue despliegue--actualizando' : 'despliegue'}>
        {error ? (
          <EstadoError
            error={error}
            titulo="No se pudo actualizar el tablero"
            detalle="Lo que ves es la última versión que llegó."
            onReintentar={() => void cargar()}
          />
        ) : null}
        {grupos.map((g) => (
          <section
            key={g.clave}
            className={`despliegue-grupo despliegue-grupo--${g.clave}`}
            aria-labelledby={`grupo-${g.clave}`}
          >
            <h2 id={`grupo-${g.clave}`} className="despliegue-grupo-titulo">
              {g.titulo}{' '}
              <span className="despliegue-grupo-cuenta cifra">{g.operativos.length}</span>
            </h2>
            <EncabezadoColumnas />
            <ul className="despliegue-lista">
              {g.operativos.map((op) => (
                <FilaOperativo
                  key={op.id}
                  operativo={op}
                  nombreBase={nombreBase}
                  nombreZona={nombreZona}
                  reciente={op.id in recientes}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  }

  return (
    <>
      <PageHeader
        titulo="Operativos"
        descripcion="Despliegues de captura: estado, prioridad y bases asignadas, al día entre bases."
        meta={consultadoEn && <ActualizadoHace fecha={consultadoEn} prefijo="Consultado" />}
      >
        {puedeCoordinar && (
          <BotonEnlace variante="principal" to="nuevo" icono={<IconoMas tamano={18} />}>
            Nuevo operativo
          </BotonEnlace>
        )}
      </PageHeader>

      <BarraFiltros
        busqueda={texto}
        onBusquedaChange={setTexto}
        etiquetaBusqueda="Buscar por código o nombre del operativo"
        filtrosActivos={activos}
        onLimpiar={limpiar}
      >
        <CampoSelect
          etiqueta="Estado"
          opcionVacia="Todos"
          value={filtro.estado ?? ''}
          opciones={opcionesEstadoOperativo()}
          onChange={(e) =>
            void cargar({ estado: (e.target.value || undefined) as EstadoOperativo, page: 1 })
          }
        />
        <CampoSelect
          etiqueta="Prioridad"
          opcionVacia="Todas"
          value={filtro.prioridad ?? ''}
          opciones={opcionesPrioridad()}
          onChange={(e) =>
            void cargar({
              prioridad: (e.target.value || undefined) as PrioridadOperativo,
              page: 1,
            })
          }
        />
        <CampoSelect
          etiqueta="Base asignada"
          opcionVacia="Todas las bases"
          value={filtro.baseNavalId ?? ''}
          onChange={(e) => void cargar({ baseNavalId: e.target.value || undefined, page: 1 })}
        >
          {mares.map((mar) => {
            const zonas = new Set(zonasDeMar(mar.id).map((z) => z.id));
            const delMar = bases.filter((b) => zonas.has(b.zonaInfluenciaId));
            if (delMar.length === 0) return null;
            return (
              <optgroup key={mar.id} label={mar.nombre}>
                {delMar.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </CampoSelect>
      </BarraFiltros>

      {contenido}

      <Paginacion
        meta={meta}
        sustantivo="operativos"
        deshabilitada={cargando}
        onCambiarPagina={(p) => void irAPagina(p)}
      />
    </>
  );
}
