import es from '../../../assets/i18n/es.json';
import type { TipoMar } from '@core/catalogos/catalogos';

/**
 * Formulario unico del catalogo geografico. Los tipos de Mar, ZonaInfluencia
 * y BaseNaval viven en core/catalogos (los lee todo el sistema); aqui solo
 * esta lo que necesita su edicion (CrearMarDto, CrearZonaDto, CrearBaseNavalDto).
 */
export type TipoCatalogo = 'mar' | 'zona' | 'base';

export interface BorradorCatalogo {
  nombre: string;
  activo: boolean;
  tipoMar?: TipoMar;
  /** Mar de la zona o zona de la base. */
  padreId?: string;
  descripcion?: string;
  ubicacion?: string;
  comandante?: string;
}

export type ErroresCatalogo = Partial<Record<keyof BorradorCatalogo, string>>;

export const etiquetaTipoMar = (t: TipoMar): string => es.admin.tipoMar[t] ?? t;

export function validarCatalogo(tipo: TipoCatalogo, b: BorradorCatalogo): ErroresCatalogo {
  const e: ErroresCatalogo = {};
  const nombre = b.nombre.trim();
  if (nombre.length < 2) e.nombre = 'Escribe un nombre de al menos 2 caracteres.';
  else if (nombre.length > 100) e.nombre = 'El nombre admite hasta 100 caracteres.';
  if (tipo === 'zona' && !b.padreId) e.padreId = 'Elige el mar de la zona.';
  if (tipo === 'base') {
    if (!b.padreId) e.padreId = 'Elige la zona de influencia.';
    if ((b.ubicacion ?? '').trim().length < 2) e.ubicacion = 'Indica dónde está la base.';
    if ((b.comandante ?? '').trim().length < 2) e.comandante = 'Indica quién la comanda.';
  }
  return e;
}
