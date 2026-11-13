import type { PageQuery } from '@core/models/page-result';
import type { OpcionSelect } from '@shared/ui/Campo';
import type { TonoEstado } from '@shared/ui/InsigniaEstado';
import es from '../../../assets/i18n/es.json';

/**
 * RF-3. Espejo de ReporteCiudadanoResponse, CrearReporteCiudadanoDto,
 * FiltrarReportesDto y RevisarReporteDto del backend.
 */

export type EstadoReporte = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

export const ESTADOS_REPORTE: readonly EstadoReporte[] = ['PENDIENTE', 'APROBADO', 'RECHAZADO'];

export interface Informante {
  readonly nombre: string | null;
  readonly contacto: string | null;
  readonly anonimo: boolean;
}

export interface ReporteCiudadano {
  readonly id: string;
  readonly criminalId: string;
  readonly descripcion: string;
  readonly fechaHecho: string | null;
  readonly ubicacion: string;
  readonly zonaInfluenciaId: string | null;
  readonly informante: Informante;
  readonly estado: EstadoReporte;
  readonly revisadoPor: string | null;
  readonly fechaRevision: string | null;
  readonly motivoRechazo: string | null;
  readonly avistamientoId: string | null;
  readonly createdAt: string;
}

export interface FiltroReportes extends PageQuery {
  estado?: EstadoReporte;
  criminalId?: string;
  zonaInfluenciaId?: string;
}

export interface RevisionReporte {
  decision: 'APROBADO' | 'RECHAZADO';
  /** Obligatorio si la decision es RECHAZADO. */
  motivoRechazo?: string;
}

export type ReporteRevisado = ReporteCiudadano & { readonly avistamientoCreadoId: string | null };

/** Entrada publica (sin sesion). Si `anonimo`, el backend descarta nombre y contacto. */
export interface NuevoReporteCiudadano {
  criminalId: string;
  descripcion: string;
  ubicacion: string;
  fechaHecho?: string;
  zonaInfluenciaId?: string;
  nombre?: string;
  contacto?: string;
  anonimo: boolean;
}

/** Lo unico que el backend devuelve al ciudadano. */
export interface ReporteRecibido {
  readonly id: string;
  readonly estado: EstadoReporte;
  readonly mensaje: string;
}

/** Limites del DTO publico (CrearReporteCiudadanoDto). */
export const LIMITES_REPORTE = {
  criminalId: 36,
  descripcionMin: 10,
  descripcionMax: 2000,
  ubicacionMin: 3,
  ubicacionMax: 500,
  nombre: 100,
  contacto: 150,
  motivoRechazo: 1000,
} as const;

export function etiquetaEstadoReporte(estado: EstadoReporte): string {
  return es.inteligencia.estadoReporte[estado] ?? estado;
}

export function tonoEstadoReporte(estado: EstadoReporte): TonoEstado {
  if (estado === 'APROBADO') return 'exito';
  if (estado === 'RECHAZADO') return 'peligro';
  return 'info';
}

export function opcionesEstadoReporte(): OpcionSelect[] {
  return ESTADOS_REPORTE.map((e) => ({ valor: e, etiqueta: etiquetaEstadoReporte(e) }));
}

/** Como se nombra al informante en la bandeja. */
export function nombreInformante(informante: Informante): string {
  if (informante.anonimo) return 'Informante anónimo';
  return informante.nombre?.trim() || 'Ciudadano sin nombre';
}

export type ErroresReporte = Partial<Record<'criminalId' | 'descripcion' | 'ubicacion', string>>;

/** Validacion del formulario publico: los mismos limites que el DTO, con mensajes claros. */
export function validarReporte(r: NuevoReporteCiudadano): ErroresReporte {
  const errores: ErroresReporte = {};
  const criminal = r.criminalId.trim();
  if (!criminal) {
    errores.criminalId = 'Indica el código del criminal que viste.';
  } else if (criminal.length > LIMITES_REPORTE.criminalId) {
    errores.criminalId = 'Ese código no es válido: revisa que esté completo y sin espacios.';
  }
  const descripcion = r.descripcion.trim();
  if (descripcion.length < LIMITES_REPORTE.descripcionMin) {
    errores.descripcion = `Cuéntanos un poco más: al menos ${LIMITES_REPORTE.descripcionMin} caracteres.`;
  }
  if (r.ubicacion.trim().length < LIMITES_REPORTE.ubicacionMin) {
    errores.ubicacion = 'Indica dónde lo viste (isla, puerto, barrio o lugar).';
  }
  return errores;
}

/**
 * Espejo de BuscadoPublicoResponse (criminales/presentation/buscados.controller.ts):
 * solo lo que ya es publico en un cartel WANTED, y solo de criminales activos.
 */
export interface BuscadoPublico {
  readonly id: string;
  readonly nombre: string;
  readonly alias: readonly string[];
  readonly fotoUrl: string | null;
  readonly recompensaVigenteMonto: number | null;
  readonly nivelAmenaza: string;
  readonly organizacion: string | null;
}

/** GET /buscados exige al menos 2 letras en `q`. */
export const MIN_BUSQUEDA_PUBLICA = 2;
