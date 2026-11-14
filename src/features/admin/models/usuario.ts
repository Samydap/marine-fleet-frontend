import es from '../../../assets/i18n/es.json';
import { RolCodigo } from '@core/session/permiso.enum';
import type { TonoEstado } from '@shared/ui/InsigniaEstado';

/** Espejo de usuarios/presentation (UsuarioResponse, RolResponse y DTOs). */
export type EstadoUsuario = 'ACTIVO' | 'BLOQUEADO' | 'INACTIVO';
export const ESTADOS_USUARIO: readonly EstadoUsuario[] = ['ACTIVO', 'BLOQUEADO', 'INACTIVO'];

export interface Usuario {
  readonly id: string;
  readonly nombreCompleto: string;
  readonly email: string;
  readonly rol: RolCodigo | null;
  readonly rolNombre: string | null;
  readonly baseNavalId: string | null;
  readonly estado: EstadoUsuario;
  readonly intentosFallidos: number;
  readonly ultimoAcceso: string | null;
  readonly version: number;
  readonly createdAt: string;
}

export interface Rol {
  readonly codigo: RolCodigo;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly permisos: readonly string[];
  readonly requiere2fa: boolean;
  readonly activo: boolean;
}

export interface FiltroUsuarios {
  q?: string;
  rol?: RolCodigo;
  baseNavalId?: string;
  estado?: EstadoUsuario;
  page?: number;
  limit?: number;
  order?: 'ASC' | 'DESC';
}

export interface CrearUsuarioPayload {
  nombreCompleto: string;
  email: string;
  password: string;
  rol: RolCodigo;
  baseNavalId?: string | null;
}

export interface ActualizarUsuarioPayload {
  version: number;
  nombreCompleto?: string;
  rol?: RolCodigo;
  baseNavalId?: string | null;
  estado?: EstadoUsuario;
}

const TONO: Readonly<Record<EstadoUsuario, TonoEstado>> = {
  ACTIVO: 'exito',
  BLOQUEADO: 'peligro',
  INACTIVO: 'neutro',
};

export const etiquetaEstadoUsuario = (e: EstadoUsuario): string => es.admin.estadoUsuario[e] ?? e;
export const tonoEstadoUsuario = (e: EstadoUsuario): TonoEstado => TONO[e] ?? 'neutro';
export const opcionesEstadoUsuario = (): { valor: EstadoUsuario; etiqueta: string }[] =>
  ESTADOS_USUARIO.map((valor) => ({ valor, etiqueta: etiquetaEstadoUsuario(valor) }));

/** Roles que operan sobre una base concreta (politica-usuarios.ts: ROLES_CON_BASE). */
export const ROLES_CON_BASE: readonly RolCodigo[] = [RolCodigo.CAPITAN];

// --- Reglas (espejo de politica-usuarios.ts) -------------------------------------

/** Lo que le falta a la contraseña; vacio si cumple. */
export function faltasContrasena(password: string): string[] {
  const faltas: string[] = [];
  if (password.length < 8) faltas.push('al menos 8 caracteres');
  if (!/[A-Z]/.test(password)) faltas.push('una mayúscula');
  if (!/[a-z]/.test(password)) faltas.push('una minúscula');
  if (!/\d/.test(password)) faltas.push('un número');
  return faltas;
}

export interface BorradorUsuario {
  nombreCompleto: string;
  email: string;
  password: string;
  rol: RolCodigo | '';
  baseNavalId: string;
  estado: EstadoUsuario;
}

export type ErroresUsuario = Partial<Record<keyof BorradorUsuario, string>>;

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** `nuevo`: el alta exige correo y contraseña; la edicion no los toca. */
export function validarUsuario(b: BorradorUsuario, nuevo: boolean): ErroresUsuario {
  const e: ErroresUsuario = {};
  const nombre = b.nombreCompleto.trim();
  if (nombre.length < 3) e.nombreCompleto = 'Escribe el nombre completo (mínimo 3 caracteres).';
  else if (nombre.length > 150) e.nombreCompleto = 'El nombre admite hasta 150 caracteres.';
  if (nuevo) {
    if (!CORREO.test(b.email.trim())) e.email = 'Escribe un correo válido, como nombre@marina.gov.';
    const faltas = faltasContrasena(b.password);
    if (faltas.length > 0) e.password = `Le falta ${faltas.join(', ')}.`;
  }
  if (!b.rol) e.rol = 'Elige el cargo.';
  else if (ROLES_CON_BASE.includes(b.rol) && !b.baseNavalId)
    e.baseNavalId = 'Un Capitán de Base necesita una base naval asignada.';
  return e;
}
