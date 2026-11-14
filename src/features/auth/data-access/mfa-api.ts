import { apiClient } from '@core/http/api-client';
import type { UsuarioSesion } from '@core/session/permiso.enum';
import { sessionService, type RespuestaLogin } from '@core/session/session.service';

/** Espejo de VerifyMfaDto (auth/presentation/dto/verify-mfa.dto.ts). */
export interface VerificarMfaPeticion {
  readonly challengeToken: string;
  readonly codigo: string;
}

/**
 * Lo que la pantalla de MFA recibe por `location.state` desde el login cuando
 * el backend exige el segundo factor. `redirectTo` es la ruta protegida que el
 * usuario intentaba abrir antes de entrar.
 */
export interface RetoMfa {
  readonly challengeToken: string;
  readonly email: string;
  readonly redirectTo?: string;
}

export function esRetoMfa(valor: unknown): valor is RetoMfa {
  if (typeof valor !== 'object' || valor === null) return false;
  const reto = valor as Partial<RetoMfa>;
  return typeof reto.challengeToken === 'string' && typeof reto.email === 'string';
}

/**
 * POST /auth/mfa/verify (publico): canjea el reto del login + el codigo TOTP
 * por la sesion (LoginResponseDto). Un codigo incorrecto cuenta como intento
 * fallido; con 5 seguidos la cuenta se bloquea.
 */
export const mfaApi = {
  async verificar(peticion: VerificarMfaPeticion): Promise<UsuarioSesion> {
    const respuesta = await apiClient.post<RespuestaLogin>('/auth/mfa/verify', peticion);
    sessionService.iniciar(respuesta);
    return respuesta.usuario;
  },
};
