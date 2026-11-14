import { describe, expect, it } from 'vitest';
import {
  formatearFecha,
  formatearMes,
  segundosDesde,
  tiempoRelativo,
  valorFechaHoraLocal,
  valorFechaLocal,
} from './fecha';

/**
 * Estas funciones vienen de la v1. Al extraerlas del componente se vuelven
 * probables, que es justo la razon de haberlas sacado de ahi.
 */
describe('valorFechaHoraLocal', () => {
  it('devuelve el formato que espera <input type="datetime-local">', () => {
    expect(valorFechaHoraLocal()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });
});

describe('formatearFecha', () => {
  it('avisa cuando no hay fecha', () => {
    expect(formatearFecha('')).toBe('Sin fecha');
  });

  it('formatea una fecha valida de forma legible', () => {
    const resultado = formatearFecha('2026-10-20T10:30:00');
    expect(resultado).not.toBe('Sin fecha');
    expect(resultado).toContain('2026');
  });

  it('devuelve el valor crudo si no es parseable, en lugar de romper', () => {
    expect(formatearFecha('no-es-una-fecha')).toBe('no-es-una-fecha');
  });
});

describe('tiempoRelativo', () => {
  const ahora = new Date('2026-11-12T15:00:00');
  const menos = (segundos: number): Date => new Date(ahora.getTime() - segundos * 1000);

  it('escala de segundos a dias', () => {
    expect(tiempoRelativo(menos(3), ahora)).toBe('hace un momento');
    expect(tiempoRelativo(menos(25), ahora)).toBe('hace 25 s');
    expect(tiempoRelativo(menos(3 * 60), ahora)).toBe('hace 3 min');
    expect(tiempoRelativo(menos(2 * 3600), ahora)).toBe('hace 2 h');
  });

  it('dice "ayer a las…" para el dia anterior', () => {
    expect(tiempoRelativo(new Date('2026-11-11T09:30:00'), ahora)).toMatch(/^ayer a las /);
  });

  it('mas atras muestra la fecha', () => {
    expect(tiempoRelativo(new Date('2026-10-01T09:30:00'), ahora)).toContain('2026');
  });

  it('una fecha futura (relojes desfasados entre bases) no dice "dentro de"', () => {
    expect(tiempoRelativo(new Date(ahora.getTime() + 30_000), ahora)).toBe('hace un momento');
  });

  it('acepta ISO, Date y nulos', () => {
    expect(tiempoRelativo('2026-11-12T14:59:00', ahora)).toBe('hace 1 min');
    expect(tiempoRelativo(null, ahora)).toBe('sin registro');
    expect(tiempoRelativo('no-es-fecha', ahora)).toBe('sin registro');
  });
});

describe('formatos auxiliares', () => {
  it('valorFechaLocal da AAAA-MM-DD', () => {
    expect(valorFechaLocal(new Date('2026-11-12T23:30:00'))).toBe('2026-11-12');
  });

  it('segundosDesde devuelve null si no es fecha', () => {
    expect(segundosDesde('x')).toBeNull();
  });

  it('formatearMes capitaliza el mes', () => {
    expect(formatearMes('2026-11-12T10:00:00')).toMatch(/^Noviembre/);
  });
});
