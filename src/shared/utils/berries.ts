/**
 * Formatea montos de recompensa. Las cifras del universo llegan a miles de
 * millones, asi que se abrevian para que quepan en una tabla.
 *
 *   formatearBerries(3000000000)        -> "3.000.000.000 ฿"
 *   formatearBerries(3000000000, true)  -> "3 MM ฿"
 */
export function formatearBerries(valor: number | null | undefined, abreviado = false): string {
  if (valor === null || valor === undefined) {
    return 'Sin recompensa';
  }

  if (!abreviado) {
    return `${valor.toLocaleString('es-CO')} ฿`;
  }

  if (valor >= 1_000_000_000) {
    return `${(valor / 1_000_000_000).toLocaleString('es-CO', { maximumFractionDigits: 2 })} MM ฿`;
  }
  if (valor >= 1_000_000) {
    return `${(valor / 1_000_000).toLocaleString('es-CO', { maximumFractionDigits: 1 })} M ฿`;
  }

  return `${valor.toLocaleString('es-CO')} ฿`;
}
