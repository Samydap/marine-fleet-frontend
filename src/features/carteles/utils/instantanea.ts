import { CATEGORIAS_CRIMINAL, ESTADOS_CRIMINAL } from '@shared/utils/criminal';
import type { CategoriaCriminal, EstadoCriminal } from '@shared/utils/criminal';
import type { NivelAmenaza } from '@shared/utils/nivel-amenaza';
import type { CriminalEnCartel, DatosCartel, MotivoGeneracion } from '../models/cartel';

const NIVELES: readonly NivelAmenaza[] = ['BAJO', 'MEDIO', 'ALTO', 'PENDIENTE'];

const texto = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v : null);

function numero(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() && Number.isFinite(Number(v))) return Number(v);
  return null;
}

function deLista<T extends string>(v: unknown, lista: readonly T[]): T | null {
  return typeof v === 'string' && (lista as readonly string[]).includes(v) ? (v as T) : null;
}

/**
 * Lee `datos_instantanea` (JSON sin tipar en el contrato) de forma defensiva:
 * una version antigua con campos faltantes se sigue pudiendo mostrar.
 */
export function leerInstantanea(datos: Record<string, unknown>, criminalId: string): DatosCartel {
  const alias = Array.isArray(datos.alias)
    ? datos.alias.filter((a): a is string => typeof a === 'string' && a.trim() !== '')
    : [];
  return {
    criminalId: texto(datos.criminalId) ?? criminalId,
    nombre: texto(datos.nombre) ?? 'Nombre desconocido',
    alias,
    recompensa: numero(datos.recompensa),
    nivelAmenaza: deLista<NivelAmenaza>(datos.nivelAmenaza, NIVELES),
    estado: deLista<EstadoCriminal>(datos.estado, ESTADOS_CRIMINAL) ?? 'ACTIVO',
    organizacion: texto(datos.organizacion),
    categoriaOrganizacion: deLista<CategoriaCriminal>(
      datos.categoriaOrganizacion,
      CATEGORIAS_CRIMINAL,
    ),
    fotoUrl: texto(datos.fotoUrl),
    textoLegal: texto(datos.textoLegal),
  };
}

/** Vista previa de la galeria con los datos actuales del criminal. */
export function datosDesdeCriminal(c: CriminalEnCartel): DatosCartel {
  return {
    criminalId: c.id,
    nombre: c.nombre,
    alias: c.alias,
    recompensa: c.recompensaVigenteMonto,
    nivelAmenaza: c.nivelAmenaza,
    estado: c.estado,
    organizacion: c.organizacion?.organizacionNombre ?? null,
    categoriaOrganizacion: c.organizacion?.categoria ?? null,
    fotoUrl: c.fotoUrl,
    textoLegal: null,
  };
}

/**
 * La cifra del cartel: el monto entero con puntos de miles y el guion final de
 * los carteles de la Marina ("1.500.000.000-"). Sin recompensa, el texto lo dice.
 */
export function cifraCartel(monto: number | null): string {
  if (monto === null) return 'SIN RECOMPENSA';
  return `${Math.round(monto).toLocaleString('es-CO')}-`;
}

/** Tamano de letra de la cifra segun su largo: que 5.000.000.000 quepa en una linea. */
export function escalaCifra(cifra: string): 'normal' | 'larga' | 'muy-larga' {
  if (cifra.length > 14) return 'muy-larga';
  if (cifra.length > 10) return 'larga';
  return 'normal';
}

/** El nombre en el cartel: los nombres largos bajan de cuerpo en lugar de desbordar. */
export function escalaNombre(nombre: string): 'normal' | 'largo' | 'muy-largo' {
  if (nombre.length > 34) return 'muy-largo';
  if (nombre.length > 20) return 'largo';
  return 'normal';
}

/**
 * El alias baja de cuerpo como el nombre, en vez de recortarse: en el cartel
 * oficial no se pierde ni una letra del apodo.
 */
export function escalaAlias(alias: string): 'normal' | 'largo' | 'muy-largo' {
  if (alias.length > 56) return 'muy-largo';
  if (alias.length > 30) return 'largo';
  return 'normal';
}

const MOTIVOS: Readonly<Record<MotivoGeneracion, string>> = {
  REGISTRO: 'Registro del criminal',
  CAMBIO_FOTO: 'Foto nueva',
  CAMBIO_RECOMPENSA: 'Cambio de recompensa',
  CAMBIO_ESTADO: 'Cambio de estado',
  CAMBIO_AFILIACION: 'Cambio de afiliación',
  CAMBIO_DATOS: 'Cambio de datos',
  MANUAL: 'Emitida a mano',
};

export function etiquetaMotivo(motivo: string): string {
  return MOTIVOS[motivo as MotivoGeneracion] ?? motivo;
}

/** "Monkey D. Luffy" -> "monkey-d-luffy" para el nombre del archivo descargado. */
export function nombreArchivo(nombre: string, version: number, extension: string): string {
  const base = nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `cartel-${base || 'criminal'}-v${version}.${extension}`;
}
