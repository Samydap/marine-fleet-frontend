import { ApiError, type ApiErrorBody } from '../models/api-response';
import { notificar } from '../services/notification.store';
import type { Interceptor, Peticion } from './types';

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
    if (!peticion.silencioso && peticion.sinAviso !== true) {
      notificar.error('Sin conexión con el servidor. Comprueba tu red e inténtalo de nuevo.');
    }
    throw new ApiError(0, 'SIN_CONEXION', 'Sin conexión con el servidor.');
  }

  if (respuesta.ok) {
    return respuesta;
  }

  const cuerpo = (await respuesta.json().catch(() => null)) as ApiErrorBody | null;
  const codigo = cuerpo?.error?.codigo ?? 'HTTP';
  const mensaje = cuerpo?.error?.message ?? mensajePorDefecto(respuesta.status);

  // El 401 no se notifica: lo resuelve sesionInterceptor (renueva el token o
  // cierra la sesion). El mensaje viaja igual en el ApiError porque la pantalla
  // de login si necesita mostrarlo.
  if (respuesta.status !== 401 && debeAvisar(peticion, respuesta.status)) {
    notificar.error(mensaje);
  }

  throw new ApiError(respuesta.status, codigo, mensaje);
};

/** El aviso flotante solo cuando la pantalla no muestra ya el error en linea. */
function debeAvisar(peticion: Peticion, status: number): boolean {
  if (peticion.silencioso || peticion.sinAviso === true) return false;
  return !(peticion.sinAviso === 'conflicto' && status === 409);
}

/**
 * Mensaje para cuando la API no envio uno (o respondio algo que no es JSON,
 * como el 500 del proxy de Vite con el backend apagado). El ApiError siempre
 * lleva un texto presentable: hay pantallas que lo muestran tal cual.
 */
function mensajePorDefecto(status: number): string {
  const porEstado: Record<number, string> = {
    400: 'Los datos enviados no son válidos.',
    401: 'Tu sesión no es válida. Inicia sesión de nuevo.',
    403: 'Tu rol no tiene autorización para esta acción.',
    404: 'El registro solicitado no existe.',
    409: 'Otro usuario modificó este registro. Recarga y vuelve a intentar.',
    422: 'Los datos enviados no son válidos.',
    429: 'Demasiadas solicitudes seguidas. Espera un momento e inténtalo de nuevo.',
  };

  if (porEstado[status]) return porEstado[status];
  if (status >= 500)
    return 'El servidor no pudo completar la operación. Inténtalo en unos segundos.';
  return `Error HTTP ${status}`;
}
