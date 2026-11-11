import type { PageQuery } from '@core/models/page-result';
import type { NivelAmenaza } from '@shared/utils/nivel-amenaza';

export type EstadoCriminal = 'ACTIVO' | 'CAPTURADO' | 'MUERTO';
export type CategoriaOrganizacion = 'PIRATA' | 'REVOLUCIONARIO' | 'CRIMINAL_INDEPENDIENTE';
export type RolMembresia = 'LIDER' | 'OFICIAL' | 'MIEMBRO';

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
  /** Necesaria para la concurrencia optimista al cambiar de estado. */
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CrearCriminalPayload {
  nombre: string;
  alias?: string[];
  edad?: number;
  descripcionFisica?: string;
  zonaInfluenciaId?: string;
  organizacionId?: string;
  rolEnOrganizacion?: RolMembresia;
}

export interface FiltroCriminales extends PageQuery {
  estado?: EstadoCriminal;
  nivelAmenaza?: NivelAmenaza;
  zonaInfluenciaId?: string;
  organizacionId?: string;
}
