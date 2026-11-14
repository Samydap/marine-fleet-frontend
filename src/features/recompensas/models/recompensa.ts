import type { CriminalBreve } from '@core/directorio/directorio-criminales';
import type { NivelAmenaza } from '@shared/utils/nivel-amenaza';
import type { TonoEstado } from '@shared/ui/InsigniaEstado';
import es from '../../../assets/i18n/es.json';

/** Espejo de EstadoRecompensa (recompensas/domain/estado-recompensa.enum.ts). */
export type EstadoRecompensa = 'PENDIENTE_VALIDACION' | 'VIGENTE' | 'HISTORICA' | 'RECHAZADA';

/**
 * Espejo de UMBRAL_VALIDACION_ALMIRANTE (recompensas/domain/politica-validacion.ts).
 * Desde este monto la recompensa queda pendiente hasta la firma de un Almirante.
 * El backend decide; aqui solo se anticipa para avisar en el formulario.
 */
export const UMBRAL_ALTO_RANGO = 1_000_000_000;

/** Tope de SolicitarRecompensaDto.monto. */
export const MONTO_MAXIMO = 9_999_999_999_999;

/** Largo de SolicitarRecompensaDto.motivo y ValidarRecompensaDto.motivo. */
export const MOTIVO_MAXIMO = 1000;
export const MOTIVO_MINIMO = 3;

/** Espejo de RecompensaResponse (recompensas/presentation/mappers/recompensa.mapper.ts). */
export interface Recompensa {
  readonly id: string;
  readonly criminalId: string;
  /** Nombre resuelto por el backend (@ConNombres); `null` si el id ya no existe. */
  readonly criminalNombre?: string | null;
  readonly criminalFotoUrl?: string | null;
  readonly solicitadaPorNombre?: string | null;
  readonly validadaPorNombre?: string | null;
  readonly monto: number;
  readonly moneda: string;
  readonly estado: EstadoRecompensa;
  readonly requiereValidacion: boolean;
  readonly solicitadaPor: string | null;
  readonly fechaSolicitud: string;
  readonly validadaPor: string | null;
  readonly fechaValidacion: string | null;
  readonly vigenteDesde: string | null;
  readonly vigenteHasta: string | null;
  readonly motivo: string | null;
}

/** Espejo de FiltrarRecompensasDto. */
export interface FiltroRecompensas {
  page: number;
  limit: number;
  criminalId?: string;
  estado?: EstadoRecompensa;
  requiereValidacion?: boolean;
}

/** Cuerpo de POST /recompensas (SolicitarRecompensaDto). */
export interface SolicitudRecompensa {
  readonly criminalId: string;
  readonly monto: number;
  readonly motivo?: string;
}

/** Cuerpo de PATCH /recompensas/:id/validacion (ValidarRecompensaDto). */
export interface DecisionValidacion {
  readonly aprobar: boolean;
  readonly motivo?: string;
}

/**
 * Lo que esta feature necesita de un criminal (subconjunto de
 * CriminalResponse de GET /criminales y GET /criminales/:id). Se tipa aqui y
 * no se importa de la feature criminales: las features no se conocen.
 */
/** El criminal tal como lo trae el directorio compartido (GET /criminales/:id). */
export type CriminalResumen = CriminalBreve;

const ETIQUETA_ESTADO: Readonly<Record<EstadoRecompensa, string>> = es.recompensas.estado;

export function etiquetaEstadoRecompensa(r: Pick<Recompensa, 'estado' | 'validadaPor'>): string {
  if (r.estado === 'VIGENTE' && r.validadaPor) return es.recompensas.vigenteValidada;
  return ETIQUETA_ESTADO[r.estado];
}

/**
 * Tono de la insignia. El dorado (autoridad) es solo para la vigente que firmo
 * un Almirante: la regla del galon de DISENO.md.
 */
export function tonoEstadoRecompensa(r: Pick<Recompensa, 'estado' | 'validadaPor'>): TonoEstado {
  switch (r.estado) {
    case 'VIGENTE':
      return r.validadaPor ? 'autoridad' : 'exito';
    case 'PENDIENTE_VALIDACION':
      return 'aviso';
    case 'RECHAZADA':
      return 'peligro';
    default:
      return 'neutro';
  }
}

