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
 * MOCK AISLADO (revisado contra el backend en develop, modulo auth completo).
 *
 * El backend define VerifyMfaDto y el puerto MFA_PROVIDER, pero el
 * AuthController solo expone POST /auth/login, POST /auth/refresh y
 * GET /auth/me: NO hay endpoint de verificacion, y /auth/login nunca devuelve
 * un `challengeToken` (PENDIENTE de login.use-case.ts y auth.module.ts:
 * verify-mfa.use-case.ts + totp-mfa.adapter.ts). Hasta entonces esta funcion
 * responde lo mismo que un servidor sin el segundo factor habilitado, para
 * que la pantalla muestre un estado honesto en lugar de aceptar cualquier
 * codigo.
 *
 * Cuando exista el endpoint (contrato esperado: POST /auth/mfa/verify con
 * VerifyMfaDto -> LoginResponseDto), el cuerpo se reemplaza por:
 *
 *   const respuesta = await apiClient.post<RespuestaLogin>('/auth/mfa/verify', peticion);
 *   sessionService.iniciar(respuesta);
 *   return respuesta.usuario;
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
