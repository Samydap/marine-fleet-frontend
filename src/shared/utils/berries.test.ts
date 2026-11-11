import { describe, expect, it } from 'vitest';
import { formatearBerries } from './berries';

/** PRUEBA DE REFERENCIA para logica pura: sin DOM, sin mocks. */
describe('formatearBerries', () => {
  it('indica cuando no hay recompensa', () => {
    expect(formatearBerries(null)).toBe('Sin recompensa');
    expect(formatearBerries(undefined)).toBe('Sin recompensa');
  });

  it('formatea el monto completo con separador de miles', () => {
    expect(formatearBerries(3_000_000_000)).toContain('000');
    expect(formatearBerries(3_000_000_000)).toContain('฿');
  });

  it('abrevia los miles de millones', () => {
    expect(formatearBerries(3_000_000_000, true)).toBe('3 MM ฿');
  });

  it('abrevia los millones', () => {
    expect(formatearBerries(1_500_000, true)).toBe('1,5 M ฿');
  });

  it('no abrevia montos pequenos', () => {
    expect(formatearBerries(5000, true)).toBe('5.000 ฿');
  });

  it('trata el cero como un monto, no como ausencia de recompensa', () => {
    expect(formatearBerries(0)).toBe('0 ฿');
  });
});
