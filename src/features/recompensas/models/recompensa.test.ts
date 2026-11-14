import { describe, expect, it } from 'vitest';
import {
  UMBRAL_ALTO_RANGO,
  esAltoRango,
  etiquetaEstadoRecompensa,
  leerMonto,
  nivelEstimado,
  tonoEstadoRecompensa,
  validarSolicitud,
  type RangoAmenaza,
} from './recompensa';

const RANGOS: RangoAmenaza[] = [
  { nivel: 'BAJO', montoMinimo: 1, montoMaximo: 149_999_999 },
  { nivel: 'MEDIO', montoMinimo: 150_000_000, montoMaximo: 999_999_999 },
  { nivel: 'ALTO', montoMinimo: 1_000_000_000, montoMaximo: null },
];

const ACTIVO = { estado: 'ACTIVO' as const, recompensaVigenteMonto: 30_000_000 };

describe('leerMonto', () => {
  it('acepta separadores de miles', () => {
    expect(leerMonto('1.500.000.000')).toBe(1_500_000_000);
    expect(leerMonto('1 500 000')).toBe(1_500_000);
    expect(leerMonto('5,000,000,000')).toBe(5_000_000_000);
  });

  it('rechaza texto, signos y vacio', () => {
    expect(leerMonto('')).toBeNull();
    expect(leerMonto('abc')).toBeNull();
    expect(leerMonto('-5')).toBeNull();
  });
});

describe('esAltoRango', () => {
  it('empieza exactamente en el umbral del Almirante', () => {
    expect(esAltoRango(UMBRAL_ALTO_RANGO - 1)).toBe(false);
    expect(esAltoRango(UMBRAL_ALTO_RANGO)).toBe(true);
    expect(esAltoRango(null)).toBe(false);
  });
});

describe('validarSolicitud', () => {
  it('pide criminal y monto', () => {
    const e = validarSolicitud({ criminal: null, montoTexto: '', motivo: '' });
    expect(e.criminal).toBeDefined();
    expect(e.monto).toBe('Escribe el monto en berries.');
  });

  it('no acepta un criminal capturado', () => {
    const e = validarSolicitud({
      criminal: { estado: 'CAPTURADO', recompensaVigenteMonto: null },
      montoTexto: '100',
      motivo: '',
    });
    expect(e.criminal).toMatch(/en búsqueda/);
  });

  it('rechaza cero, texto, el mismo monto vigente y montos fuera de rango', () => {
    expect(validarSolicitud({ criminal: ACTIVO, montoTexto: '0', motivo: '' }).monto).toMatch(
      /al menos 1/,
    );
    expect(validarSolicitud({ criminal: ACTIVO, montoTexto: '12a', motivo: '' }).monto).toMatch(
      /solo cifras/,
    );
    expect(
      validarSolicitud({ criminal: ACTIVO, montoTexto: '30.000.000', motivo: '' }).monto,
    ).toMatch(/mismo monto/);
    expect(
      validarSolicitud({ criminal: ACTIVO, montoTexto: '99999999999999', motivo: '' }).monto,
    ).toMatch(/máximo/);
  });

  it('el motivo es opcional pero, si se escribe, tiene al menos 3 caracteres', () => {
    expect(validarSolicitud({ criminal: ACTIVO, montoTexto: '5', motivo: '' })).toEqual({});
    expect(
      validarSolicitud({ criminal: ACTIVO, montoTexto: '5', motivo: 'ab' }).motivo,
    ).toBeDefined();
  });
});

describe('estado de la recompensa', () => {
  it('solo la vigente firmada por el Almirante lleva el tono de autoridad', () => {
    expect(tonoEstadoRecompensa({ estado: 'VIGENTE', validadaPor: 'u-almirante' })).toBe(
      'autoridad',
    );
    expect(tonoEstadoRecompensa({ estado: 'VIGENTE', validadaPor: null })).toBe('exito');
    expect(tonoEstadoRecompensa({ estado: 'PENDIENTE_VALIDACION', validadaPor: null })).toBe(
      'aviso',
    );
    expect(tonoEstadoRecompensa({ estado: 'RECHAZADA', validadaPor: 'u' })).toBe('peligro');
    expect(tonoEstadoRecompensa({ estado: 'HISTORICA', validadaPor: null })).toBe('neutro');
  });

  it('nombra la vigente validada', () => {
    expect(etiquetaEstadoRecompensa({ estado: 'VIGENTE', validadaPor: 'u' })).toBe(
      'Vigente, validada',
    );
    expect(etiquetaEstadoRecompensa({ estado: 'PENDIENTE_VALIDACION', validadaPor: null })).toBe(
      'Pendiente de validación',
    );
  });
});

describe('nivelEstimado', () => {
  it('clasifica por los rangos vigentes', () => {
    expect(nivelEstimado(1, RANGOS)).toBe('BAJO');
    expect(nivelEstimado(150_000_000, RANGOS)).toBe('MEDIO');
    expect(nivelEstimado(5_000_000_000, RANGOS)).toBe('ALTO');
  });

  it('sin monto queda sin clasificar y sin criterios no estima', () => {
    expect(nivelEstimado(null, RANGOS)).toBe('PENDIENTE');
    expect(nivelEstimado(10, [])).toBeNull();
  });
});
