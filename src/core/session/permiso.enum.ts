/**
 * Espejo de shared/domain/rbac del backend. Debe mantenerse sincronizado: es
 * parte del contrato que se acuerda en el taller del dia 1-2 del sprint.
 *
 * El frontend solo OCULTA con esto. La autorizacion real la decide el backend
 * con su RolesGuard: un permiso mal copiado aqui no abre ninguna puerta.
 */
export enum RolCodigo {
  ALMIRANTE = 'ALMIRANTE',
  DIRECTOR_INTELIGENCIA = 'DIRECTOR_INTELIGENCIA',
  ANALISTA_DATOS_CRIMINALES = 'ANALISTA_DATOS_CRIMINALES',
  COORDINADOR_OPERACIONES = 'COORDINADOR_OPERACIONES',
  DESARROLLADOR_BACKEND = 'DESARROLLADOR_BACKEND',
  ESPECIALISTA_SEGURIDAD = 'ESPECIALISTA_SEGURIDAD',
  CAPITAN = 'CAPITAN',
}

export enum Permiso {
  TODO = 'ALL',
  CRIMINALES_LEER = 'CRIMINALES_LEER',
  CRIMINALES_ESCRIBIR = 'CRIMINALES_ESCRIBIR',
  RECOMPENSAS_SOLICITAR = 'RECOMPENSAS_SOLICITAR',
  RECOMPENSAS_VALIDAR = 'RECOMPENSAS_VALIDAR',
  CARTELES_GENERAR = 'CARTELES_GENERAR',
  INTELIGENCIA_LEER = 'INTELIGENCIA_LEER',
  INTELIGENCIA_ESCRIBIR = 'INTELIGENCIA_ESCRIBIR',
  INTELIGENCIA_REVISAR_REPORTES = 'INTELIGENCIA_REVISAR_REPORTES',
  OPERATIVOS_LEER = 'OPERATIVOS_LEER',
  OPERATIVOS_COORDINAR = 'OPERATIVOS_COORDINAR',
  INCIDENTES_LEER = 'INCIDENTES_LEER',
  INCIDENTES_ESCRIBIR = 'INCIDENTES_ESCRIBIR',
  AMENAZA_CONFIGURAR_CRITERIOS = 'AMENAZA_CONFIGURAR_CRITERIOS',
  REPORTES_LEER = 'REPORTES_LEER',
  CATALOGOS_ADMINISTRAR = 'CATALOGOS_ADMINISTRAR',
  USUARIOS_ADMINISTRAR = 'USUARIOS_ADMINISTRAR',
  AUDITORIA_LEER = 'AUDITORIA_LEER',
  SISTEMA_CONFIGURAR = 'SISTEMA_CONFIGURAR',
}

/** Nombre del cargo tal como se muestra en la interfaz. */
export const ETIQUETA_ROL: Readonly<Record<RolCodigo, string>> = {
  [RolCodigo.ALMIRANTE]: 'Almirante',
  [RolCodigo.DIRECTOR_INTELIGENCIA]: 'Director de Inteligencia',
  [RolCodigo.ANALISTA_DATOS_CRIMINALES]: 'Analista de Datos Criminales',
  [RolCodigo.COORDINADOR_OPERACIONES]: 'Coordinador de Operaciones',
  [RolCodigo.DESARROLLADOR_BACKEND]: 'Desarrollador Backend',
  [RolCodigo.ESPECIALISTA_SEGURIDAD]: 'Especialista en Seguridad',
  [RolCodigo.CAPITAN]: 'Capitán de Base',
};

/** Roles que, por politica, exigen segundo factor (ROLES_CON_MFA_OBLIGATORIO del backend). */
export const ROLES_CON_MFA_OBLIGATORIO: readonly RolCodigo[] = [
  RolCodigo.ALMIRANTE,
  RolCodigo.DIRECTOR_INTELIGENCIA,
  RolCodigo.ESPECIALISTA_SEGURIDAD,
];

export function etiquetaRol(rol: RolCodigo | string): string {
  return ETIQUETA_ROL[rol as RolCodigo] ?? rol;
}

/** Espejo de UsuarioSesionDto (auth/presentation/dto/sesion.dto.ts). */
export interface UsuarioSesion {
  readonly id: string;
  readonly email: string;
  readonly nombreCompleto: string;
  readonly rol: RolCodigo;
  readonly permisos: readonly Permiso[];
  readonly baseNavalId: string | null;
}

export function tienePermiso(
  permisos: readonly Permiso[] | undefined,
  requerido: Permiso,
): boolean {
  if (!permisos) return false;
  return permisos.includes(Permiso.TODO) || permisos.includes(requerido);
}