export function opcionesEstadoRecompensa(): { valor: EstadoRecompensa; etiqueta: string }[] {
  return (Object.keys(ETIQUETA_ESTADO) as EstadoRecompensa[]).map((valor) => ({
    valor,
    etiqueta: ETIQUETA_ESTADO[valor],
  }));
}

export function esAltoRango(monto: number | null | undefined): boolean {
  return typeof monto === 'number' && monto >= UMBRAL_ALTO_RANGO;
}

import { leerMonto } from '@shared/utils/berries';

export { leerMonto };

export interface ErroresSolicitud {
  criminal?: string;
  monto?: string;
  motivo?: string;
}

/** Reglas de SolicitarRecompensaDto, para avisar antes de enviar. */
export function validarSolicitud(datos: {
  readonly criminal: Pick<CriminalResumen, 'estado' | 'recompensaVigenteMonto'> | null;
  readonly montoTexto: string;
  readonly motivo: string;
}): ErroresSolicitud {
  const errores: ErroresSolicitud = {};

  if (!datos.criminal) {
    errores.criminal = 'Elige el criminal al que se le fija la recompensa.';
  } else if (datos.criminal.estado !== 'ACTIVO') {
    errores.criminal = 'Solo un criminal en búsqueda puede recibir una recompensa nueva.';
  }

  const monto = leerMonto(datos.montoTexto);
  if (datos.montoTexto.trim() === '') {
    errores.monto = 'Escribe el monto en berries.';
  } else if (monto === null) {
    errores.monto = 'Escribe solo cifras, sin decimales.';
  } else if (monto < 1) {
    errores.monto = 'El monto debe ser de al menos 1 berry.';
  } else if (monto > MONTO_MAXIMO) {
    errores.monto = 'El monto supera el máximo que admite el sistema.';
  } else if (datos.criminal && datos.criminal.recompensaVigenteMonto === monto) {
    errores.monto = 'Es el mismo monto que ya está vigente.';
  }

  const motivo = datos.motivo.trim();
  if (motivo.length > 0 && motivo.length < MOTIVO_MINIMO) {
    errores.motivo = `El motivo debe tener al menos ${MOTIVO_MINIMO} caracteres.`;
  } else if (motivo.length > MOTIVO_MAXIMO) {
    errores.motivo = `El motivo no puede pasar de ${MOTIVO_MAXIMO} caracteres.`;
  }

  return errores;
}

/** Diferencia entre el monto pedido y el vigente: "+ 500 M ฿" o null si no habia. */
export function diferenciaMonto(nuevo: number, vigente: number | null): number | null {
  if (vigente === null || vigente === undefined) return null;
  return nuevo - vigente;
}

/** Lo que se lee de GET /amenaza/criterios para estimar el nivel (CriterioResponse). */
export interface RangoAmenaza {
  readonly nivel: Exclude<NivelAmenaza, 'PENDIENTE'>;
  readonly montoMinimo: number;
  readonly montoMaximo: number | null;
}

/**
 * Nivel que le daria el monto segun los criterios vigentes (clasificarAmenaza
 * del backend, sin la escalada por zona). Solo orienta: el backend clasifica.
 */
export function nivelEstimado(
  monto: number | null,
  rangos: readonly RangoAmenaza[],
): NivelAmenaza | null {
  if (monto === null || monto <= 0) return 'PENDIENTE';
  if (rangos.length === 0) return null;
  const coincide = rangos.find(
    (r) => monto >= r.montoMinimo && (r.montoMaximo === null || monto <= r.montoMaximo),
  );
  if (coincide) return coincide.nivel;
  const orden: Record<RangoAmenaza['nivel'], number> = { BAJO: 1, MEDIO: 2, ALTO: 3 };
  return [...rangos].sort((a, b) => orden[b.nivel] - orden[a.nivel])[0].nivel;
}
