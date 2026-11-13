/**
 * Utilidades de fecha. `valorFechaHoraLocal` y `formatearFecha` vienen de la v1
 * (frontend/src/App.tsx); el resto se agrego para los datos sincronizados.
 *
 * El backend envia fechas ISO 8601 (`2026-11-12T20:15:00.000Z`).
 */

export type FechaEntrada = string | Date | null | undefined;

function aFecha(valor: FechaEntrada): Date | null {
  if (!valor) return null;
  const fecha = valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/** Valor para un <input type="datetime-local"> con la hora local actual. */
export function valorFechaHoraLocal(base: Date = new Date()): string {
  const desfase = base.getTimezoneOffset();
  return new Date(base.getTime() - desfase * 60_000).toISOString().slice(0, 16);
}

/** Valor para un <input type="date"> (AAAA-MM-DD, hora local). */
export function valorFechaLocal(base: Date = new Date()): string {
  return valorFechaHoraLocal(base).slice(0, 10);
}

/** Fecha y hora legibles en es-CO. Si el valor no es parseable, lo muestra crudo. */
export function formatearFecha(valor: FechaEntrada): string {
  if (!valor) return 'Sin fecha';

  const fecha = aFecha(valor);
  if (!fecha) {
    return String(valor).replace('T', ' ');
  }

  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(
    fecha,
  );
}

/** Solo la fecha: "12 nov 2026". */
export function formatearSoloFecha(valor: FechaEntrada): string {
  const fecha = aFecha(valor);
  if (!fecha) return valor ? String(valor) : 'Sin fecha';
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(fecha);
}

/** "Noviembre de 2026": cabeceras del reporte mensual. */
export function formatearMes(valor: FechaEntrada): string {
  const fecha = aFecha(valor);
  if (!fecha) return 'Sin fecha';
  const texto = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(fecha);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Tiempo transcurrido, para "Actualizado hace…":
 *   < 10 s          "hace un momento"
 *   < 60 s          "hace 25 s"
 *   < 60 min        "hace 3 min"
 *   < 24 h          "hace 2 h"
 *   ayer            "ayer a las 14:05"
 *   resto           fecha corta "3 nov 2026"
 * Una fecha futura (relojes desfasados entre bases) se trata como "hace un momento".
 */
export function tiempoRelativo(valor: FechaEntrada, ahora: Date = new Date()): string {
  const fecha = aFecha(valor);
  if (!fecha) return 'sin registro';

  const segundos = Math.floor((ahora.getTime() - fecha.getTime()) / 1000);
  if (segundos < 10) return 'hace un momento';
  if (segundos < 60) return `hace ${segundos} s`;

  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;

  const ayer = new Date(ahora);
  ayer.setDate(ahora.getDate() - 1);
  if (fecha.toDateString() === ayer.toDateString()) {
    const hora = new Intl.DateTimeFormat('es-CO', { timeStyle: 'short' }).format(fecha);
    return `ayer a las ${hora}`;
  }

  return formatearSoloFecha(fecha);
}

/** Segundos transcurridos (para decidir si un dato esta "viejo"). */
export function segundosDesde(valor: FechaEntrada, ahora: Date = new Date()): number | null {
  const fecha = aFecha(valor);
  return fecha ? Math.floor((ahora.getTime() - fecha.getTime()) / 1000) : null;
}

/** ISO completo para `<time dateTime>`; cadena vacia si no es fecha. */
export function aIso(valor: FechaEntrada): string {
  return aFecha(valor)?.toISOString() ?? '';
}
