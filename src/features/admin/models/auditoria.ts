import es from '../../../assets/i18n/es.json';

/** Espejo de AuditoriaResponse (auditoria/presentation/auditoria.controller.ts). */
export type TipoAccionAuditoria =
  'CREACION' | 'ACTUALIZACION' | 'ELIMINACION_LOGICA' | 'CONSULTA' | 'AUTENTICACION';

export interface RegistroAuditoria {
  readonly id: string;
  readonly fecha: string;
  readonly usuarioId: string | null;
  readonly rol: string | null;
  readonly accion: string;
  readonly tipoAccion: TipoAccionAuditoria;
  readonly entidad: string | null;
  readonly entidadId: string | null;
  readonly valorAnterior: unknown;
  readonly valorNuevo: unknown;
  readonly metodo: string | null;
  readonly ruta: string | null;
  readonly ip: string | null;
  readonly exitoso: boolean;
}

/** FiltrarAuditoriaDto. `desde` y `hasta` en AAAA-MM-DD. */
export interface FiltroAuditoria {
  usuarioId?: string;
  accion?: string;
  entidad?: string;
  entidadId?: string;
  exitoso?: boolean;
  desde?: string;
  hasta?: string;
  page?: number;
  limit?: number;
  order?: 'ASC' | 'DESC';
}

export const etiquetaTipoAccion = (t: TipoAccionAuditoria): string => es.admin.tipoAccion[t] ?? t;

/**
 * El backend registra la accion como codigo (VALIDAR_RECOMPENSA). Se presenta
 * como frase: "Validar recompensa". Las siglas conocidas se conservan.
 */
export function describirAccion(codigo: string): string {
  const SIGLAS = new Set(['MFA', 'PDF', 'CSV', 'IP']);
  const palabras = codigo
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((p) => (SIGLAS.has(p.toUpperCase()) ? p.toUpperCase() : p.toLowerCase()));
  if (palabras.length === 0) return codigo;
  const frase = palabras.join(' ');
  return frase.charAt(0).toUpperCase() + frase.slice(1);
}

/** Entidades que el backend audita, con su nombre en la interfaz. */
export const ENTIDADES_AUDITADAS: readonly { valor: string; etiqueta: string }[] = [
  { valor: 'criminal', etiqueta: 'Criminal' },
  { valor: 'antecedente', etiqueta: 'Antecedente' },
  { valor: 'organizacion', etiqueta: 'Organización' },
  { valor: 'recompensa', etiqueta: 'Recompensa' },
  { valor: 'cartel', etiqueta: 'Cartel' },
  { valor: 'avistamiento', etiqueta: 'Avistamiento' },
  { valor: 'reporte_ciudadano', etiqueta: 'Reporte ciudadano' },
  { valor: 'criterio_amenaza', etiqueta: 'Criterio de amenaza' },
  { valor: 'operativo', etiqueta: 'Operativo' },
  { valor: 'incidente', etiqueta: 'Incidente' },
  { valor: 'usuario', etiqueta: 'Usuario' },
  { valor: 'mar', etiqueta: 'Mar' },
  { valor: 'zona_influencia', etiqueta: 'Zona de influencia' },
  { valor: 'base_naval', etiqueta: 'Base naval' },
];

export function etiquetaEntidad(entidad: string | null): string {
  if (!entidad) return 'Sin registro';
  return ENTIDADES_AUDITADAS.find((e) => e.valor === entidad)?.etiqueta ?? describirAccion(entidad);
}

export interface CambioCampo {
  readonly campo: string;
  readonly anterior: string;
  readonly nuevo: string;
}

function aTexto(valor: unknown): string {
  if (valor === undefined) return '—';
  if (valor === null) return 'vacío';
  if (typeof valor === 'object') return JSON.stringify(valor);
  return String(valor);
}

function comoObjeto(valor: unknown): Record<string, unknown> {
  return valor && typeof valor === 'object' && !Array.isArray(valor)
    ? (valor as Record<string, unknown>)
    : {};
}

/**
 * Compara valorAnterior y valorNuevo campo a campo. Solo devuelve lo que
 * cambio (en una creacion, todo lo nuevo; en una baja, todo lo anterior).
 */
export function diferencias(anterior: unknown, nuevo: unknown): CambioCampo[] {
  const a = comoObjeto(anterior);
  const n = comoObjeto(nuevo);
  const campos = [...new Set([...Object.keys(a), ...Object.keys(n)])];
  return campos
    .filter((c) => JSON.stringify(a[c]) !== JSON.stringify(n[c]))
    .map((campo) => ({ campo, anterior: aTexto(a[campo]), nuevo: aTexto(n[campo]) }));
}
