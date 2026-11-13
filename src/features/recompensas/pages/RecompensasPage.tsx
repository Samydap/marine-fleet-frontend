import { olvidarCriminal } from '@core/directorio/directorio-criminales';
import { useEffect } from 'react';
import { Permiso } from '@core/session/permiso.enum';
import { EVENTOS } from '@core/sync/eventos';
import { useCambiosSincronizados } from '@core/sync/sincronizacion';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { BarraFiltros } from '@shared/ui/BarraFiltros';
import { BotonEnlace } from '@shared/ui/Boton';
import { CampoSelect } from '@shared/ui/Campo';
import { EstadoVacio } from '@shared/ui/Estados';
import { IconoBrujula, IconoMas } from '@shared/ui/iconos';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { MontoBerries } from '@shared/ui/MontoBerries';
import { CeldaCriminal } from '@shared/ui/CeldaCriminal';
import { PageHeader } from '@shared/ui/PageHeader';
import { Paginacion } from '@shared/ui/Paginacion';
import { TablaDatos, type ColumnaTabla } from '@shared/ui/TablaDatos';
import { formatearSoloFecha } from '@shared/utils/fecha';
import { SeccionesRecompensas } from '../components/SeccionesRecompensas';
import { useRecompensasStore } from '../data-access/recompensas.store';
import {
  esAltoRango,
  etiquetaEstadoRecompensa,
  opcionesEstadoRecompensa,
  tonoEstadoRecompensa,
  type EstadoRecompensa,
  type Recompensa,
} from '../models/recompensa';
import '../recompensas.css';

function vigencia(r: Recompensa): string {
  if (!r.vigenteDesde) return '—';
  const desde = formatearSoloFecha(r.vigenteDesde);
  return r.vigenteHasta ? `${desde} – ${formatearSoloFecha(r.vigenteHasta)}` : `Desde ${desde}`;
}

const COLUMNAS: readonly ColumnaTabla<Recompensa>[] = [
  {
    clave: 'criminal',
    encabezado: 'Criminal',
    principal: true,
    celda: (r) => <CeldaCriminal criminalId={r.criminalId} />,
  },
  {
    clave: 'monto',
    encabezado: 'Monto',
    numerica: true,
    celda: (r) => <MontoBerries valor={r.monto} abreviado altoRango={esAltoRango(r.monto)} />,
  },
  {
    clave: 'estado',
    encabezado: 'Estado',
    celda: (r) => (
      <InsigniaEstado etiqueta={etiquetaEstadoRecompensa(r)} tono={tonoEstadoRecompensa(r)} />
    ),
  },
  {
    clave: 'solicitud',
    encabezado: 'Solicitada',
    celda: (r) => <span className="cifra">{formatearSoloFecha(r.fechaSolicitud)}</span>,
  },
  {
    clave: 'vigencia',
    encabezado: 'Vigencia',
    ocultarEnMovil: true,
    celda: (r) => <span className="cifra">{vigencia(r)}</span>,
  },
  {
    clave: 'motivo',
    ancha: true,
    encabezado: 'Motivo',
    ocultarEnMovil: true,
    celda: (r) =>
      r.motivo ? (
        <span className="recompensa-motivo" title={r.motivo}>
          {r.motivo}
        </span>
      ) : (
        <span className="recompensa-sin-dato">Sin motivo</span>
      ),
  },
];

const OPCIONES_RANGO = [
  { valor: 'true', etiqueta: 'Solo alto rango' },
  { valor: 'false', etiqueta: 'Sin alto rango' },
];

/**
 * RF-1 · Historial de recompensas de todas las bases: quien pidio que monto,
 * en que estado quedo y desde cuando rige.
 */
