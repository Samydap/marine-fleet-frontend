import { useOpcionesCriminales } from '@core/directorio/directorio-criminales';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Permiso } from '@core/session/permiso.enum';
import { notificar } from '@core/services/notification.store';
import { EVENTOS } from '@core/sync/eventos';
import { useCambiosSincronizados } from '@core/sync/sincronizacion';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { useValorDiferido } from '@shared/hooks/useValorDiferido';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { BarraFiltros } from '@shared/ui/BarraFiltros';
import { Boton, BotonIcono } from '@shared/ui/Boton';
import { CampoSelect, CampoTexto } from '@shared/ui/Campo';
import { DialogoConfirmacion } from '@shared/ui/Dialogo';
import { EstadoVacio } from '@shared/ui/Estados';
import { IconoBrujula, IconoEditar, IconoMas } from '@shared/ui/iconos';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { PageHeader } from '@shared/ui/PageHeader';
import { Paginacion } from '@shared/ui/Paginacion';
import { TablaDatos, type ColumnaTabla } from '@shared/ui/TablaDatos';
import { aIso, formatearFecha } from '@shared/utils/fecha';
import { DialogoAvistamiento } from '../components/DialogoAvistamiento';
import { OpcionesZona, useNombreZonaConMar } from '@shared/ui/CampoZona';
import { PestanasInteligencia } from '../components/PestanasInteligencia';
import { useAvistamientosStore } from '../data-access/avistamientos.store';
import { inteligenciaApi } from '../data-access/inteligencia-api';
import { useReportesStore } from '../data-access/reportes.store';
import {
  esModificable,
  etiquetaCriminal,
  etiquetaOrigen,
  etiquetaVerificacion,
  opcionesVerificacion,
  tonoVerificacion,
  type Avistamiento,
  type EstadoVerificacion,
  type FiltroAvistamientos,
} from '../models/avistamiento';
import '../inteligencia.css';

type Decision = { avistamiento: Avistamiento; estado: 'VERIFICADO' | 'DESCARTADO' };

/**
 * RF-3 Centro de inteligencia: archivo de avistamientos.
 *
 * Consulta por criminal, zona, rango de fechas y estado de verificacion; los
 * oficiales con INTELIGENCIA_ESCRIBIR registran y corrigen, y quien tiene
 * INTELIGENCIA_REVISAR_REPORTES verifica o descarta.
 */
