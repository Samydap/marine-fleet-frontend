import { describe, expect, it } from 'vitest';
import { formatearFecha, valorFechaHoraLocal } from './fecha';

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
