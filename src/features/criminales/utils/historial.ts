import { formatearBerries } from '@shared/utils/berries';
import {
  etiquetaEstadoCriminal,
  etiquetaRolMembresia,
  type EstadoCriminal,
  type RolMembresia,
} from '@shared/utils/criminal';
import { etiquetaNivelAmenaza, type NivelAmenaza } from '@shared/utils/nivel-amenaza';
import type { EntradaHistorial } from '../models/criminal';

/** Una fila del historial lista para pintar: que cambio, de que a que. */
export interface CambioLegible {
  readonly etiqueta: string;
  readonly anterior: string | null;
  readonly nuevo: string | null;
}

export interface ContextoHistorial {
  readonly nombreZona: (id: string | null | undefined) => string | null;
}

const ROLES: readonly RolMembresia[] = ['LIDER', 'OFICIAL', 'MIEMBRO'];
const ESTADOS_RECOMPENSA: Readonly<Record<string, string>> = {
  PENDIENTE: 'Pendiente de validación',
  VIGENTE: 'Vigente',
  HISTORICA: 'Histórica',
  RECHAZADA: 'Rechazada',
};
const MAX_TEXTO = 140;

function recortar(texto: string): string {
  return texto.length > MAX_TEXTO ? `${texto.slice(0, MAX_TEXTO - 1)}…` : texto;
}

/** El trigger guarda el alias como JSON (`["Sombrero de Paja"]`). */
function alias(valor: string): string {
  try {
    const lista: unknown = JSON.parse(valor);
    if (Array.isArray(lista)) {
      return lista.length ? lista.map(String).join(', ') : 'Sin alias';
    }
  } catch {
    // No era JSON: se muestra tal cual.
  }
  return valor;
}

/** "Piratas de Sombrero de Paja (LIDER)" -> "Piratas de Sombrero de Paja (Líder)". */
function afiliacion(valor: string): string {
  if (valor === 'DESAFILIADO') return 'Retirado de la afiliación';
  return valor.replace(/\((LIDER|OFICIAL|MIEMBRO)\)$/, (_, rol: RolMembresia) => {
    return `(${etiquetaRolMembresia(rol)})`;
  });
}

function monto(valor: string): string {
  const n = Number(valor);
  return Number.isFinite(n) ? formatearBerries(n) : valor;
}

function humanizar(campo: string): string {
  const texto = campo.replace(/[_.]+/g, ' ').trim();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

type Formateador = (valor: string, ctx: ContextoHistorial) => string;

const CAMPOS: Readonly<Record<string, { etiqueta: string; valor?: Formateador }>> = {
  nombre: { etiqueta: 'Nombre' },
  alias: { etiqueta: 'Alias', valor: alias },
  edad: { etiqueta: 'Edad', valor: (v) => `${v} años` },
  descripcion_fisica: { etiqueta: 'Descripción física', valor: recortar },
  foto: { etiqueta: 'Foto', valor: () => 'Foto registrada' },
  estado: {
    etiqueta: 'Estado',
    valor: (v) => etiquetaEstadoCriminal(v as EstadoCriminal),
  },
  zona_influencia_id: { etiqueta: 'Zona', valor: (v, ctx) => ctx.nombreZona(v) ?? v },
  recompensa_vigente_monto: { etiqueta: 'Recompensa vigente', valor: monto },
  nivel_amenaza: {
    etiqueta: 'Nivel de amenaza',
    valor: (v) => etiquetaNivelAmenaza(v as NivelAmenaza),
  },
  afiliacion: { etiqueta: 'Afiliación', valor: afiliacion },
  'afiliacion.rol': {
    etiqueta: 'Rol en la afiliación',
    valor: (v) => (ROLES.includes(v as RolMembresia) ? etiquetaRolMembresia(v as RolMembresia) : v),
  },
  antecedente: { etiqueta: 'Antecedente registrado' },
};

/**
 * Traduce una fila de `criminales_historial` (escrita por triggers con el
 * nombre de la columna y los valores en texto) a lenguaje de la Marina.
 */
export function describirCambio(entrada: EntradaHistorial, ctx: ContextoHistorial): CambioLegible {
  const { campo, valorAnterior, valorNuevo } = entrada;

  if (campo === 'REGISTRO') {
    return { etiqueta: 'Alta en el archivo criminal', anterior: null, nuevo: valorNuevo };
  }

  if (campo.startsWith('recompensa:')) {
    const estado = (v: string | null): string | null =>
      v === null ? null : (ESTADOS_RECOMPENSA[v] ?? humanizar(v.toLowerCase()));
    return {
      etiqueta: 'Estado de una recompensa',
      anterior: estado(valorAnterior),
      nuevo: estado(valorNuevo),
    };
  }

  const definicion = CAMPOS[campo];
  const formatear = (v: string | null): string | null => {
    if (v === null || v === '') return null;
    return definicion?.valor ? definicion.valor(v, ctx) : v;
  };

  return {
    etiqueta: definicion?.etiqueta ?? humanizar(campo),
    anterior: formatear(valorAnterior),
    nuevo: formatear(valorNuevo),
  };
}
