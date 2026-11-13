import { describe, expect, it } from 'vitest';
import { ApiError } from '@core/models/api-response';
import { describirFalloAcceso, describirFalloMfa } from './fallo-acceso';
import { validarCodigoMfa, validarContrasena, validarCorreo } from './validacion-acceso';

describe('describirFalloAcceso', () => {
  it('usa el mensaje del backend para credenciales invalidas', () => {
    const fallo = describirFalloAcceso(
      new ApiError(401, 'CREDENCIALES_INVALIDAS', 'Correo o contraseña incorrectos.'),
    );
    expect(fallo.tipo).toBe('credenciales');
    expect(fallo.titulo).toBe('Correo o contraseña incorrectos.');
  });

  it.each([
    ['CUENTA_BLOQUEADA', 'Cuenta bloqueada'],
    ['CUENTA_INACTIVA', 'Cuenta inactiva'],
    ['ROL_INACTIVO', 'Rol sin acceso'],
  ])('trata %s como un problema de la cuenta', (codigo, titulo) => {
    const fallo = describirFalloAcceso(new ApiError(400, codigo, 'Mensaje del servidor.'));
    expect(fallo).toMatchObject({ tipo: 'cuenta', titulo });
  });

  it('distingue la falta de conexion y los errores del servidor', () => {
    expect(describirFalloAcceso(new ApiError(0, 'SIN_CONEXION', 'x')).tipo).toBe('conexion');
    expect(describirFalloAcceso(new ApiError(503, 'HTTP', 'x')).tipo).toBe('conexion');
    expect(describirFalloAcceso(new Error('inesperado')).tipo).toBe('conexion');
  });

  it('muestra la validacion del backend tal cual', () => {
    const fallo = describirFalloAcceso(
      new ApiError(400, 'HTTP', 'El correo no tiene un formato valido.'),
    );
    expect(fallo.detalle).toBe('El correo no tiene un formato valido.');
  });
});

describe('describirFalloMfa', () => {
  it('un codigo incorrecto se puede corregir y avisa del bloqueo', () => {
    const fallo = describirFalloMfa(new ApiError(401, 'CODIGO_MFA_INVALIDO', 'x'));
    expect(fallo).toMatchObject({ tipo: 'credenciales', titulo: 'Código incorrecto' });
    expect(fallo.detalle).toMatch(/se bloquea/);
  });

  it('un reto vencido pide volver a iniciar sesion', () => {
    for (const codigo of ['RETO_MFA_INVALIDO', 'SESION_INVALIDA']) {
      expect(describirFalloMfa(new ApiError(401, codigo, 'x'))).toMatchObject({
        tipo: 'cuenta',
        titulo: 'La verificación venció',
      });
    }
  });

  it('una cuenta bloqueada se describe igual que en el login', () => {
    expect(describirFalloMfa(new ApiError(400, 'CUENTA_BLOQUEADA', 'x')).titulo).toBe(
      'Cuenta bloqueada',
    );
  });
});

describe('validacion de acceso', () => {
  it('valida el correo como LoginDto', () => {
    expect(validarCorreo('')).toMatch(/Escribe/);
    expect(validarCorreo('sin-arroba')).toMatch(/formato/);
    expect(validarCorreo(`${'a'.repeat(145)}@m.gov`)).toMatch(/150/);
    expect(validarCorreo('almirante@marina.gov')).toBeNull();
  });

  it('solo exige que la contrasena exista y no supere 128 caracteres', () => {
    expect(validarContrasena('')).not.toBeNull();
    expect(validarContrasena('x'.repeat(129))).toMatch(/128/);
    expect(validarContrasena('corta')).toBeNull();
  });

  it('exige seis digitos en el codigo MFA', () => {
    expect(validarCodigoMfa('12345')).not.toBeNull();
    expect(validarCodigoMfa('12345a')).not.toBeNull();
    expect(validarCodigoMfa('123456')).toBeNull();
  });
});
