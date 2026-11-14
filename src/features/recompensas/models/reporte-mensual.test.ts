import { describe, expect, it } from 'vitest';
import {
  desplazarPeriodo,
  esPeriodoValido,
  ordenarPorMar,
  participacion,
  periodoActual,
  type FilaRecompensasPorMar,
} from './reporte-mensual';

function fila(marId: string, marNombre: string): FilaRecompensasPorMar {
  return { marId, marNombre, tipoMar: 'CUATRO_MARES', totalAcumulado: 0, cantidadCriminales: 0 };
}

describe('reporte mensual', () => {
  it('ordena los Cuatro Mares y deja la Grand Line al final', () => {
    const ordenadas = ordenarPorMar([
      fila('m-grand-line', 'Grand Line'),
      fila('m-south-blue', 'South Blue'),
      fila('m-east-blue', 'East Blue'),
      fila('m-north-blue', 'North Blue'),
      fila('m-west-blue', 'West Blue'),
    ]);
    expect(ordenadas.map((f) => f.marNombre)).toEqual([
      'East Blue',
      'West Blue',
      'North Blue',
      'South Blue',
      'Grand Line',
    ]);
  });

  it('calcula la participacion con un decimal y sin dividir por cero', () => {
    expect(participacion(1, 3)).toBe(33.3);
    expect(participacion(5, 0)).toBe(0);
  });

  it('mueve periodos entre anios', () => {
    expect(desplazarPeriodo('2026-01', -1)).toBe('2025-12');
    expect(desplazarPeriodo('2026-12', 1)).toBe('2027-01');
    expect(periodoActual(new Date(2026, 10, 13))).toBe('2026-11');
  });

  it('valida el formato YYYY-MM', () => {
    expect(esPeriodoValido('2026-11')).toBe(true);
    expect(esPeriodoValido('2026-13')).toBe(false);
    expect(esPeriodoValido('')).toBe(false);
  });
});
