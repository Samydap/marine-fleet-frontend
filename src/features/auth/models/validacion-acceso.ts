/**
 * Validacion de cliente de los formularios de acceso. Replica las reglas de los
 * DTOs del backend (auth/presentation/dto) para avisar antes de enviar; el
 * backend sigue siendo quien decide.
 *
 * Devuelven el mensaje de error o null si el valor es valido.
 */

/** LoginDto.email: @IsEmail + @MaxLength(150). */
export function validarCorreo(valor: string): string | null {
  const correo = valor.trim();
  if (!correo) return 'Escribe tu correo institucional.';
  if (correo.length > 150) return 'El correo no puede superar los 150 caracteres.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return 'El correo no tiene un formato válido (ejemplo: nombre@marina.gov).';
  }
  return null;
}

/** LoginDto.password: @IsNotEmpty + @MaxLength(128). La politica no se valida aqui. */
export function validarContrasena(valor: string): string | null {
  if (!valor) return 'Escribe tu contraseña.';
  if (valor.length > 128) return 'La contraseña no puede superar los 128 caracteres.';
  return null;
}

/** VerifyMfaDto.codigo: exactamente 6 digitos. */
export function validarCodigoMfa(valor: string): string | null {
  if (!valor) return 'Escribe el código de 6 dígitos de tu aplicación de autenticación.';
  if (!/^\d{6}$/.test(valor)) return 'El código debe tener 6 dígitos.';
  return null;
}
