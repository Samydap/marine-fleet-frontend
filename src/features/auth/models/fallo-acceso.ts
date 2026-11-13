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

/**
 * Errores de POST /auth/mfa/verify (auth/application/verify-mfa.use-case.ts):
 *   401 CODIGO_MFA_INVALIDO (cuenta como intento fallido) ·
 *   401 RETO_MFA_INVALIDO (el reto del login vencio a los 5 minutos o no es valido) ·
 *   401 SESION_INVALIDA (la cuenta cambio entre el login y el codigo).
 * El resto (cuenta bloqueada, sin conexion...) se describe igual que en el login.
 */
export function describirFalloMfa(fallo: unknown): FalloAcceso {
  if (fallo instanceof ApiError) {
    if (fallo.codigo === 'RETO_MFA_INVALIDO' || fallo.codigo === 'SESION_INVALIDA') {
      return {
        tipo: 'cuenta',
        titulo: 'La verificación venció',
        detalle:
          'Pasaron más de 5 minutos desde que escribiste tu contraseña. Vuelve a iniciar sesión para recibir una verificación nueva.',
      };
    }
    if (fallo.codigo === 'CODIGO_MFA_INVALIDO' || fallo.status === 401) {
      return {
        tipo: 'credenciales',
        titulo: 'Código incorrecto',
        detalle: `Los códigos cambian cada 30 segundos: escribe el que se muestra ahora. ${AVISO_BLOQUEO}`,
      };
    }
  }
  return describirFalloAcceso(fallo);
}
