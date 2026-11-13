import type { PageQuery } from '@core/models/page-result';
import type { OpcionSelect } from '@shared/ui/Campo';
import type { TonoEstado } from '@shared/ui/InsigniaEstado';
import type { EstadoCriminal } from '@shared/utils/criminal';
import es from '../../../assets/i18n/es.json';

/**
 * RF-3. Espejo de AvistamientoResponse y de los DTOs de
 * marine-fleet-backend/src/modules/inteligencia/presentation.
 */

export type EstadoVerificacion = 'PENDIENTE' | 'VERIFICADO' | 'DESCARTADO';
export type OrigenAvistamiento = 'OFICIAL' | 'REPORTE_CIUDADANO';

export const ESTADOS_VERIFICACION: readonly EstadoVerificacion[] = [
  'PENDIENTE',
  'VERIFICADO',
  'DESCARTADO',
];

export interface Avistamiento {
  readonly id: string;
  readonly criminalId: string;
  readonly criminalNombre: string;
  /** ISO 8601. */
  readonly fechaHora: string;
  readonly ubicacion: string;
  readonly testigo: string | null;
  readonly zonaInfluenciaId: string | null;
  readonly estadoVerificacion: EstadoVerificacion;
  readonly origen: OrigenAvistamiento;
  readonly observaciones: string | null;
  readonly registradoPor: string | null;
  readonly verificadoPor: string | null;
  readonly createdAt: string;
}

/** AvistamientoDto: lo mismo sirve para registrar (POST) y corregir (PUT). */
export interface AvistamientoPayload {
  criminalId: string;
  /** Formato del <input type="datetime-local">: YYYY-MM-DDTHH:mm */
  fechaHora: string;
  ubicacion: string;
  testigo?: string;
  zonaInfluenciaId?: string;
  observaciones?: string;
}

/** FiltrarAvistamientosDto. `desde` y `hasta` en AAAA-MM-DD (hasta incluye todo el dia). */
export interface FiltroAvistamientos extends PageQuery {
  criminalId?: string;
  zonaInfluenciaId?: string;
  estadoVerificacion?: EstadoVerificacion;
  desde?: string;
  hasta?: string;
}

/**
 * Lo minimo que esta feature necesita de un criminal (selector y nombres).
 * Se declara aqui: importar el modelo de features/criminales esta prohibido.
 */
export interface CriminalOpcion {
  readonly id: string;
  readonly nombre: string;
  readonly alias: readonly string[];
  readonly estado: EstadoCriminal;
}

// --- Vocabulario --------------------------------------------------------------

export function etiquetaVerificacion(estado: EstadoVerificacion): string {
  return es.inteligencia.estadoVerificacion[estado] ?? estado;
}

export function tonoVerificacion(estado: EstadoVerificacion): TonoEstado {
  if (estado === 'VERIFICADO') return 'exito';
  if (estado === 'DESCARTADO') return 'peligro';
  return 'info';
}

export function etiquetaOrigen(origen: OrigenAvistamiento): string {
  return es.inteligencia.origen[origen] ?? origen;
}

export function opcionesVerificacion(): OpcionSelect[] {
  return ESTADOS_VERIFICACION.map((e) => ({ valor: e, etiqueta: etiquetaVerificacion(e) }));
}

/** Un verificado es inteligencia oficial: el backend ya no deja corregirlo ni borrarlo. */
export function esModificable(a: Pick<Avistamiento, 'estadoVerificacion'>): boolean {
  return a.estadoVerificacion !== 'VERIFICADO';
}

/** "2026-11-10T19:30:00.000Z" -> valor de datetime-local en la hora del navegador. */
export function aValorFechaHora(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso.slice(0, 16);
  return new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

/** Etiqueta de un criminal en un selector: nombre y, si lo tiene, su primer alias. */
export function etiquetaCriminal(c: CriminalOpcion): string {
  return c.alias.length > 0 ? `${c.nombre} «${c.alias[0]}»` : c.nombre;
}

/**
 * Valor de datetime-local (hora del navegador) -> ISO con zona. El backend
 * interpreta "YYYY-MM-DDTHH:mm" sin zona como hora de Colombia; enviando ISO
 * la hora registrada es la que vio el oficial, este donde este su base.
 */
export function aIsoDesdeLocal(valor: string): string {
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? valor : fecha.toISOString();
}

// --- Validacion del formulario (mismos limites que AvistamientoDto) --------------

export const LIMITES_AVISTAMIENTO = {
  ubicacionMin: 3,
  ubicacionMax: 500,
  testigo: 150,
  observaciones: 2000,
} as const;

export type ErroresAvistamiento = Partial<Record<'criminalId' | 'fechaHora' | 'ubicacion', string>>;

export function validarAvistamiento(
  p: AvistamientoPayload,
  ahora: Date = new Date(),
): ErroresAvistamiento {
  const errores: ErroresAvistamiento = {};
  if (!p.criminalId) errores.criminalId = 'Elige al criminal que fue avistado.';

  const fecha = new Date(p.fechaHora);
  if (!p.fechaHora || Number.isNaN(fecha.getTime())) {
    errores.fechaHora = 'Indica la fecha y la hora del avistamiento.';
  } else if (fecha.getTime() > ahora.getTime() + 60_000) {
    errores.fechaHora = 'La fecha no puede estar en el futuro.';
  }

  if (p.ubicacion.trim().length < LIMITES_AVISTAMIENTO.ubicacionMin) {
    errores.ubicacion = 'Indica el lugar: isla, puerto o coordenadas (al menos 3 caracteres).';
  }
  return errores;
}
