import { ApiError } from '@core/models/api-response';
import type { UsuarioSesion } from '@core/session/permiso.enum';

/** Espejo de VerifyMfaDto (auth/presentation/dto/verify-mfa.dto.ts). */
export interface VerificarMfaPeticion {
  readonly challengeToken: string;
  readonly codigo: string;
}

/**
 * Lo que la pantalla de MFA recibe por `location.state` desde el login cuando
 * el backend exija el segundo factor.
 */
export interface RetoMfa {
  readonly challengeToken: string;
  readonly email: string;
}

export function esRetoMfa(valor: unknown): valor is RetoMfa {
  if (typeof valor !== 'object' || valor === null) return false;
  const reto = valor as Partial<RetoMfa>;
  return typeof reto.challengeToken === 'string' && typeof reto.email === 'string';
}

/**
 * MOCK AISLADO. El backend ya define VerifyMfaDto, pero todavia no expone el
 * endpoint de verificacion ni devuelve un `challengeToken` desde /auth/login
 * (ver el PENDIENTE de login.use-case.ts). Hasta entonces esta funcion responde
 * lo mismo que responderia un servidor sin el segundo factor habilitado, para
 * que la pantalla muestre un estado honesto en lugar de aceptar cualquier
 * codigo.
 *
 * Cuando exista el endpoint, se sustituye el cuerpo por la llamada real con
 * `apiClient.post` y se guarda la sesion como en sessionService.login.
 */
export const mfaApi = {
  async verificar(peticion: VerificarMfaPeticion): Promise<UsuarioSesion> {
    if (!/^\d{6}$/.test(peticion.codigo)) {
      throw new ApiError(400, 'HTTP', 'El codigo debe tener 6 digitos.');
    }
    throw new ApiError(
      501,
      'MFA_NO_DISPONIBLE',
      'La verificación en dos pasos todavía no está habilitada en el servidor.',
    );
  },
};
