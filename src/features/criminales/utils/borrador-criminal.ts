import type {
  ActualizarCriminalPayload,
  CrearCriminalPayload,
  CriminalDetalle,
  RolMembresia,
} from '../models/criminal';

/** Limites de CrearCriminalDto / ActualizarCriminalDto. */
export const LIMITES = {
  nombreMin: 2,
  nombreMax: 150,
  aliasMax: 10,
  aliasLargo: 100,
  edadMax: 500,
  descripcionMax: 2000,
} as const;

/** Estado del formulario: todo texto, como lo dan los controles. */
export interface BorradorCriminal {
  nombre: string;
  alias: string[];
  edad: string;
  descripcionFisica: string;
  zonaInfluenciaId: string;
  organizacionId: string;
  rolEnOrganizacion: RolMembresia | '';
}

export type CampoBorrador = 'nombre' | 'alias' | 'edad' | 'descripcionFisica' | 'rolEnOrganizacion';
export type ErroresBorrador = Partial<Record<CampoBorrador, string>>;

export const BORRADOR_VACIO: BorradorCriminal = {
  nombre: '',
  alias: [],
  edad: '',
  descripcionFisica: '',
  zonaInfluenciaId: '',
  organizacionId: '',
  rolEnOrganizacion: '',
};

export function borradorDesde(c: CriminalDetalle): BorradorCriminal {
  return {
    nombre: c.nombre,
    alias: [...c.alias],
    edad: c.edad === null ? '' : String(c.edad),
    descripcionFisica: c.descripcionFisica ?? '',
    zonaInfluenciaId: c.zonaInfluenciaId ?? '',
    organizacionId: '',
    rolEnOrganizacion: '',
  };
}

/** Mismas reglas que el DTO, con mensajes que dicen como corregirlo. */
export function validarBorrador(b: BorradorCriminal): ErroresBorrador {
  const errores: ErroresBorrador = {};
  const nombre = b.nombre.trim();

  if (!nombre) errores.nombre = 'Escribe el nombre del criminal.';
  else if (nombre.length < LIMITES.nombreMin)
    errores.nombre = 'El nombre necesita al menos 2 letras.';
  else if (nombre.length > LIMITES.nombreMax)
    errores.nombre = `El nombre admite hasta ${LIMITES.nombreMax} caracteres.`;

  if (b.alias.length > LIMITES.aliasMax) {
    errores.alias = `Se admiten hasta ${LIMITES.aliasMax} alias.`;
  } else if (b.alias.some((a) => a.length > LIMITES.aliasLargo)) {
    errores.alias = `Cada alias admite hasta ${LIMITES.aliasLargo} caracteres.`;
  }

  const edad = b.edad.trim();
  if (edad) {
    const n = Number(edad);
    if (!Number.isInteger(n) || n < 0 || n > LIMITES.edadMax) {
      errores.edad = `La edad debe ser un número entero entre 0 y ${LIMITES.edadMax}.`;
    }
  }

  if (b.descripcionFisica.length > LIMITES.descripcionMax) {
    errores.descripcionFisica = `La descripción admite hasta ${LIMITES.descripcionMax} caracteres.`;
  }

  if (b.organizacionId && !b.rolEnOrganizacion) {
    errores.rolEnOrganizacion = 'Indica el rol que ocupa en la afiliación.';
  }

  return errores;
}

/** Limpia la lista de alias: sin vacios ni repetidos (sin distinguir mayusculas). */
export function normalizarAlias(alias: readonly string[]): string[] {
  const vistos = new Set<string>();
  const resultado: string[] = [];
  for (const a of alias) {
    const limpio = a.trim().replace(/\s+/g, ' ');
    const clave = limpio.toLocaleLowerCase('es');
    if (limpio && !vistos.has(clave)) {
      vistos.add(clave);
      resultado.push(limpio);
    }
  }
  return resultado;
}

export function aCrearPayload(b: BorradorCriminal): CrearCriminalPayload {
  const payload: CrearCriminalPayload = { nombre: b.nombre.trim() };
  const alias = normalizarAlias(b.alias);
  if (alias.length) payload.alias = alias;
  if (b.edad.trim()) payload.edad = Number(b.edad);
  if (b.descripcionFisica.trim()) payload.descripcionFisica = b.descripcionFisica.trim();
  if (b.zonaInfluenciaId) payload.zonaInfluenciaId = b.zonaInfluenciaId;
  if (b.organizacionId && b.rolEnOrganizacion) {
    payload.organizacionId = b.organizacionId;
    payload.rolEnOrganizacion = b.rolEnOrganizacion;
  }
  return payload;
}

/**
 * Solo lo que cambio respecto al registro leido (y su `version`). Un campo
 * opcional vaciado viaja como `null`. Devuelve null si no hay cambios.
 */
export function aActualizarPayload(
  b: BorradorCriminal,
  original: CriminalDetalle,
): ActualizarCriminalPayload | null {
  const payload: ActualizarCriminalPayload = { version: original.version };
  let cambios = 0;

  const nombre = b.nombre.trim();
  if (nombre !== original.nombre) {
    payload.nombre = nombre;
    cambios++;
  }

  const alias = normalizarAlias(b.alias);
  if (JSON.stringify(alias) !== JSON.stringify(original.alias)) {
    payload.alias = alias;
    cambios++;
  }

  const edad = b.edad.trim() ? Number(b.edad) : null;
  if (edad !== original.edad) {
    payload.edad = edad;
    cambios++;
  }

  const descripcion = b.descripcionFisica.trim() || null;
  if (descripcion !== (original.descripcionFisica ?? null)) {
    payload.descripcionFisica = descripcion;
    cambios++;
  }

  const zona = b.zonaInfluenciaId || null;
  if (zona !== (original.zonaInfluenciaId ?? null)) {
    payload.zonaInfluenciaId = zona;
    cambios++;
  }

  return cambios > 0 ? payload : null;
}
