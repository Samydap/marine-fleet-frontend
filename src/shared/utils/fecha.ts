/**
 * Utilidades de fecha portadas desde la v1 (frontend/src/App.tsx).
 * Esta logica funcionaba y estaba probada en uso: se reutiliza tal cual, solo
 * extraida a shared/ para que no viva dentro de un componente.
 */

/** Valor para un <input type="datetime-local"> con la hora local actual. */
export function valorFechaHoraLocal(): string {
  const ahora = new Date();
  const desfase = ahora.getTimezoneOffset();
  return new Date(ahora.getTime() - desfase * 60_000).toISOString().slice(0, 16);
}

/** Fecha legible en es-CO. Si el valor no es parseable, lo muestra crudo. */
export function formatearFecha(valor: string): string {
  if (!valor) return 'Sin fecha';

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) {
    return valor.replace('T', ' ');
  }

  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(
    fecha,
  );
}
