import { useSyncExternalStore } from 'react';

/**
 * Reloj compartido para los textos relativos ("hace 3 min"). Un solo
 * intervalo para toda la pagina, sin importar cuantos ActualizadoHace haya:
 * una tabla de 50 filas no abre 50 temporizadores.
 */
const INTERVALO_MS = 15_000;

let ahora = Date.now();
const oyentes = new Set<() => void>();
let intervalo: ReturnType<typeof setInterval> | null = null;

function suscribir(oyente: () => void): () => void {
  oyentes.add(oyente);
  if (!intervalo) {
    intervalo = setInterval(() => {
      ahora = Date.now();
      oyentes.forEach((o) => o());
    }, INTERVALO_MS);
  }
  return () => {
    oyentes.delete(oyente);
    if (oyentes.size === 0 && intervalo) {
      clearInterval(intervalo);
      intervalo = null;
    }
  };
}

/**
 * Lectura estable: devuelve el mismo valor dentro de una ventana de 15 s (React
 * exige que getSnapshot no cambie entre dos llamadas seguidas), pero nunca uno
 * mas viejo que eso. Sin esto, un componente montado minutos despues de cargar
 * el modulo calculaba "hace…" contra una hora vieja hasta el primer tic.
 */
function leer(): number {
  const real = Date.now();
  if (Math.abs(real - ahora) >= INTERVALO_MS) ahora = real;
  return ahora;
}

/** Marca de tiempo que se actualiza cada 15 s. */
export function useAhora(): number {
  return useSyncExternalStore(suscribir, leer, leer);
}
