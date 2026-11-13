import es from '../../../assets/i18n/es.json';
import type { TonoEstado } from '@shared/ui/InsigniaEstado';
import type { EstadoCriminal } from '@shared/utils/criminal';
import type { NivelAmenaza } from '@shared/utils/nivel-amenaza';

/**
 * Espejo del contrato de operativos (backend: modules/operativos/presentation).
 * Las fechas llegan como ISO 8601.
 *
 * El documento de requerimientos habla de planeado, en curso, completado y
 * abortado; el backend los llama PLANIFICADO, EN_CURSO, CERRADO y ABORTADO.
 */
export type EstadoOperativo = 'PLANIFICADO' | 'EN_CURSO' | 'CERRADO' | 'ABORTADO';
export type PrioridadOperativo = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
export type ResultadoOperativo = 'EXITOSO' | 'PARCIAL' | 'FALLIDO';
export type RolParticipacion = 'LIDER' | 'APOYO' | 'LOGISTICA' | 'BLOQUEO';

export const ESTADOS_OPERATIVO: readonly EstadoOperativo[] = [
  'EN_CURSO',
  'PLANIFICADO',
  'CERRADO',
  'ABORTADO',
];
export const PRIORIDADES: readonly PrioridadOperativo[] = ['CRITICA', 'ALTA', 'MEDIA', 'BAJA'];
export const RESULTADOS: readonly ResultadoOperativo[] = ['EXITOSO', 'PARCIAL', 'FALLIDO'];
/** LIDER no se asigna: es fijo de la base lider (ROL_LIDER_RESERVADO). */
export const ROLES_ASIGNABLES: readonly RolParticipacion[] = ['APOYO', 'LOGISTICA', 'BLOQUEO'];

/** ParticipacionResponse. */
export interface ParticipacionBase {
  readonly baseNavalId: string;
  readonly rolParticipacion: RolParticipacion;
  readonly unidadesAsignadas: number;
  readonly recursos: string | null;
  readonly confirmada: boolean;
  readonly observaciones: string | null;
}

export interface ResponsableOperativo {
  readonly usuarioId: string;
  readonly funcion: string;
}

