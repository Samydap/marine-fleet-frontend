import type { PageQuery } from '@core/models/page-result';
import type { DatosCartel } from '@shared/utils/cartel';
import type {
  CategoriaCriminal,
  EstadoCriminal,
  RolMembresia,
  TipoAgrupacion,
} from '@shared/utils/criminal';
import type { NivelAmenaza } from '@shared/utils/nivel-amenaza';

// El vocabulario (estado, categoria, rol) vive en shared/utils/criminal porque
// otras features lo muestran; se reexporta para no romper los imports locales.
export type { EstadoCriminal, RolMembresia, TipoAgrupacion };
export type CategoriaOrganizacion = CategoriaCriminal;

/** Espejo de AfiliacionResponse (presentation/mappers/criminal.mapper.ts). */
export interface Afiliacion {
  readonly id: string;
  readonly organizacionId: string;
  readonly organizacionNombre: string | null;
  readonly categoria: CategoriaOrganizacion | null;
  readonly rol: RolMembresia;
  readonly vigente: boolean;
  readonly fechaIngreso: string | null;
  readonly fechaSalida: string | null;
}

/** Espejo de CriminalResponse del backend (presentation/mappers). */
export interface Criminal {
  readonly id: string;
  readonly nombre: string;
  readonly alias: string[];
  readonly edad: number | null;
  readonly descripcionFisica: string | null;
  readonly fotoUrl: string | null;
  readonly estado: EstadoCriminal;
  readonly nivelAmenaza: NivelAmenaza;
  readonly recompensaVigenteMonto: number | null;
  readonly zonaInfluenciaId: string | null;
  /** Afiliacion principal vigente (la de mayor rango) o null: define el tipo de criminal. */
  readonly organizacion: Afiliacion | null;
  readonly fechaBaja: string | null;
  /** Necesaria para la concurrencia optimista al cambiar de estado. */
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Espejo de CriminalDetalleResponse: GET /criminales/:id, POST, PATCH y PUT foto. */
export interface CriminalDetalle extends Criminal {
  /** Todas las afiliaciones vigentes. */
  readonly afiliaciones: Afiliacion[];
  readonly origenBaseId: string | null;
  /** Nombres resueltos por el backend (@ConNombres); `null` si el id ya no existe. */
  readonly origenBaseNombre?: string | null;
  /** Ids de usuario; el nombre llega aparte. */
  readonly creadoPor: string | null;
  readonly creadoPorNombre?: string | null;
  readonly actualizadoPor: string | null;
  readonly actualizadoPorNombre?: string | null;
}

/** CrearCriminalDto. */
export interface CrearCriminalPayload {
  nombre: string;
  alias?: string[];
  edad?: number;
  descripcionFisica?: string;
  zonaInfluenciaId?: string;
  organizacionId?: string;
  rolEnOrganizacion?: RolMembresia;
}

/** ActualizarCriminalDto: solo lo que cambia; `null` vacia un campo opcional. */
export interface ActualizarCriminalPayload {
  version: number;
  nombre?: string;
  alias?: string[];
  edad?: number | null;
  descripcionFisica?: string | null;
  zonaInfluenciaId?: string | null;
}

/** CambiarFotoDto. */
export interface CambiarFotoPayload {
  mime: string;
  imagenBase64: string;
}

export interface FiltroCriminales extends PageQuery {
  estado?: EstadoCriminal;
  nivelAmenaza?: NivelAmenaza;
  zonaInfluenciaId?: string;
  organizacionId?: string;
  categoria?: CategoriaOrganizacion;
  recompensaMin?: number;
  recompensaMax?: number;
}

/** Espejo de AntecedenteResponse (organizacion.mapper.ts). */
export interface Antecedente {
  readonly id: string;
  readonly criminalId: string;
  readonly tipoDelito: string;
  readonly descripcion: string;
  readonly fechaHecho: string | null;
  readonly ubicacion: string | null;
  readonly registradoPor: string | null;
  readonly createdAt: string;
}

/** RegistrarAntecedenteDto. */
export interface RegistrarAntecedentePayload {
  tipoDelito: string;
  descripcion: string;
  fechaHecho?: string;
  ubicacion?: string;
}

/** AfiliarDto. */
export interface AfiliarPayload {
  organizacionId: string;
  rol: RolMembresia;
  fechaIngreso?: string;
}

/**
 * Espejo de EntradaHistorial (domain/historial.repository.port.ts). Las filas
 * las escriben triggers de la base: `campo` es el nombre de la columna
 * (`recompensa_vigente_monto`, `estado`...), 'REGISTRO', 'afiliacion',
 * 'afiliacion.rol', 'antecedente' o 'recompensa:<id>'.
 */
export interface EntradaHistorial {
  readonly id: number;
  readonly criminalId: string;
  readonly campo: string;
  readonly valorAnterior: string | null;
  readonly valorNuevo: string | null;
  readonly usuarioId: string | null;
  readonly usuarioNombre: string | null;
  readonly fecha: string;
}

/** Espejo de OrganizacionResponse. */
export interface Organizacion {
  readonly id: string;
  readonly nombre: string;
  readonly tipoAgrupacion: TipoAgrupacion;
  readonly categoria: CategoriaOrganizacion;
  readonly zonaInfluenciaId: string | null;
  readonly descripcion: string | null;
  /** false = disuelta (baja logica). */
  readonly activa: boolean;
  readonly version: number;
}

/** Espejo de MiembroResponse. */
export interface Miembro {
  readonly membresiaId: string;
  readonly criminalId: string;
  readonly nombre: string | null;
  readonly estado: EstadoCriminal | null;
  readonly recompensaVigenteMonto: number | null;
  readonly rol: RolMembresia;
  readonly vigente: boolean;
  readonly fechaIngreso: string | null;
  readonly fechaSalida: string | null;
}

/** Espejo de OrganizacionDetalleResponse. */
export interface OrganizacionDetalle extends Organizacion {
  readonly lider: Miembro | null;
  readonly miembros: Miembro[];
  readonly totalMiembrosVigentes: number;
}

/** CrearOrganizacionDto. */
export interface CrearOrganizacionPayload {
  nombre: string;
  tipoAgrupacion: TipoAgrupacion;
  categoria: CategoriaOrganizacion;
  zonaInfluenciaId?: string;
  descripcion?: string;
}

/** ActualizarOrganizacionDto. */
export interface ActualizarOrganizacionPayload {
  nombre?: string;
  tipoAgrupacion?: TipoAgrupacion;
  categoria?: CategoriaOrganizacion;
  zonaInfluenciaId?: string | null;
  descripcion?: string | null;
  activa?: boolean;
}

export interface FiltroOrganizaciones extends PageQuery {
  categoria?: CategoriaOrganizacion;
  tipoAgrupacion?: TipoAgrupacion;
  zonaInfluenciaId?: string;
  activa?: boolean;
}

/**
 * Lo que la ficha necesita del cartel vigente (subconjunto de CartelResponse
 * de GET /carteles/criminal/:id). El cartel completo es de features/carteles;
 * aqui solo se enlaza.
 */
export interface CartelVigenteResumen {
  readonly id: string;
  readonly numeroVersion: number;
  readonly motivoGeneracion: string;
  readonly generadoEn: string;
}

/**
 * El cartel oficial vigente: su resumen (version, motivo, fecha) y la
 * instantanea emitida, que es lo que se pinta. Nunca se arma un cartel con los
 * datos actuales del criminal.
 */
export interface CartelVigente {
  readonly resumen: CartelVigenteResumen;
  readonly instantanea: DatosCartel;
}
