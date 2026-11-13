import { ApiError } from '@core/models/api-response';

/**
 * Como se presenta un intento de acceso fallido.
 *
 * - `credenciales`: el usuario puede corregirlo (correo o contraseña mal).
 * - `cuenta`: la cuenta no puede entrar aunque los datos sean correctos
 *   (bloqueada, inactiva o con el rol desactivado). Reintentar no sirve.
 * - `conexion`: el servidor no respondio o fallo. Reintentar si puede servir.
 */
export type TipoFalloAcceso = 'credenciales' | 'cuenta' | 'conexion';

export interface FalloAcceso {
  readonly tipo: TipoFalloAcceso;
  readonly titulo: string;
  readonly detalle: string;
}

const AVISO_BLOQUEO = 'Tras varios intentos fallidos seguidos, la cuenta se bloquea.';

/**
 * Traduce el error de POST /auth/login a un mensaje con salida.
 *
 * Codigos del backend (auth/application/login.use-case.ts y
 * usuarios/domain/usuario.entity.ts):
 *   401 CREDENCIALES_INVALIDAS · 400 CUENTA_BLOQUEADA · 400 CUENTA_INACTIVA ·
 *   400 ROL_INACTIVO · 400 HTTP (validacion del DTO).
 * El interceptor de errores agrega el 0 SIN_CONEXION cuando no hay respuesta.
 */
export function describirFalloAcceso(fallo: unknown): FalloAcceso {
  if (!(fallo instanceof ApiError)) {
    return {
      tipo: 'conexion',
      titulo: 'No se pudo iniciar sesión',
      detalle: 'Ocurrió un error inesperado. Inténtalo de nuevo en unos segundos.',
    };
  }

  switch (fallo.codigo) {
    case 'CREDENCIALES_INVALIDAS':
      return {
        tipo: 'credenciales',
        titulo: fallo.message || 'Correo o contraseña incorrectos.',
        detalle: `Revisa los datos e inténtalo de nuevo. ${AVISO_BLOQUEO}`,
      };
    case 'CUENTA_BLOQUEADA':
      return {
        tipo: 'cuenta',
        titulo: 'Cuenta bloqueada',
        detalle:
          'Se superó el número de intentos fallidos. Pide al administrador de usuarios de tu base naval que la desbloquee.',
      };
    case 'CUENTA_INACTIVA':
      return {
        tipo: 'cuenta',
        titulo: 'Cuenta inactiva',
        detalle:
          'Esta cuenta no está habilitada. Pide al administrador de usuarios de tu base naval que la reactive.',
      };
    case 'ROL_INACTIVO':
      return {
        tipo: 'cuenta',
        titulo: 'Rol sin acceso',
        detalle: `${fallo.message} Pide al administrador de usuarios que revise tu rol.`,
      };
    case 'SIN_CONEXION':
      return {
        tipo: 'conexion',
        titulo: 'Sin conexión con el servidor',
        detalle:
          'No hubo respuesta. Comprueba tu red o que el servicio esté disponible e inténtalo de nuevo; tus datos siguen en el formulario.',
      };
  }

  if (fallo.status >= 500) {
    return {
      tipo: 'conexion',
      titulo: 'El servidor no pudo atender la solicitud',
      detalle: 'Inténtalo de nuevo en unos segundos. Si persiste, avisa al equipo de sistemas.',
    };
  }

  if (fallo.status === 401) {
    return {
      tipo: 'credenciales',
      titulo: fallo.message || 'Correo o contraseña incorrectos.',
      detalle: `Revisa los datos e inténtalo de nuevo. ${AVISO_BLOQUEO}`,
    };
  }

  return {
    tipo: 'credenciales',
    titulo: 'No se pudo iniciar sesión',
    detalle: fallo.message,
  };
}

/** Errores del paso de verificacion en dos pasos (VerifyMfaDto). */
export function describirFalloMfa(fallo: unknown): FalloAcceso {
  if (fallo instanceof ApiError) {
    if (fallo.codigo === 'MFA_NO_DISPONIBLE') {
      return {
        tipo: 'conexion',
        titulo: 'Verificación no disponible',
        detalle: `${fallo.message} Vuelve a intentarlo más tarde o avisa al Especialista en Seguridad.`,
      };
    }
    if (fallo.status === 401) {
      return {
        tipo: 'credenciales',
        titulo: 'Código incorrecto o vencido',
        detalle: 'Los códigos cambian cada pocos segundos. Escribe el que se muestra ahora.',
      };
    }
  }
  return describirFalloAcceso(fallo);
}
