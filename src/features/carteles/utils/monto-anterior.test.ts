import { describe, expect, it } from 'vitest';
import type { Cartel } from '../models/cartel';
import { montoAnterior } from './monto-anterior';

function version(numeroVersion: number, recompensa: number | null): Cartel {
  return {
    id: `v-${numeroVersion}`,
    criminalId: 'c-1',
    numeroVersion,
    vigente: false,
    motivoGeneracion: 'CAMBIO_RECOMPENSA',
    generadoPor: null,
    generadoEn: '2026-11-01T10:00:00Z',
    archivoUrl: '',
    tamanoBytes: 0,
    descargas: { pdf: '', imagen: '' },
    datos: { nombre: 'Prueba', recompensa },
  };
}

describe('montoAnterior', () => {
  it('sin version anterior da null', () => {
    const v1 = version(1, 100);
    expect(montoAnterior([v1], v1, 'c-1')).toBeNull();
  });

  it('anterior con el mismo monto da null', () => {
    const v2 = version(2, 100);
    expect(montoAnterior([version(1, 100), v2], v2, 'c-1')).toBeNull();
  });

  it('devuelve el monto de la version inmediatamente anterior', () => {
    const v3 = version(3, 300);
    // Desordenadas a proposito: el backend no promete orden.
    expect(montoAnterior([v3, version(1, 100), version(2, 200)], v3, 'c-1')).toBe(200);
  });
});