export function RecompensasPage(): React.ReactElement {
  const { historial, filtro, cargarHistorial } = useRecompensasStore();
  const puedeSolicitar = useHasPermission(Permiso.RECOMPENSAS_SOLICITAR);

  useEffect(() => {
    void cargarHistorial({ page: 1 });
  }, [cargarHistorial]);

  useCambiosSincronizados(
    [EVENTOS.RECOMPENSA_SOLICITADA, EVENTOS.RECOMPENSA_VIGENTE],
    () => void cargarHistorial(),
  );
  // Un criminal renombrado o con foto nueva: se vuelve a pedir la proxima vez.
  useCambiosSincronizados<{ criminalId: string }>(
    [EVENTOS.CRIMINAL_ACTUALIZADO, EVENTOS.CRIMINAL_ESTADO_CAMBIADO],
    (cambio) => olvidarCriminal(cambio.datos.criminalId),
  );

  const activos = [filtro.estado, filtro.requiereValidacion].filter((v) => v !== undefined).length;

  function limpiar(): void {
    void cargarHistorial({ estado: undefined, requiereValidacion: undefined, page: 1 });
  }

  const { recompensas, meta, cargando, error, consultadoEn } = historial;

  return (
    <>
      <PageHeader
        titulo="Recompensas"
        descripcion="Montos en berries fijados por todas las bases, con su estado y vigencia."
        meta={consultadoEn && <ActualizadoHace fecha={consultadoEn} prefijo="Consultado" />}
      >
        {puedeSolicitar && (
          <BotonEnlace
            variante="principal"
            to="/recompensas/solicitar"
            icono={<IconoMas tamano={18} />}
          >
            Solicitar recompensa
          </BotonEnlace>
        )}
      </PageHeader>

      <SeccionesRecompensas />

      <BarraFiltros
        filtrosActivos={activos}
        onLimpiar={limpiar}
        resumen={meta.total > 0 ? `${meta.total.toLocaleString('es-CO')} recompensas` : undefined}
      >
        <CampoSelect
          etiqueta="Estado"
          opcionVacia="Todos"
          value={filtro.estado ?? ''}
          opciones={opcionesEstadoRecompensa()}
          onChange={(e) =>
            void cargarHistorial({
              estado: (e.target.value || undefined) as EstadoRecompensa | undefined,
              page: 1,
            })
          }
        />
        <CampoSelect
          etiqueta="Rango"
          opcionVacia="Todas"
          value={filtro.requiereValidacion === undefined ? '' : String(filtro.requiereValidacion)}
          opciones={OPCIONES_RANGO}
          ayuda="Alto rango: desde 1.000 millones de berries."
          onChange={(e) =>
            void cargarHistorial({
              requiereValidacion: e.target.value === '' ? undefined : e.target.value === 'true',
              page: 1,
            })
          }
        />
      </BarraFiltros>

      <TablaDatos
        titulo="Historial de recompensas"
        filas={recompensas}
        columnas={COLUMNAS}
        claveFila={(r) => r.id}
        cargando={cargando && recompensas.length === 0}
        actualizando={cargando && recompensas.length > 0}
        error={error}
        onReintentar={() => void cargarHistorial()}
        claseFila={(r) =>
          r.estado === 'HISTORICA' || r.estado === 'RECHAZADA'
            ? 'recompensa-fila--cerrada'
            : undefined
        }
        vacio={
          activos > 0 ? (
            <EstadoVacio
              icono={<IconoBrujula tamano={28} />}
              titulo="Ninguna recompensa coincide con los filtros"
              detalle="Cambia el estado o el rango, o limpia los filtros."
            />
          ) : (
            <EstadoVacio
              titulo="Aún no hay recompensas registradas"
              detalle="Cuando una base fije el monto de un criminal, aparecerá aquí."
            >
              {puedeSolicitar && (
                <BotonEnlace variante="secundario" to="/recompensas/solicitar">
                  Solicitar la primera
                </BotonEnlace>
              )}
            </EstadoVacio>
          )
        }
      />

      <Paginacion
        meta={meta}
        sustantivo="recompensas"
        deshabilitada={cargando}
        onCambiarPagina={(p) => void cargarHistorial({ page: p })}
      />
    </>
  );
}
