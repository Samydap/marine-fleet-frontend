import { useCallback, useEffect, useState } from 'react';
import { EVENTOS } from '@core/sync/eventos';
import { useCambiosSincronizados } from '@core/sync/sincronizacion';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { BotonIcono } from '@shared/ui/Boton';
import { CampoTexto } from '@shared/ui/Campo';
import { EstadoError, EstadoVacio, Skeleton } from '@shared/ui/Estados';
import { IconoAnterior, IconoSiguiente } from '@shared/ui/iconos';
import { MontoAnimado } from '@shared/ui/MontoAnimado';
import { MontoBerries } from '@shared/ui/MontoBerries';
import { BotonesExportar, motivoSinExportar } from '@shared/ui/BotonesExportar';
import { PageHeader } from '@shared/ui/PageHeader';
import { TablaDatos, type ColumnaTabla } from '@shared/ui/TablaDatos';
import { formatearMes, formatearSoloFecha } from '@shared/utils/fecha';
import { BarrasPorMar } from '../components/BarrasPorMar';
import { SeccionesRecompensas } from '../components/SeccionesRecompensas';
import { recompensasApi } from '../data-access/recompensas-api';
import {
  desplazarPeriodo,
  esPeriodoValido,
  fechaDePeriodo,
  ordenarPorMar,
  participacion,
  periodoActual,
  type FilaRecompensasPorMar,
  type ReporteRecompensasPorMar,
} from '../models/reporte-mensual';
import '../recompensas.css';

function columnas(total: number): readonly ColumnaTabla<FilaRecompensasPorMar>[] {
  return [
    {
      clave: 'mar',
      encabezado: 'Mar',
      principal: true,
      celda: (f) => <span className="reporte-mar">{f.marNombre}</span>,
    },
    {
      clave: 'criminales',
      encabezado: 'Criminales',
      numerica: true,
      celda: (f) => f.cantidadCriminales.toLocaleString('es-CO'),
    },
    {
      clave: 'total',
      encabezado: 'Total activo',
      numerica: true,
      celda: (f) => <MontoBerries valor={f.totalAcumulado} />,
    },
    {
      clave: 'participacion',
      encabezado: 'Del total',
      numerica: true,
      celda: (f) => `${participacion(f.totalAcumulado, total).toLocaleString('es-CO')} %`,
    },
  ];
}

/**
 * RF-1 · Reporte mensual: total acumulado en recompensas activas por cada uno
 * de los Cuatro Mares y la Grand Line. El mes en curso se calcula al momento;
 * un mes cerrado da lo que valia al cierre.
 */
export function ReporteMensualPage(): React.ReactElement {
  const actual = periodoActual();
  const [periodo, setPeriodo] = useState(actual);
  const [reporte, setReporte] = useState<ReporteRecompensasPorMar | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const cargar = useCallback(async (p: string): Promise<void> => {
    setCargando(true);
    try {
      setReporte(await recompensasApi.reporteMensual(p));
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (esPeriodoValido(periodo)) void cargar(periodo);
  }, [cargar, periodo]);

  // Solo el mes en curso cambia cuando otra base fija o valida una recompensa.
  useCambiosSincronizados([EVENTOS.RECOMPENSA_VIGENTE, EVENTOS.CRIMINAL_ESTADO_CAMBIADO], () => {
    if (periodo === actual) void cargar(periodo);
  });

  const filas = reporte ? ordenarPorMar(reporte.filas) : [];
  const total = reporte?.totalGeneral ?? 0;
  const criminales = filas.reduce((suma, f) => suma + f.cantidadCriminales, 0);
  const esMesEnCurso = periodo === actual;
  const nombreMes = formatearMes(fechaDePeriodo(periodo));
  const sinDatos = reporte !== null && total === 0;

  return (
    <>
      <PageHeader
        titulo="Recompensas activas por mar"
        descripcion="Total acumulado en recompensas activas de cada uno de los Cuatro Mares y la Grand Line."
        meta={reporte && <ActualizadoHace fecha={reporte.generadoEn} prefijo="Generado" />}
      >
        <BotonesExportar
          exportar={(formato) => recompensasApi.exportarReporteMensual(periodo, formato)}
          motivoDeshabilitado={motivoSinExportar({
            error,
            cargado: reporte !== null && !cargando,
            vacio: sinDatos,
          })}
        />
      </PageHeader>
      <SeccionesRecompensas />

      <div className="reporte-periodo">
        <BotonIcono
          etiqueta="Mes anterior"
          icono={<IconoAnterior tamano={18} />}
          onClick={() => setPeriodo(desplazarPeriodo(periodo, -1))}
        />
        <CampoTexto
          etiqueta="Mes del reporte"
          etiquetaOculta
          type="month"
          max={actual}
          value={periodo}
          onChange={(e) => e.target.value && setPeriodo(e.target.value)}
        />
        <BotonIcono
          etiqueta="Mes siguiente"
          icono={<IconoSiguiente tamano={18} />}
          disabled={esMesEnCurso}
          onClick={() => setPeriodo(desplazarPeriodo(periodo, 1))}
        />
      </div>

      {error && !reporte ? (
        <EstadoError
          error={error}
          onReintentar={() => void cargar(periodo)}
          reintentando={cargando}
        />
      ) : !reporte ? (
        <section className="recompensas-panel reporte" aria-busy="true">
          <Skeleton ancho="14rem" alto={40} />
          <Skeleton ancho="20rem" />
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} ancho={`${90 - i * 12}%`} alto={20} />
          ))}
          <span className="sr-only">Cargando el reporte</span>
        </section>
      ) : (
        <>
          <section
            className={`recompensas-panel reporte${cargando ? ' reporte--actualizando' : ''}`}
            aria-labelledby="reporte-titulo"
            aria-busy={cargando || undefined}
          >
            <h2 id="reporte-titulo" className="recompensas-panel-titulo">
              {nombreMes}
            </h2>
            <p className="reporte-total cifra">
              <MontoAnimado valor={total} />
            </p>
            <p className="reporte-subtitulo">
              {criminales.toLocaleString('es-CO')}{' '}
              {criminales === 1 ? 'criminal en búsqueda' : 'criminales en búsqueda'} con recompensa
              activa ·{' '}
              {esMesEnCurso
                ? 'mes en curso: cifras a la fecha, se cierran el último día'
                : `cifras al cierre del ${formatearSoloFecha(reporte.fechaCorte)}`}
            </p>
            {sinDatos ? (
              <EstadoVacio
                variante="en-panel"
                titulo={`No había recompensas activas en ${nombreMes.toLowerCase()}`}
                detalle="Elige otro mes o revisa el historial de recompensas."
              />
            ) : (
              <BarrasPorMar filas={filas} total={total} />
            )}
          </section>

          {!sinDatos && (
            <section className="reporte-detalle ui-hoja" aria-labelledby="reporte-detalle-titulo">
              <h2 id="reporte-detalle-titulo" className="recompensas-subtitulo">
                Detalle por mar
              </h2>
              <TablaDatos
                titulo={`Detalle por mar, ${nombreMes.toLowerCase()}`}
                filas={filas}
                columnas={columnas(total)}
                claveFila={(f) => f.marId}
                actualizando={cargando}
                error={error}
                onReintentar={() => void cargar(periodo)}
              />
            </section>
          )}
        </>
      )}
    </>
  );
}
