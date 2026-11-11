import { ApiError, type ApiErrorBody } from '../models/api-response';
import { notificar } from '../services/notification.store';
import { useSessionStore } from '../session/session.store';
import { tokenStore } from '../session/token.store';
import type { Interceptor } from './types';

/**
 * Traduce los errores HTTP a mensajes para el usuario en un solo lugar.
 * Sin esto, cada feature inventa su propio manejo y el usuario ve seis estilos
 * distintos de mensaje para el mismo 403.
 *
 * Lanza ApiError para que la feature pueda reaccionar ademas si lo necesita
 * (por ejemplo, recargar tras un 409 de concurrencia).
 */
export const errorInterceptor: Interceptor = async (peticion, siguiente) => {
  let respuesta: Response;

  try {
    respuesta = await siguiente(peticion);
  } catch {
    // Fallo de red: el backend no respondio.
    notificar.error('Sin conexion con el servidor. Verifica que la API este arriba.');
    throw new ApiError(0, 'SIN_CONEXION', 'Sin conexion con el servidor.');
  }

  if (respuesta.ok) {
    return respuesta;
  }

  const cuerpo = (await respuesta.json().catch(() => null)) as ApiErrorBody | null;
  const mensajeApi = cuerpo?.error?.message;
  const codigo = cuerpo?.error?.codigo ?? 'HTTP';

  switch (respuesta.status) {
    case 401:
      // Token invalido o expirado: no tiene sentido mostrar el error, hay que
      // reautenticar. Al limpiar la sesion, RequireAuth redirige al login.
      tokenStore.limpiar();
      useSessionStore.getState().limpiar();
      break;
    case 403:
      notificar.error(mensajeApi ?? 'Tu rol no tiene autorizacion para esta accion.');
      break;
    case 404:
      notificar.error(mensajeApi ?? 'El registro solicitado no existe.');
      break;
    case 409:
      notificar.error(
        mensajeApi ?? 'Otro usuario modifico este registro. Recarga y vuelve a intentar.',
      );
      break;
    case 400:
    case 422:
      notificar.error(mensajeApi ?? 'Los datos enviados no son validos.');
      break;
    default:
      if (respuesta.status >= 500) {
        notificar.error('Error del servidor. Intenta de nuevo en unos minutos.');
      }
  }

  throw new ApiError(respuesta.status, codigo, mensajeApi ?? `Error HTTP ${respuesta.status}`);
};
