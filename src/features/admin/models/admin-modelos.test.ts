import { describe, expect, it } from 'vitest';
import { RolCodigo } from '@core/session/permiso.enum';
import { describirAccion, diferencias, etiquetaEntidad } from './auditoria';
import { validarCatalogo } from './catalogo';
import { faltasContrasena, validarUsuario, type BorradorUsuario } from './usuario';

const USUARIO: BorradorUsuario = {
  nombreCompleto: 'Tashigi',
  email: 'tashigi@marina.gov',
  password: 'Shigure.2026',
  rol: RolCodigo.COORDINADOR_OPERACIONES,
  baseNavalId: '',
  estado: 'ACTIVO',
};

describe('politica de usuarios', () => {
  it('la contraseña exige 8+, mayuscula, minuscula y numero', () => {
    expect(faltasContrasena('Shigure.2026')).toEqual([]);
    expect(faltasContrasena('abc')).toEqual([
      'al menos 8 caracteres',
      'una mayúscula',
      'un número',
    ]);
  });

  it('el alta valida correo y contraseña; la edicion no', () => {
    const malo = { ...USUARIO, email: 'sin-arroba', password: 'corta' };
    expect(Object.keys(validarUsuario(malo, true)).sort()).toEqual(['email', 'password']);
    expect(validarUsuario(malo, false)).toEqual({});
  });

  it('un Capitan necesita base naval', () => {
    const capitan = { ...USUARIO, rol: RolCodigo.CAPITAN };
    expect(validarUsuario(capitan, true).baseNavalId).toBeDefined();
    expect(validarUsuario({ ...capitan, baseNavalId: 'b-153' }, true)).toEqual({});
  });
});

describe('bitacora', () => {
  it('presenta el codigo de accion como frase', () => {
    expect(describirAccion('VALIDAR_RECOMPENSA')).toBe('Validar recompensa');
    expect(describirAccion('VERIFICAR_MFA')).toBe('Verificar MFA');
  });

  it('nombra la entidad o cae a una frase legible', () => {
    expect(etiquetaEntidad('base_naval')).toBe('Base naval');
    expect(etiquetaEntidad('otra_cosa')).toBe('Otra cosa');
    expect(etiquetaEntidad(null)).toBe('Sin registro');
  });

  it('solo lista los campos que cambiaron', () => {
    expect(
      diferencias({ monto: 100, estado: 'X', igual: 1 }, { monto: 200, estado: null, igual: 1 }),
    ).toEqual([
      { campo: 'monto', anterior: '100', nuevo: '200' },
      { campo: 'estado', anterior: 'X', nuevo: 'vacío' },
    ]);
    expect(diferencias(null, { nombre: 'G-8' })).toEqual([
      { campo: 'nombre', anterior: '—', nuevo: 'G-8' },
    ]);
  });
});

describe('catalogo', () => {
  it('una base exige zona, ubicacion y comandante', () => {
    expect(Object.keys(validarCatalogo('base', { nombre: 'G-8', activo: true })).sort()).toEqual([
      'comandante',
      'padreId',
      'ubicacion',
    ]);
    expect(validarCatalogo('mar', { nombre: 'Calm Belt', activo: true })).toEqual({});
  });
});
