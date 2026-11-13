/**
 * Espejo de shared/domain/events del backend (domain-event.ts y
 * eventos.contracts.ts). Son los nombres que llegan por el canal de
 * sincronizacion (`event:` del SSE y `evento` de GET /sincronizacion/cambios).
 *
 * Si el backend agrega un evento, se agrega aqui: el canal solo escucha los
 * nombres que conoce (EventSource exige un listener por nombre).
 */
export const EVENTOS = {
  CRIMINAL_REGISTRADO: 'criminal.registrado',
  CRIMINAL_ACTUALIZADO: 'criminal.actualizado',
  CRIMINAL_ESTADO_CAMBIADO: 'criminal.estado-cambiado',
  RECOMPENSA_SOLICITADA: 'recompensa.solicitada',
  RECOMPENSA_VIGENTE: 'recompensa.vigente',
  AMENAZA_RECLASIFICADA: 'amenaza.reclasificada',
  CRITERIOS_AMENAZA_ACTUALIZADOS: 'amenaza.criterios-actualizados',
  CARTEL_GENERADO: 'cartel.generado',
  AVISTAMIENTO_REGISTRADO: 'avistamiento.registrado',
  REPORTE_RECIBIDO: 'reporte.recibido',
  REPORTE_APROBADO: 'reporte.aprobado',
  OPERATIVO_ACTUALIZADO: 'operativo.actualizado',
  INCIDENTE_REGISTRADO: 'incidente.registrado',
  INCIDENTE_CERRADO: 'incidente.cerrado',
} as const;

export type NombreEvento = (typeof EVENTOS)[keyof typeof EVENTOS];

export const NOMBRES_EVENTO: readonly NombreEvento[] = Object.values(EVENTOS);

/** Un hecho del sistema tal como llega a las bases conectadas (CambioSincronizado). */
export interface CambioSincronizado<D = unknown> {
  /** Consecutivo del servidor: sirve para reanudar sin perder cambios. */
  readonly id: number;
  readonly evento: NombreEvento;
  readonly datos: D;
  /** ISO 8601. */
  readonly fecha: string;
}

// --- Payloads (eventos.contracts.ts) ---------------------------------------

export type MotivoCambioCriminal = 'DATOS' | 'FOTO' | 'RECOMPENSA' | 'AFILIACION' | 'ZONA';

export interface CriminalActualizadoDatos {
  readonly criminalId: string;
  readonly usuarioId: string | null;
  readonly motivos: readonly MotivoCambioCriminal[];
}

export interface CriminalEstadoCambiadoDatos {
  readonly criminalId: string;
  readonly estadoAnterior: string;
  readonly estadoNuevo: string;
  readonly usuarioId: string | null;
}

export interface RecompensaSolicitadaDatos {
  readonly recompensaId: string;
  readonly criminalId: string;
  readonly monto: number;
  readonly requiereValidacion: boolean;
  readonly usuarioId: string | null;
}

export interface CartelGeneradoDatos {
  readonly cartelId: string;
  readonly criminalId: string;
  readonly numeroVersion: number;
  readonly motivo: string;
}

export type CambioOperativo =
  'CREADO' | 'ESTADO' | 'PRIORIDAD' | 'BASES' | 'RESPONSABLES' | 'CERRADO';

export interface OperativoActualizadoDatos {
  readonly operativoId: string;
  readonly codigo: string;
  readonly cambio: CambioOperativo;
  readonly estado: string;
  readonly prioridad: string;
  /** Bases que deben enterarse (lider y participantes). */
  readonly basesIds: readonly string[];
  readonly usuarioId: string | null;
}

export interface IncidenteRegistradoDatos {
  readonly incidenteId: string;
  readonly operativoId: string | null;
  readonly baseNavalId: string | null;
  readonly criminalesIds: readonly string[];
}

/** Espejo de IncidenteCerradoEvent (shared/domain/events/eventos.contracts.ts). */
export interface DesenlaceCriminalDatos {
  readonly criminalId: string;
  /** CAPTURADO | ESCAPO | MUERTO | DESCONOCIDO */
  readonly desenlace: string;
}

export interface IncidenteCerradoDatos {
  readonly incidenteId: string;
  readonly operativoId: string | null;
  readonly resultado: string;
  /** Lo que paso con cada criminal: Criminales lo usa para darlos de baja. */
  readonly desenlaces: readonly DesenlaceCriminalDatos[];
  readonly usuarioId: string | null;
}

export interface AvistamientoRegistradoDatos {
  readonly avistamientoId: string;
  readonly criminalId: string;
  readonly zonaInfluenciaId: string | null;
  readonly usuarioId: string | null;
}