/** OperativoResponse. */
export interface Operativo {
  readonly id: string;
  readonly codigo: string;
  readonly nombre: string;
  readonly objetivoCriminalId: string | null;
  readonly objetivo: string | null;
  readonly descripcion: string | null;
  readonly zonaInfluenciaId: string;
  readonly baseLiderId: string;
  readonly estado: EstadoOperativo;
  readonly prioridad: PrioridadOperativo;
  readonly fechaInicioPlaneada: string | null;
  readonly fechaInicioReal: string | null;
  readonly fechaCierre: string | null;
  readonly resultadoFinal: ResultadoOperativo | null;
  readonly observacionesCierre: string | null;
  readonly bases: readonly ParticipacionBase[];
  readonly responsables: readonly ResponsableOperativo[];
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** DetalleOperativoResponse. */
export interface DetalleOperativo extends Operativo {
  readonly criminal: {
    readonly id: string;
    readonly nombre: string;
    readonly estado: EstadoCriminal;
    readonly nivelAmenaza: NivelAmenaza;
    readonly recompensaVigenteMonto: number | null;
  } | null;
  readonly incidentesVinculados: number;
}

/** FiltrarOperativosDto. */
export interface FiltroOperativos {
  q?: string;
  estado?: EstadoOperativo;
  prioridad?: PrioridadOperativo;
  baseNavalId?: string;
  criminalId?: string;
  page?: number;
  limit?: number;
  order?: 'ASC' | 'DESC';
}

/** CrearOperativoDto. */
export interface CrearOperativoPayload {
  nombre: string;
  objetivoCriminalId: string;
  fechaInicioPlaneada: string;
  objetivo?: string;
  descripcion?: string;
  prioridad?: PrioridadOperativo;
  zonaInfluenciaId?: string;
  baseLiderId?: string;
  unidadesLider?: number;
  recursosLider?: string;
}

/** BaseAsignadaDto. */
export interface BaseAsignadaPayload {
  baseNavalId: string;
  rolParticipacion: RolParticipacion;
  unidadesAsignadas?: number;
  recursos?: string;
  observaciones?: string;
}

/** ResponsableDto. */
export interface ResponsablePayload {
  usuarioId: string;
  funcion?: string;
}

/** Usuario asignado a una base (GET /catalogos/bases-navales/:id). */
export interface UsuarioDeBase {
  readonly id: string;
  readonly nombreCompleto: string;
  readonly rol: string;
  readonly estado: string;
}

// --- Vocabulario --------------------------------------------------------------

const TONO_ESTADO: Readonly<Record<EstadoOperativo, TonoEstado>> = {
  PLANIFICADO: 'info',
  EN_CURSO: 'aviso',
  CERRADO: 'exito',
  ABORTADO: 'peligro',
};

const TONO_RESULTADO: Readonly<Record<ResultadoOperativo, TonoEstado>> = {
  EXITOSO: 'exito',
  PARCIAL: 'aviso',
  FALLIDO: 'peligro',
};

export const etiquetaEstadoOperativo = (e: EstadoOperativo): string => es.operativos.estado[e] ?? e;
export const tonoEstadoOperativo = (e: EstadoOperativo): TonoEstado => TONO_ESTADO[e];
export const etiquetaPrioridad = (p: PrioridadOperativo): string => es.operativos.prioridad[p] ?? p;
export const etiquetaResultado = (r: ResultadoOperativo): string => es.operativos.resultado[r] ?? r;
export const tonoResultado = (r: ResultadoOperativo): TonoEstado => TONO_RESULTADO[r];
export const etiquetaRolParticipacion = (r: RolParticipacion): string =>
  es.operativos.rolParticipacion[r] ?? r;

/** 1 (baja) a 4 (critica): el numero de galones del marcador. */
export function nivelPrioridad(p: PrioridadOperativo): 1 | 2 | 3 | 4 {
  return ({ BAJA: 1, MEDIA: 2, ALTA: 3, CRITICA: 4 } as const)[p];
}

export const opcionesEstadoOperativo = (): { valor: EstadoOperativo; etiqueta: string }[] =>
  ESTADOS_OPERATIVO.map((valor) => ({ valor, etiqueta: etiquetaEstadoOperativo(valor) }));
export const opcionesPrioridad = (): { valor: PrioridadOperativo; etiqueta: string }[] =>
  PRIORIDADES.map((valor) => ({ valor, etiqueta: etiquetaPrioridad(valor) }));
export const opcionesResultado = (): { valor: ResultadoOperativo; etiqueta: string }[] =>
  RESULTADOS.map((valor) => ({ valor, etiqueta: etiquetaResultado(valor) }));
export const opcionesRolAsignable = (): { valor: RolParticipacion; etiqueta: string }[] =>
  ROLES_ASIGNABLES.map((valor) => ({ valor, etiqueta: etiquetaRolParticipacion(valor) }));

// --- Reglas (espejo de estado-operativo.enum.ts) ---------------------------------

export const esEstadoFinal = (e: EstadoOperativo): boolean => e === 'CERRADO' || e === 'ABORTADO';
export const puedeIniciar = (e: EstadoOperativo): boolean => e === 'PLANIFICADO';
export const puedeCerrar = (e: EstadoOperativo): boolean => e === 'EN_CURSO';
export const puedeAbortar = (e: EstadoOperativo): boolean => !esEstadoFinal(e);

/**
 * Orden del tablero: lo que esta pasando arriba (en curso), luego lo que viene
 * (planificado) y al final el archivo. Dentro de cada grupo, la prioridad mas
 * alta primero y, a igual prioridad, el cambio mas reciente.
 */
const franja = (e: EstadoOperativo): number => (e === 'EN_CURSO' ? 0 : e === 'PLANIFICADO' ? 1 : 2);

export function ordenarTablero(operativos: readonly Operativo[]): Operativo[] {
  return [...operativos].sort(
    (a, b) =>
      franja(a.estado) - franja(b.estado) ||
      nivelPrioridad(b.prioridad) - nivelPrioridad(a.prioridad) ||
      Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  );
}

export interface GrupoTablero {
  readonly clave: 'activos' | 'planificados' | 'archivo';
  readonly titulo: string;
  readonly operativos: readonly Operativo[];
}

/** Agrupa una pagina del tablero en las tres franjas que ve el oficial. */
export function agruparTablero(operativos: readonly Operativo[]): GrupoTablero[] {
  const ordenados = ordenarTablero(operativos);
  const grupos: GrupoTablero[] = [
    {
      clave: 'activos',
      titulo: 'En curso',
      operativos: ordenados.filter((o) => o.estado === 'EN_CURSO'),
    },
    {
      clave: 'planificados',
      titulo: 'Planificados',
      operativos: ordenados.filter((o) => o.estado === 'PLANIFICADO'),
    },
    {
      clave: 'archivo',
      titulo: 'Completados y abortados',
      operativos: ordenados.filter((o) => esEstadoFinal(o.estado)),
    },
  ];
  return grupos.filter((g) => g.operativos.length > 0);
}

/** La base lider primero y despues el resto en el orden en que se asignaron. */
export function basesOrdenadas(op: Pick<Operativo, 'bases' | 'baseLiderId'>): ParticipacionBase[] {
  const lider = op.bases.find((b) => b.baseNavalId === op.baseLiderId);
  const resto = op.bases.filter((b) => b.baseNavalId !== op.baseLiderId);
  const liderFinal: ParticipacionBase = lider ?? {
    baseNavalId: op.baseLiderId,
    rolParticipacion: 'LIDER',
    unidadesAsignadas: 0,
    recursos: null,
    confirmada: true,
    observaciones: null,
  };
  return [liderFinal, ...resto];
}

// --- Validacion del alta (mismas reglas que CrearOperativoDto) -------------------

export interface BorradorOperativo {
  nombre: string;
  objetivoCriminalId: string;
  fechaInicioPlaneada: string;
  objetivo: string;
  descripcion: string;
  prioridad: PrioridadOperativo;
  zonaInfluenciaId: string;
  baseLiderId: string;
  unidadesLider: string;
  recursosLider: string;
}

export type ErroresOperativo = Partial<Record<keyof BorradorOperativo, string>>;

export function validarOperativo(b: BorradorOperativo): ErroresOperativo {
  const errores: ErroresOperativo = {};
  const nombre = b.nombre.trim();
  if (nombre.length < 3) errores.nombre = 'Escribe un nombre de al menos 3 caracteres.';
  else if (nombre.length > 150) errores.nombre = 'El nombre admite hasta 150 caracteres.';
  if (!b.objetivoCriminalId) errores.objetivoCriminalId = 'Elige el criminal objetivo.';
  if (!b.fechaInicioPlaneada) errores.fechaInicioPlaneada = 'Indica la fecha de inicio.';
  else if (Number.isNaN(Date.parse(b.fechaInicioPlaneada)))
    errores.fechaInicioPlaneada = 'La fecha no es válida.';
  if (b.unidadesLider.trim()) {
    const n = Number(b.unidadesLider);
    if (!Number.isInteger(n) || n < 0) errores.unidadesLider = 'Usa un número entero desde 0.';
  }
  return errores;
}

/** Convierte el borrador del formulario en el cuerpo de POST /operativos. */
export function aPayloadOperativo(b: BorradorOperativo): CrearOperativoPayload {
  const texto = (v: string): string | undefined => v.trim() || undefined;
  return {
    nombre: b.nombre.trim(),
    objetivoCriminalId: b.objetivoCriminalId,
    fechaInicioPlaneada: new Date(b.fechaInicioPlaneada).toISOString(),
    prioridad: b.prioridad,
    objetivo: texto(b.objetivo),
    descripcion: texto(b.descripcion),
    zonaInfluenciaId: texto(b.zonaInfluenciaId),
    baseLiderId: texto(b.baseLiderId),
    unidadesLider: b.unidadesLider.trim() ? Number(b.unidadesLider) : undefined,
    recursosLider: texto(b.recursosLider),
  };
}
