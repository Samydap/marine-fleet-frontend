import { Permiso, RolCodigo, tienePermiso, type UsuarioSesion } from './permiso.enum';

/**
 * Mapa de navegacion del sistema: UNA sola tabla para la barra lateral, la
 * redireccion segun rol y los guards raiz de cada `*.routes.tsx`.
 *
 * Si una feature necesita cambiar el permiso de su entrada, se cambia aqui y
 * se refleja en los tres sitios a la vez. Los permisos son los mismos que
 * exige el backend en el endpoint principal de la feature (`@RequierePermisos`).
 */

export type GrupoNavegacion = 'archivo' | 'inteligencia' | 'flota' | 'mando';

export type ClaveFeature =
  | 'criminales'
  | 'carteles'
  | 'recompensas'
  | 'inteligencia'
  | 'amenaza'
  | 'operativos'
  | 'incidentes'
  | 'admin';

export interface EntradaNavegacion {
  readonly clave: ClaveFeature;
  readonly etiqueta: string;
  readonly ruta: string;
  readonly grupo: GrupoNavegacion;
  /** Basta con uno: la entrada se muestra si el usuario tiene alguno. */
  readonly permisos: readonly Permiso[];
}

export const ETIQUETA_GRUPO: Readonly<Record<GrupoNavegacion, string>> = {
  archivo: 'Archivo criminal',
  inteligencia: 'Inteligencia',
  flota: 'Flota',
  mando: 'Mando',
};

export const NAVEGACION: readonly EntradaNavegacion[] = [
  {
    clave: 'criminales',
    etiqueta: 'Criminales',
    ruta: '/criminales',
    grupo: 'archivo',
    permisos: [Permiso.CRIMINALES_LEER],
  },
  {
    clave: 'carteles',
    etiqueta: 'Carteles',
    ruta: '/carteles',
    grupo: 'archivo',
    // Consultar y descargar exige solo lectura; generar a mano, CARTELES_GENERAR.
    permisos: [Permiso.CRIMINALES_LEER],
  },
  {
    clave: 'recompensas',
    etiqueta: 'Recompensas',
    ruta: '/recompensas',
    grupo: 'archivo',
    permisos: [Permiso.RECOMPENSAS_SOLICITAR, Permiso.RECOMPENSAS_VALIDAR, Permiso.REPORTES_LEER],
  },
  {
    clave: 'inteligencia',
    etiqueta: 'Avistamientos',
    ruta: '/inteligencia',
    grupo: 'inteligencia',
    permisos: [Permiso.INTELIGENCIA_LEER],
  },
  {
    clave: 'amenaza',
    etiqueta: 'Amenaza',
    ruta: '/amenaza',
    grupo: 'inteligencia',
    permisos: [Permiso.REPORTES_LEER, Permiso.AMENAZA_CONFIGURAR_CRITERIOS],
  },
  {
    clave: 'operativos',
    etiqueta: 'Operativos',
    ruta: '/operativos',
    grupo: 'flota',
    permisos: [Permiso.OPERATIVOS_LEER],
  },
  {
    clave: 'incidentes',
    etiqueta: 'Incidentes',
    ruta: '/incidentes',
    grupo: 'flota',
    permisos: [Permiso.INCIDENTES_LEER],
  },
  {
    clave: 'admin',
    etiqueta: 'Administración',
    ruta: '/admin',
    grupo: 'mando',
    permisos: [Permiso.USUARIOS_ADMINISTRAR, Permiso.AUDITORIA_LEER, Permiso.CATALOGOS_ADMINISTRAR],
  },
];

/** Permisos del guard raiz de una feature. Lo usa su `*.routes.tsx`. */
export function permisosDeFeature(clave: ClaveFeature): readonly Permiso[] {
  const entrada = NAVEGACION.find((e) => e.clave === clave);
  if (!entrada) throw new Error(`Feature sin entrada de navegacion: ${clave}`);
  return entrada.permisos;
}

export function tieneAlguno(
  permisos: readonly Permiso[] | undefined,
  requeridos: readonly Permiso[],
): boolean {
  return requeridos.some((p) => tienePermiso(permisos, p));
}

export function navegacionVisible(
  permisos: readonly Permiso[] | undefined,
): readonly EntradaNavegacion[] {
  return NAVEGACION.filter((e) => tieneAlguno(permisos, e.permisos));
}

interface Destino {
  readonly ruta: string;
  readonly permisos: readonly Permiso[];
}

/**
 * Pantalla de llegada por cargo: la tarea que cada rol abre primero.
 * Si el rol no tuviera el permiso (matriz cambiada en el backend), se cae a la
 * primera entrada visible del menu.
 */
const INICIO_POR_ROL: Readonly<Record<RolCodigo, Destino>> = {
  // Valida las recompensas de alto rango: es la tarea que solo el puede hacer.
  [RolCodigo.ALMIRANTE]: {
    ruta: '/recompensas/validacion',
    permisos: [Permiso.RECOMPENSAS_VALIDAR],
  },
  [RolCodigo.DIRECTOR_INTELIGENCIA]: {
    ruta: '/inteligencia',
    permisos: [Permiso.INTELIGENCIA_LEER],
  },
  [RolCodigo.ANALISTA_DATOS_CRIMINALES]: {
    ruta: '/amenaza',
    permisos: [Permiso.REPORTES_LEER, Permiso.AMENAZA_CONFIGURAR_CRITERIOS],
  },
  [RolCodigo.COORDINADOR_OPERACIONES]: {
    ruta: '/operativos',
    permisos: [Permiso.OPERATIVOS_LEER],
  },
  [RolCodigo.CAPITAN]: { ruta: '/operativos', permisos: [Permiso.OPERATIVOS_LEER] },
  [RolCodigo.ESPECIALISTA_SEGURIDAD]: {
    ruta: '/admin/bitacora',
    permisos: [Permiso.AUDITORIA_LEER],
  },
  [RolCodigo.DESARROLLADOR_BACKEND]: {
    ruta: '/criminales',
    permisos: [Permiso.CRIMINALES_LEER],
  },
};

/** Ruta de llegada tras iniciar sesion, o al entrar a `/`. */
export function rutaInicio(usuario: Pick<UsuarioSesion, 'rol' | 'permisos'> | null): string {
  if (!usuario) return '/auth/login';

  const preferido = INICIO_POR_ROL[usuario.rol];
  if (preferido && tieneAlguno(usuario.permisos, preferido.permisos)) {
    return preferido.ruta;
  }

  return navegacionVisible(usuario.permisos)[0]?.ruta ?? '/sin-acceso';
}
