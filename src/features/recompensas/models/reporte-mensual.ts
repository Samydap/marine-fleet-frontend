import { ordenarMares } from '@core/catalogos/catalogos';

/** Espejo de FilaRecompensasPorMar (reportes/domain/reportes.types.ts). */
export interface FilaRecompensasPorMar {
  readonly marId: string;
  readonly marNombre: string;
  /** CUATRO_MARES | GRAND_LINE */
  readonly tipoMar: string;
  readonly totalAcumulado: number;
  readonly cantidadCriminales: number;
}

/** Espejo de ReporteRecompensasPorMar (GET /reportes/recompensas-por-mar). */
export interface ReporteRecompensasPorMar {
  /** YYYY-MM */
  readonly periodo: string;
  /** Instante al que corresponden los montos: fin de mes, o ahora si es el mes en curso. */
  readonly fechaCorte: string;
  readonly filas: readonly FilaRecompensasPorMar[];
  readonly totalGeneral: number;
  readonly generadoEn: string;
}

export type FormatoExportacion = 'pdf' | 'csv';

/** Filas en el orden East, West, North, South Blue y Grand Line (ordenarMares de core). */
export function ordenarPorMar(filas: readonly FilaRecompensasPorMar[]): FilaRecompensasPorMar[] {
  const porId = new Map(filas.map((f) => [f.marId, f]));
  return ordenarMares(filas.map((f) => ({ id: f.marId, nombre: f.marNombre }))).map(
    (m) => porId.get(m.id) as FilaRecompensasPorMar,
  );
}

/** Participacion de una fila en el total, de 0 a 100 con un decimal. */
export function participacion(valor: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((valor / total) * 1000) / 10;
}

/** YYYY-MM del mes en curso, en hora local. */
export function periodoActual(ahora: Date = new Date()): string {
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}`;
}

/** "2026-11" -> Date del primer dia, para formatearMes. */
export function fechaDePeriodo(periodo: string): Date {
  const [anio, mes] = periodo.split('-').map(Number);
  return new Date(anio, (mes ?? 1) - 1, 1);
}

/** Mes anterior o siguiente de un periodo YYYY-MM. */
export function desplazarPeriodo(periodo: string, meses: number): string {
  const fecha = fechaDePeriodo(periodo);
  fecha.setMonth(fecha.getMonth() + meses);
  return periodoActual(fecha);
}

export function esPeriodoValido(periodo: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(periodo);
}
