import { describe, expect, it } from 'vitest';
import {
  aIsoDesdeLocal,
  esModificable,
  tonoVerificacion,
  validarAvistamiento,
  type AvistamientoPayload,
} from './avistamiento';
import { nombreInformante, tonoEstadoReporte, validarReporte } from './reporte';

const AHORA = new Date('2026-11-12T15:00:00');

const avistamiento = (cambio: Partial<AvistamientoPayload> = {}): AvistamientoPayload => ({
  criminalId: 'c-luffy',
  fechaHora: '2026-11-12T10:30',
  ubicacion: 'Puerto de Loguetown',
  ...cambio,
});

describe('validarAvistamiento', () => {
  it('acepta un avistamiento completo', () => {
    expect(validarAvistamiento(avistamiento(), AHORA)).toEqual({});
  });

  it('exige criminal, fecha y un lugar de al menos 3 caracteres', () => {
    const errores = validarAvistamiento(
      avistamiento({ criminalId: '', fechaHora: '', ubicacion: ' ab ' }),
      AHORA,
    );
    expect(Object.keys(errores).sort()).toEqual(['criminalId', 'fechaHora', 'ubicacion']);
  });

  it('rechaza fechas en el futuro', () => {
    const errores = validarAvistamiento(avistamiento({ fechaHora: '2026-11-13T10:00' }), AHORA);
    expect(errores.fechaHora).toMatch(/futuro/);
  });
});

describe('vocabulario de verificacion', () => {
  it('cada estado tiene su tono: pendiente informa, verificado es exito, descartado peligro', () => {
    expect(tonoVerificacion('PENDIENTE')).toBe('info');
    expect(tonoVerificacion('VERIFICADO')).toBe('exito');
    expect(tonoVerificacion('DESCARTADO')).toBe('peligro');
  });

  it('un verificado ya no se corrige ni se borra', () => {
    expect(esModificable({ estadoVerificacion: 'VERIFICADO' })).toBe(false);
    expect(esModificable({ estadoVerificacion: 'PENDIENTE' })).toBe(true);
    expect(esModificable({ estadoVerificacion: 'DESCARTADO' })).toBe(true);
  });

  it('convierte el valor de datetime-local a ISO con zona', () => {
    const iso = aIsoDesdeLocal('2026-11-12T10:30');
    expect(iso).toMatch(/Z$/);
    expect(new Date(iso).getTime()).toBe(new Date('2026-11-12T10:30').getTime());
    expect(aIsoDesdeLocal('no-es-fecha')).toBe('no-es-fecha');
  });
});

describe('validarReporte (formulario publico)', () => {
  const base = {
    criminalId: 'c-zoro',
    descripcion: 'Lo vi preguntando por el puerto tres veces.',
    ubicacion: 'Mercado de Loguetown',
    anonimo: true,
  };

  it('acepta un reporte valido', () => {
    expect(validarReporte(base)).toEqual({});
  });

  it('pide codigo, al menos 10 caracteres de relato y el lugar', () => {
    const errores = validarReporte({
      ...base,
      criminalId: ' ',
      descripcion: 'corto',
      ubicacion: '',
    });
    expect(errores.criminalId).toBeDefined();
    expect(errores.descripcion).toMatch(/10 caracteres/);
    expect(errores.ubicacion).toBeDefined();
  });

  it('rechaza un codigo mas largo que el que admite el backend', () => {
    expect(validarReporte({ ...base, criminalId: 'x'.repeat(37) }).criminalId).toBeDefined();
  });
});

describe('informante', () => {
  it('nunca muestra el nombre de un informante anonimo', () => {
    expect(nombreInformante({ anonimo: true, nombre: 'Vendedor', contacto: null })).toBe(
      'Informante anónimo',
    );
    expect(nombreInformante({ anonimo: false, nombre: '  ', contacto: null })).toBe(
      'Ciudadano sin nombre',
    );
    expect(nombreInformante({ anonimo: false, nombre: 'Vendedor', contacto: null })).toBe(
      'Vendedor',
    );
  });

  it('el tono del reporte sigue su estado', () => {
    expect(tonoEstadoReporte('PENDIENTE')).toBe('info');
    expect(tonoEstadoReporte('APROBADO')).toBe('exito');
    expect(tonoEstadoReporte('RECHAZADO')).toBe('peligro');
  });
});
