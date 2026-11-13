import { describe, expect, it } from 'vitest';
import {
  etiquetaCategoria,
  etiquetaEstadoCriminal,
  opcionesCategoria,
  tonoEstadoCriminal,
} from './criminal';

describe('vocabulario del criminal', () => {
  it('nombra las tres categorias y la ausencia de afiliacion', () => {
    expect(etiquetaCategoria('PIRATA')).toBe('Pirata');
    expect(etiquetaCategoria('REVOLUCIONARIO')).toBe('Ejército Revolucionario');
    expect(etiquetaCategoria('CRIMINAL_INDEPENDIENTE')).toBe('Organización independiente');
    expect(etiquetaCategoria(null)).toBe('Sin afiliación');
  });

  it('ofrece las tres categorias como opciones de filtro', () => {
    expect(opcionesCategoria().map((o) => o.valor)).toEqual([
      'PIRATA',
      'REVOLUCIONARIO',
      'CRIMINAL_INDEPENDIENTE',
    ]);
  });

  it('mapea el estado a etiqueta y tono', () => {
    expect(etiquetaEstadoCriminal('ACTIVO')).toBe('En búsqueda');
    expect(tonoEstadoCriminal('ACTIVO')).toBe('aviso');
    expect(tonoEstadoCriminal('CAPTURADO')).toBe('exito');
    expect(tonoEstadoCriminal('MUERTO')).toBe('neutro');
  });
});
