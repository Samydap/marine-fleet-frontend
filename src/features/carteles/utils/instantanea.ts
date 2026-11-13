import type { DatosCartel } from '@shared/utils/cartel';
import type { CriminalEnCartel, MotivoGeneracion } from '../models/cartel';

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
