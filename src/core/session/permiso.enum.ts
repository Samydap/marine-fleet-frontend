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
  USUARIOS_ADMINISTRAR = 'USUARIOS_ADMINISTRAR',
  AUDITORIA_LEER = 'AUDITORIA_LEER',
  SISTEMA_CONFIGURAR = 'SISTEMA_CONFIGURAR',
}

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
