import es from '../../assets/i18n/es.json';

/**
 * Vocabulario del criminal que comparten varias features (criminales,
 * carteles, recompensas, operativos, incidentes, inteligencia). Espejo de
 * criminales/domain/estado-criminal.enum.ts del backend.
 *
 * Vive en shared/ porque es VOCABULARIO, no negocio: el modelo completo del
 * criminal (Criminal, CriminalDetalle) sigue siendo de features/criminales.
 */

/** Las tres categorias de entidad criminal (CategoriaOrganizacion). */
export type CategoriaCriminal = 'PIRATA' | 'REVOLUCIONARIO' | 'CRIMINAL_INDEPENDIENTE';
export const CATEGORIAS_CRIMINAL: readonly CategoriaCriminal[] = [
  'PIRATA',
  'REVOLUCIONARIO',
  'CRIMINAL_INDEPENDIENTE',
];

export type EstadoCriminal = 'ACTIVO' | 'CAPTURADO' | 'MUERTO';
export const ESTADOS_CRIMINAL: readonly EstadoCriminal[] = ['ACTIVO', 'CAPTURADO', 'MUERTO'];

export type TipoAgrupacion = 'TRIPULACION' | 'ORGANIZACION' | 'BANDA';
export type RolMembresia = 'LIDER' | 'OFICIAL' | 'MIEMBRO';

/**
 * Un criminal sin afiliacion vigente llega con `organizacion: null`: no es
 * "independiente" (eso es una categoria de organizacion), es "sin afiliacion".
 */
export function etiquetaCategoria(categoria: CategoriaCriminal | null | undefined): string {
  return categoria ? es.categoriaCriminal[categoria] : es.categoriaCriminal.SIN_AFILIACION;
}

export function etiquetaEstadoCriminal(estado: EstadoCriminal): string {
  return es.estadoCriminal[estado] ?? estado;
}

export function etiquetaTipoAgrupacion(tipo: TipoAgrupacion): string {
  return es.tipoAgrupacion[tipo] ?? tipo;
}

export function etiquetaRolMembresia(rol: RolMembresia): string {
  return es.rolMembresia[rol] ?? rol;
}

/** Opciones para un CampoSelect de categoria. */
export function opcionesCategoria(): { valor: CategoriaCriminal; etiqueta: string }[] {
  return CATEGORIAS_CRIMINAL.map((valor) => ({ valor, etiqueta: etiquetaCategoria(valor) }));
}

/** Opciones para un CampoSelect de estado. */
export function opcionesEstadoCriminal(): { valor: EstadoCriminal; etiqueta: string }[] {
  return ESTADOS_CRIMINAL.map((valor) => ({ valor, etiqueta: etiquetaEstadoCriminal(valor) }));
}

/** Tono de InsigniaEstado para el estado del criminal. */
export function tonoEstadoCriminal(estado: EstadoCriminal): 'aviso' | 'exito' | 'neutro' {
  if (estado === 'ACTIVO') return 'aviso';
  if (estado === 'CAPTURADO') return 'exito';
  return 'neutro';
}
