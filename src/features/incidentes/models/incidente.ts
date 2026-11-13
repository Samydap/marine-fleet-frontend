import type { PageQuery } from '@core/models/page-result';
import type { OpcionSelect } from '@shared/ui/Campo';
import type { TonoEstado } from '@shared/ui/InsigniaEstado';
import type { EstadoCriminal } from '@shared/utils/criminal';
import es from '../../../assets/i18n/es.json';

/**
 * RF-6. Espejo de IncidenteResponse y de los DTOs de
 * marine-fleet-backend/src/modules/incidentes/presentation.
 */

export type TipoIncidente =
  'ENFRENTAMIENTO' | 'CAPTURA' | 'FUGA' | 'AVISTAMIENTO_HOSTIL' | 'SABOTAJE';
export type ResultadoEnfrentamiento = 'EN_CURSO' | 'EXITO' | 'FRACASO' | 'PARCIAL';
export type ResultadoFinal = Exclude<ResultadoEnfrentamiento, 'EN_CURSO'>;
export type RolEnIncidente = 'OBJETIVO' | 'COMPLICE' | 'TESTIGO';
export type DesenlaceParticipante = 'CAPTURADO' | 'ESCAPO' | 'MUERTO' | 'DESCONOCIDO';

export const TIPOS_INCIDENTE: readonly TipoIncidente[] = [
  'ENFRENTAMIENTO',
  'CAPTURA',
  'FUGA',
  'AVISTAMIENTO_HOSTIL',
  'SABOTAJE',
];
export const RESULTADOS: readonly ResultadoEnfrentamiento[] = [
  'EN_CURSO',
  'EXITO',
  'PARCIAL',
  'FRACASO',
];
export const RESULTADOS_FINALES: readonly ResultadoFinal[] = ['EXITO', 'PARCIAL', 'FRACASO'];
export const ROLES: readonly RolEnIncidente[] = ['OBJETIVO', 'COMPLICE', 'TESTIGO'];
export const DESENLACES: readonly DesenlaceParticipante[] = [
  'DESCONOCIDO',
  'CAPTURADO',
  'ESCAPO',
  'MUERTO',
];

export interface ParticipanteCriminal {
  readonly criminalId: string;
  readonly rolEnIncidente: RolEnIncidente;
  readonly desenlace: DesenlaceParticipante;
  readonly observaciones: string | null;
}

export interface MarinoParticipante {
  readonly nombre: string;
  readonly rango?: string;
  readonly usuarioId?: string;
}

