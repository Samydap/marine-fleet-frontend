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
  const codigo = cuerpo?.error?.codigo ?? 'HTTP';
  const mensaje = cuerpo?.error?.message ?? mensajePorDefecto(respuesta.status);

  if (respuesta.status === 401) {
    // Token invalido o expirado: no se notifica, hay que reautenticar. Al
    // limpiar la sesion, RequireAuth redirige al login. El mensaje viaja igual
    // en el ApiError porque la pantalla de login si necesita mostrarlo.
    tokenStore.limpiar();
    useSessionStore.getState().limpiar();
  } else {
    notificar.error(mensaje);
  }

  throw new ApiError(respuesta.status, codigo, mensaje);
};

/**
 * Mensaje para cuando la API no envio uno (o respondio algo que no es JSON,
 * como el 500 del proxy de Vite con el backend apagado). El ApiError siempre
 * lleva un texto presentable: hay pantallas que lo muestran tal cual.
 */
function mensajePorDefecto(status: number): string {
  const porEstado: Record<number, string> = {
    400: 'Los datos enviados no son validos.',
    401: 'Tu sesion no es valida. Inicia sesion de nuevo.',
    403: 'Tu rol no tiene autorizacion para esta accion.',
    404: 'El registro solicitado no existe.',
    409: 'Otro usuario modifico este registro. Recarga y vuelve a intentar.',
    422: 'Los datos enviados no son validos.',
  };

  if (porEstado[status]) return porEstado[status];
  if (status >= 500) return 'No se pudo completar la operacion. Verifica que la API este arriba.';
  return `Error HTTP ${status}`;
}
