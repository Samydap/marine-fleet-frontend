import type { PageQuery } from '@core/models/page-result';
import type { CategoriaCriminal, EstadoCriminal } from '@shared/utils/criminal';
import type { NivelAmenaza } from '@shared/utils/nivel-amenaza';

/** Por que se (re)genero el cartel (MotivoGeneracion de cartel.entity.ts). */
export type MotivoGeneracion =
  | 'REGISTRO'
  | 'CAMBIO_FOTO'
  | 'CAMBIO_RECOMPENSA'
  | 'CAMBIO_ESTADO'
  | 'CAMBIO_AFILIACION'
  | 'CAMBIO_DATOS'
  | 'MANUAL';

/** Formatos de DescargarCartelDto: PDF para imprimir, SVG como imagen. */
export type FormatoCartel = 'pdf' | 'svg';

/** Espejo de CartelResponse (carteles/presentation/mappers/cartel.mapper.ts). */
export interface Cartel {
  readonly id: string;
  readonly criminalId: string;
  readonly numeroVersion: number;
  readonly vigente: boolean;
  readonly motivoGeneracion: MotivoGeneracion;
  readonly generadoPor: string | null;
  readonly generadoEn: string;
  /** URL publica del PDF guardado. */
  readonly archivoUrl: string;
  readonly tamanoBytes: number;
  readonly descargas: { readonly pdf: string; readonly imagen: string };
  /** Instantanea sin tipar en el contrato: se lee con leerInstantanea(). */
  readonly datos: Record<string, unknown>;
}

/** ResultadoRegeneracion de POST /carteles/regenerar-todos. */
export interface ResultadoRegeneracion {
  readonly generados: number;
  readonly omitidos: number;
  readonly fallidos: readonly string[];
}

/**
 * Lo que la galeria lee de GET /criminales (CriminalResponse). Se consume por
 * contrato, sin importar la feature criminales.
 */
export interface CriminalEnCartel {
  readonly id: string;
  readonly nombre: string;
  readonly alias: string[];
  readonly fotoUrl: string | null;
  readonly estado: EstadoCriminal;
  readonly nivelAmenaza: NivelAmenaza;
  readonly recompensaVigenteMonto: number | null;
  readonly organizacion: {
    readonly organizacionNombre: string | null;
    readonly categoria: CategoriaCriminal | null;
  } | null;
  readonly updatedAt: string;
}

export interface FiltroGaleria extends PageQuery {
  estado?: EstadoCriminal;
  categoria?: CategoriaCriminal;
  zonaInfluenciaId?: string;
}