export interface Incidente {
  readonly id: string;
  readonly tipo: TipoIncidente;
  readonly resultado: ResultadoEnfrentamiento;
  readonly cerrado: boolean;
  /** ISO 8601. */
  readonly fechaHora: string;
  readonly ubicacion: string;
  readonly zonaInfluenciaId: string | null;
  readonly baseNavalId: string | null;
  readonly operativoId: string | null;
  readonly descripcion: string;
  readonly observaciones: string | null;
  readonly bajasMarina: number;
  readonly bajasEnemigas: number;
  readonly criminales: readonly ParticipanteCriminal[];
  readonly marinos: readonly MarinoParticipante[];
  readonly registradoPor: string | null;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** FiltrarIncidentesDto: `desde` y `hasta` como ISO completo. */
export interface FiltroIncidentes extends PageQuery {
  criminalId?: string;
  baseNavalId?: string;
  operativoId?: string;
  tipo?: TipoIncidente;
  desde?: string;
  hasta?: string;
}

export interface ParticipanteCriminalPayload {
  criminalId: string;
  rolEnIncidente?: RolEnIncidente;
  desenlace?: DesenlaceParticipante;
  observaciones?: string;
}

export interface MarinoPayload {
  nombre: string;
  rango?: string;
}

/** RegistrarIncidenteDto. */
export interface RegistrarIncidentePayload {
  tipo?: TipoIncidente;
  fechaHora: string;
  ubicacion: string;
  descripcion: string;
  zonaInfluenciaId?: string;
  baseNavalId?: string;
  operativoId?: string;
  resultado?: ResultadoEnfrentamiento;
  observaciones?: string;
  bajasMarina?: number;
  bajasEnemigas?: number;
  criminales: ParticipanteCriminalPayload[];
  marinos?: MarinoPayload[];
}

/** CerrarIncidenteDto. */
export interface CerrarIncidentePayload {
  resultado: ResultadoFinal;
  desenlaces: { criminalId: string; desenlace: DesenlaceParticipante }[];
  observaciones?: string;
  version: number;
}

/** Lo minimo de un criminal para selectores y nombres (sin importar features/criminales). */
export interface CriminalOpcion {
  readonly id: string;
  readonly nombre: string;
  readonly alias: readonly string[];
  readonly estado: EstadoCriminal;
}

/** Lo minimo de un operativo (sin importar features/operativos). */
export interface OperativoOpcion {
  readonly id: string;
  readonly codigo: string;
  readonly nombre: string;
  readonly estado: string;
  readonly objetivoCriminalId: string | null;
}

export const LIMITES_INCIDENTE = {
  ubicacionMin: 3,
  ubicacionMax: 500,
  descripcionMin: 3,
  descripcionMax: 4000,
  observaciones: 4000,
  observacionesParticipante: 2000,
  marinoNombreMin: 2,
  marinoNombreMax: 150,
  marinoRango: 60,
  criminalesMax: 100,
  marinosMax: 200,
} as const;

// --- Vocabulario --------------------------------------------------------------

export function etiquetaTipo(tipo: TipoIncidente): string {
  return es.incidentes.tipo[tipo] ?? tipo;
}

export function etiquetaResultado(resultado: ResultadoEnfrentamiento): string {
  return es.incidentes.resultado[resultado] ?? resultado;
}

export function tonoResultado(resultado: ResultadoEnfrentamiento): TonoEstado {
  switch (resultado) {
    case 'EXITO':
      return 'exito';
    case 'FRACASO':
      return 'peligro';
    default:
      // En curso y parcial: lo que sigue abierto o quedo a medias (aviso).
      return 'aviso';
  }
}

export function etiquetaRol(rol: RolEnIncidente): string {
  return es.incidentes.rol[rol] ?? rol;
}

export function etiquetaDesenlace(desenlace: DesenlaceParticipante): string {
  return es.incidentes.desenlace[desenlace] ?? desenlace;
}

export function tonoDesenlace(desenlace: DesenlaceParticipante): TonoEstado {
  switch (desenlace) {
    case 'CAPTURADO':
      return 'exito';
    case 'MUERTO':
      return 'neutro';
    case 'ESCAPO':
      return 'peligro';
    default:
      return 'info';
  }
}

const opciones = <T extends string>(
  valores: readonly T[],
  etiqueta: (v: T) => string,
): OpcionSelect[] => valores.map((v) => ({ valor: v, etiqueta: etiqueta(v) }));

export const opcionesTipo = (): OpcionSelect[] => opciones(TIPOS_INCIDENTE, etiquetaTipo);
export const opcionesResultado = (): OpcionSelect[] => opciones(RESULTADOS, etiquetaResultado);
export const opcionesResultadoFinal = (): OpcionSelect[] =>
  opciones(RESULTADOS_FINALES, etiquetaResultado);
export const opcionesRol = (): OpcionSelect[] => opciones(ROLES, etiquetaRol);
export const opcionesDesenlace = (): OpcionSelect[] => opciones(DESENLACES, etiquetaDesenlace);

/** Desenlaces que el modulo de Criminales convierte en baja (capturado o muerto). */
export function cambiaEstadoCriminal(desenlace: DesenlaceParticipante): boolean {
  return desenlace === 'CAPTURADO' || desenlace === 'MUERTO';
}

/** "Monkey D. Luffy y Roronoa Zoro", "Luffy, Zoro y 3 más". */
export function resumirNombres(nombres: readonly string[], maximo = 2): string {
  if (nombres.length === 0) return 'Sin criminales';
  if (nombres.length <= maximo) {
    return nombres.length === 1
      ? nombres[0]
      : `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}`;
  }
  return `${nombres.slice(0, maximo).join(', ')} y ${nombres.length - maximo} más`;
}

/** Fecha de un <input type="date"> -> ISO del inicio o del final de ese dia (hora local). */
export function limiteDelDia(fecha: string, extremo: 'inicio' | 'fin'): string | undefined {
  if (!fecha) return undefined;
  const d = new Date(`${fecha}T${extremo === 'inicio' ? '00:00:00' : '23:59:59.999'}`);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

// --- Formulario de registro ---------------------------------------------------

export interface FilaCriminal {
  clave: string;
  criminalId: string;
  rolEnIncidente: RolEnIncidente;
  desenlace: DesenlaceParticipante;
}

export interface FilaMarino {
  clave: string;
  nombre: string;
  rango: string;
}

export interface FormularioIncidente {
  tipo: TipoIncidente;
  /** Valor de datetime-local. */
  fechaHora: string;
  ubicacion: string;
  descripcion: string;
  zonaInfluenciaId: string;
  baseNavalId: string;
  operativoId: string;
  resultado: ResultadoEnfrentamiento;
  observaciones: string;
  bajasMarina: string;
  bajasEnemigas: string;
  criminales: FilaCriminal[];
  marinos: FilaMarino[];
}

export type ErroresIncidente = Partial<Record<string, string>>;

const esEnteroNoNegativo = (v: string): boolean => v === '' || /^\d+$/.test(v.trim());

export function validarIncidente(
  f: FormularioIncidente,
  ahora: Date = new Date(),
): ErroresIncidente {
  const e: ErroresIncidente = {};
  const fecha = new Date(f.fechaHora);
  if (!f.fechaHora || Number.isNaN(fecha.getTime())) {
    e.fechaHora = 'Indica la fecha y la hora del enfrentamiento.';
  } else if (fecha.getTime() > ahora.getTime() + 60_000) {
    e.fechaHora = 'La fecha no puede estar en el futuro.';
  }
  if (f.ubicacion.trim().length < LIMITES_INCIDENTE.ubicacionMin) {
    e.ubicacion = 'Indica dónde ocurrió (al menos 3 caracteres).';
  }
  if (f.descripcion.trim().length < LIMITES_INCIDENTE.descripcionMin) {
    e.descripcion = 'Describe qué ocurrió.';
  }

  if (f.criminales.length === 0) {
    e.criminales = 'Agrega al menos un criminal involucrado.';
  }
  const vistos = new Set<string>();
  f.criminales.forEach((c, i) => {
    if (!c.criminalId) {
      e[`criminal-${i}`] = 'Elige al criminal o quita la fila.';
    } else if (vistos.has(c.criminalId)) {
      e[`criminal-${i}`] = 'Este criminal ya está en la lista.';
    }
    vistos.add(c.criminalId);
  });

  f.marinos.forEach((m, i) => {
    if (m.nombre.trim().length < LIMITES_INCIDENTE.marinoNombreMin) {
      e[`marino-${i}`] = 'Escribe el nombre del marino o quita la fila.';
    }
  });

  if (!esEnteroNoNegativo(f.bajasMarina)) e.bajasMarina = 'Debe ser un número entero, 0 o más.';
  if (!esEnteroNoNegativo(f.bajasEnemigas)) e.bajasEnemigas = 'Debe ser un número entero, 0 o más.';
  return e;
}

const opcional = (v: string): string | undefined => v.trim() || undefined;
const entero = (v: string): number | undefined => (v.trim() === '' ? undefined : Number(v));

/** Formulario -> RegistrarIncidenteDto (fecha a ISO, vacios fuera). */
export function aPayloadIncidente(f: FormularioIncidente): RegistrarIncidentePayload {
  const fecha = new Date(f.fechaHora);
  const final = f.resultado !== 'EN_CURSO';
  return {
    tipo: f.tipo,
    fechaHora: Number.isNaN(fecha.getTime()) ? f.fechaHora : fecha.toISOString(),
    ubicacion: f.ubicacion.trim(),
    descripcion: f.descripcion.trim(),
    zonaInfluenciaId: opcional(f.zonaInfluenciaId),
    baseNavalId: opcional(f.baseNavalId),
    operativoId: opcional(f.operativoId),
    resultado: f.resultado,
    observaciones: opcional(f.observaciones),
    bajasMarina: entero(f.bajasMarina),
    bajasEnemigas: entero(f.bajasEnemigas),
    criminales: f.criminales.map((c) => ({
      criminalId: c.criminalId,
      rolEnIncidente: c.rolEnIncidente,
      // Mientras siga en curso, el desenlace aun no se conoce.
      desenlace: final ? c.desenlace : 'DESCONOCIDO',
    })),
    marinos: f.marinos.length
      ? f.marinos.map((m) => ({ nombre: m.nombre.trim(), rango: opcional(m.rango) }))
      : undefined,
  };
}