export function AvistamientosPage(): React.ReactElement {
  const {
    avistamientos,
    meta,
    cargando,
    error,
    consultadoEn,
    filtro,
    cargar,
    irAPagina,
    reemplazar,
  } = useAvistamientosStore();
  const { opciones: criminales } = useOpcionesCriminales();
  const { pendientes, contarPendientes } = useReportesStore();
  const nombreZona = useNombreZonaConMar();

  const puedeEscribir = useHasPermission(Permiso.INTELIGENCIA_ESCRIBIR);
  const puedeVerificar = useHasPermission(Permiso.INTELIGENCIA_REVISAR_REPORTES);

  const [texto, setTexto] = useState(filtro.q ?? '');
  const q = useValorDiferido(texto.trim(), 350);
  const [dialogo, setDialogo] = useState<{ abierto: boolean; avistamiento: Avistamiento | null }>({
    abierto: false,
    avistamiento: null,
  });
  const [decision, setDecision] = useState<Decision | null>(null);
  const [resaltado, setResaltado] = useState<string | null>(null);

  useEffect(() => {
    void cargar({ q: q || undefined, page: 1 });
  }, [cargar, q]);

  useEffect(() => {
    void contarPendientes();
  }, [contarPendientes]);

  // Otra base registro un avistamiento o se aprobo un reporte: se recarga la pagina.
  useCambiosSincronizados(
    [EVENTOS.AVISTAMIENTO_REGISTRADO, EVENTOS.REPORTE_APROBADO, EVENTOS.REPORTE_RECIBIDO],
    (cambio) => {
      if (cambio.evento === EVENTOS.REPORTE_RECIBIDO) void contarPendientes();
      else void cargar();
    },
  );

  function filtrar(cambio: Partial<FiltroAvistamientos>): void {
    const siguiente = { ...filtro, ...cambio, page: 1 };
    if (siguiente.desde && siguiente.hasta && siguiente.desde > siguiente.hasta) {
      // Rango al reves: se marca en el campo y no se consulta hasta corregirlo.
      useAvistamientosStore.setState({ filtro: siguiente });
      return;
    }
    void cargar(siguiente);
  }

  const activos = [
    filtro.criminalId,
    filtro.zonaInfluenciaId,
    filtro.estadoVerificacion,
    filtro.desde,
    filtro.hasta,
  ].filter(Boolean).length;
  const hayFiltros = activos > 0 || Boolean(q);
  const rangoInvalido = Boolean(filtro.desde && filtro.hasta && filtro.desde > filtro.hasta);

  function limpiar(): void {
    setTexto('');
    void cargar({
      q: undefined,
      criminalId: undefined,
      zonaInfluenciaId: undefined,
      estadoVerificacion: undefined,
      desde: undefined,
      hasta: undefined,
      page: 1,
    });
  }

  async function decidir(): Promise<void> {
    if (!decision) return;
    const actualizado = await inteligenciaApi.verificarAvistamiento(
      decision.avistamiento.id,
      decision.estado,
    );
    // La respuesta de PATCH puede traer el nombre vacio: se conserva el que ya se veia.
    reemplazar({
      ...actualizado,
      criminalNombre: actualizado.criminalNombre || decision.avistamiento.criminalNombre,
    });
    setResaltado(actualizado.id);
    notificar.exito(
      decision.estado === 'VERIFICADO'
        ? 'Avistamiento verificado: ya es inteligencia oficial.'
        : 'Avistamiento descartado.',
    );
  }

  const columnas = useMemo<readonly ColumnaTabla<Avistamiento>[]>(() => {
    const base: ColumnaTabla<Avistamiento>[] = [
      {
        clave: 'criminal',
        encabezado: 'Criminal',
        principal: true,
        celda: (a) => (
          <span className="intel-celda-doble">
            <Link to={`/criminales/${encodeURIComponent(a.criminalId)}`}>
              {a.criminalNombre || 'Criminal sin nombre'}
            </Link>
            {a.origen === 'REPORTE_CIUDADANO' && <small>{etiquetaOrigen(a.origen)}</small>}
          </span>
        ),
      },
      {
        clave: 'fecha',
        encabezado: 'Visto el',
        ancho: '11rem',
        celda: (a) => (
          <time className="cifra" dateTime={aIso(a.fechaHora)}>
            {formatearFecha(a.fechaHora)}
          </time>
        ),
      },
      {
        clave: 'lugar',
        ancha: true,
        encabezado: 'Lugar',
        celda: (a) => (
          <span className="intel-celda-doble">
            <span className="intel-texto-largo">{a.ubicacion}</span>
            {nombreZona(a.zonaInfluenciaId) && <small>{nombreZona(a.zonaInfluenciaId)}</small>}
          </span>
        ),
      },
      {
        clave: 'testigo',
        encabezado: 'Testigo',
        ocultarEnMovil: true,
        celda: (a) =>
          a.testigo ? <span className="intel-texto-largo">{a.testigo}</span> : 'Sin testigo',
      },
      {
        clave: 'verificacion',
        encabezado: 'Verificación',
        ancho: '9.5rem',
        celda: (a) => (
          <InsigniaEstado
            etiqueta={etiquetaVerificacion(a.estadoVerificacion)}
            tono={tonoVerificacion(a.estadoVerificacion)}
          />
        ),
      },
    ];

    if (puedeEscribir || puedeVerificar) {
      base.push({
        clave: 'acciones',
        ancha: true,
        encabezado: 'Acciones',
        alinear: 'fin',
        celda: (a) => {
          const verificar = puedeVerificar && a.estadoVerificacion === 'PENDIENTE';
          const corregir = puedeEscribir && esModificable(a);
          if (!verificar && !corregir) {
            return (
              <span className="intel-sin-acciones">
                {a.estadoVerificacion === 'VERIFICADO' ? 'Inteligencia oficial' : 'Sin acciones'}
              </span>
            );
          }
          return (
            <span className="intel-acciones-fila">
              {verificar && (
                <>
                  <Boton
                    tamano="compacto"
                    onClick={() => setDecision({ avistamiento: a, estado: 'VERIFICADO' })}
                  >
                    Verificar
                  </Boton>
                  <Boton
                    tamano="compacto"
                    variante="fantasma"
                    onClick={() => setDecision({ avistamiento: a, estado: 'DESCARTADO' })}
                  >
                    Descartar
                  </Boton>
                </>
              )}
              {corregir && (
                <BotonIcono
                  tamano="compacto"
                  etiqueta={`Corregir el avistamiento de ${a.criminalNombre || 'este criminal'}`}
                  icono={<IconoEditar tamano={18} />}
                  onClick={() => setDialogo({ abierto: true, avistamiento: a })}
                />
              )}
            </span>
          );
        },
      });
    }
    return base;
  }, [nombreZona, puedeEscribir, puedeVerificar]);

  const lugarDecision = decision?.avistamiento.ubicacion ?? '';
  const nombreDecision = decision?.avistamiento.criminalNombre || 'este criminal';

  return (
    <>
      <PageHeader
        titulo="Avistamientos"
        descripcion="Dónde y cuándo se vio a cada criminal, según patrullas, informantes y el centro de inteligencia."
        meta={consultadoEn && <ActualizadoHace fecha={consultadoEn} prefijo="Consultado" />}
      >
        {puedeEscribir && (
          <Boton
            variante="principal"
            icono={<IconoMas tamano={18} />}
            onClick={() => setDialogo({ abierto: true, avistamiento: null })}
          >
            Registrar avistamiento
          </Boton>
        )}
      </PageHeader>

      <PestanasInteligencia pendientes={pendientes} />

      <BarraFiltros
        busqueda={texto}
        onBusquedaChange={setTexto}
        etiquetaBusqueda="Buscar por criminal o lugar"
        filtrosActivos={activos}
        onLimpiar={limpiar}
      >
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
        <CampoSelect
          etiqueta="Verificación"
          opcionVacia="Todas"
          value={filtro.estadoVerificacion ?? ''}
          opciones={opcionesVerificacion()}
          onChange={(e) =>
            filtrar({ estadoVerificacion: (e.target.value || undefined) as EstadoVerificacion })
          }
        />
        <CampoTexto
          etiqueta="Desde"
          type="date"
          value={filtro.desde ?? ''}
          max={filtro.hasta}
          onChange={(e) => filtrar({ desde: e.target.value || undefined })}
          error={rangoInvalido ? 'Debe ser anterior a "hasta".' : undefined}
        />
        <CampoTexto
          etiqueta="Hasta"
          type="date"
          value={filtro.hasta ?? ''}
          min={filtro.desde}
          onChange={(e) => filtrar({ hasta: e.target.value || undefined })}
        />
      </BarraFiltros>

      <TablaDatos
        titulo="Avistamientos registrados"
        filas={avistamientos}
        columnas={columnas}
        claveFila={(a) => a.id}
        cargando={cargando && avistamientos.length === 0}
        actualizando={cargando && avistamientos.length > 0}
        error={error}
        onReintentar={() => void cargar()}
        filaResaltada={resaltado}
        claseFila={(a) =>
          a.estadoVerificacion === 'DESCARTADO' ? 'intel-fila--descartada' : undefined
        }
        vacio={
          hayFiltros ? (
            <EstadoVacio
              icono={<IconoBrujula tamano={28} />}
              titulo="Ningún avistamiento coincide con la búsqueda"
              detalle="Amplía el rango de fechas, cambia de zona o quita algún filtro."
            >
              <Boton variante="fantasma" onClick={limpiar}>
                Limpiar filtros
              </Boton>
            </EstadoVacio>
          ) : (
            <EstadoVacio
              icono={<IconoBrujula tamano={28} />}
              titulo="Aún no hay avistamientos en el archivo"
              detalle="Los avistamientos de todas las bases y los reportes ciudadanos aprobados aparecerán aquí."
            >
              {puedeEscribir && (
                <Boton
                  variante="secundario"
                  onClick={() => setDialogo({ abierto: true, avistamiento: null })}
                >
                  Registrar el primero
                </Boton>
              )}
            </EstadoVacio>
          )
        }
      />

      <Paginacion
        meta={meta}
        sustantivo="avistamientos"
        deshabilitada={cargando}
        onCambiarPagina={(p) => void irAPagina(p)}
      />

      {puedeEscribir && (
        <DialogoAvistamiento
          abierto={dialogo.abierto}
          avistamiento={dialogo.avistamiento}
          onCerrar={() => setDialogo({ abierto: false, avistamiento: null })}
          onGuardado={(a, creado) => {
            setDialogo({ abierto: false, avistamiento: null });
            setResaltado(a.id);
            if (creado) void cargar({ page: 1 });
            else reemplazar(a);
          }}
          onEliminado={() => {
            setDialogo({ abierto: false, avistamiento: null });
            void cargar();
          }}
        />
      )}

      <DialogoConfirmacion
        abierto={decision !== null}
        onCerrar={() => setDecision(null)}
        onConfirmar={decidir}
        peligroso={decision?.estado === 'DESCARTADO'}
        titulo={
          decision?.estado === 'DESCARTADO'
            ? `¿Descartar el avistamiento de ${nombreDecision}?`
            : `¿Verificar el avistamiento de ${nombreDecision}?`
        }
        mensaje={
          decision?.estado === 'DESCARTADO'
            ? `El avistamiento en ${lugarDecision} queda en el archivo como descartado, con el rastro de quién lo registró.`
            : `El avistamiento en ${lugarDecision} pasa a ser inteligencia oficial y ya no se podrá corregir ni eliminar.`
        }
        textoConfirmar={
          decision?.estado === 'DESCARTADO' ? 'Descartar avistamiento' : 'Verificar avistamiento'
        }
        textoConfirmando={decision?.estado === 'DESCARTADO' ? 'Descartando…' : 'Verificando…'}
      />
    </>
  );
}
