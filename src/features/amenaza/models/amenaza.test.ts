import { describe, expect, it } from 'vitest';
import {
  agregarTendencias,
  agruparVersiones,
  completarNiveles,
  construirCriterios,
  cortesDeCriterios,
  validarCortes,
  type CriterioAmenaza,
  type FilaTendencia,
} from './amenaza';

function criterio(
  nivel: CriterioAmenaza['nivel'],
  min: number,
  max: number | null,
  desde: string,
  vigente = true,
): CriterioAmenaza {
  return {
    id: `${nivel}-${desde}`,
    nivel,
    montoMinimo: min,
    montoMaximo: max,
    vigente,
    vigenteDesde: desde,
    vigenteHasta: null,
    modificadoPor: null,
    motivo: null,
  };
}

function filaT(grupo: string, subgrupo: string | null, activos: number): FilaTendencia {
  return {
    grupo,
    subgrupo,
    totalCriminales: activos,
    activos,
    capturados: 0,
    muertos: 0,
    recompensaActiva: activos * 10,
    avistamientosRecientes: 1,
  };
}

describe('criterios', () => {
  it('construye tres rangos contiguos con Bajo desde 1 y Alto sin techo', () => {
    expect(construirCriterios({ techoBajo: 149_999_999, techoMedio: 999_999_999 })).toEqual([
      { nivel: 'BAJO', montoMinimo: 1, montoMaximo: 149_999_999 },
      { nivel: 'MEDIO', montoMinimo: 150_000_000, montoMaximo: 999_999_999 },
      { nivel: 'ALTO', montoMinimo: 1_000_000_000, montoMaximo: null },
    ]);
  });

  it('lee los cortes de los criterios vigentes', () => {
    const vigentes = [
      criterio('BAJO', 1, 100, '2026-01-01T00:00:00Z'),
      criterio('MEDIO', 101, 500, '2026-01-01T00:00:00Z'),
      criterio('ALTO', 501, null, '2026-01-01T00:00:00Z'),
    ];
    expect(cortesDeCriterios(vigentes)).toEqual({ techoBajo: 100, techoMedio: 500 });
    expect(cortesDeCriterios([])).toBeNull();
  });

  it('valida el orden de los cortes y el motivo', () => {
    expect(validarCortes(100, 500, 'Ajuste anual')).toEqual({});
    expect(validarCortes(null, 500, 'Ajuste anual').techoBajo).toBeDefined();
    expect(validarCortes(500, 500, 'Ajuste anual').techoMedio).toMatch(/mayor/);
    expect(validarCortes(100, 500, 'abc').motivo).toMatch(/5 caracteres/);
  });

  it('agrupa el historial en versiones, la mas reciente primero', () => {
    const versiones = agruparVersiones([
      criterio('BAJO', 1, 100, '2026-01-01T00:00:00Z', false),
      criterio('MEDIO', 101, 500, '2026-01-01T00:00:00Z', false),
      criterio('ALTO', 501, null, '2026-01-01T00:00:00Z', false),
      criterio('ALTO', 901, null, '2026-06-01T10:00:00Z'),
      criterio('BAJO', 1, 200, '2026-06-01T10:00:00Z'),
      criterio('MEDIO', 201, 900, '2026-06-01T10:00:00Z'),
    ]);
    expect(versiones).toHaveLength(2);
    expect(versiones[0].vigente).toBe(true);
    expect(versiones[0].criterios.map((c) => c.nivel)).toEqual(['BAJO', 'MEDIO', 'ALTO']);
    expect(versiones[1].vigente).toBe(false);
  });
});

describe('completarNiveles', () => {
  it('completa los niveles faltantes y los ordena del mas grave al menos grave', () => {
    const niveles = completarNiveles([{ nivel: 'BAJO', total: 3, porcentaje: 100 }]);
    expect(niveles.map((n) => n.nivel)).toEqual(['ALTO', 'MEDIO', 'BAJO', 'PENDIENTE']);
    expect(niveles[2].total).toBe(3);
    expect(niveles[0].total).toBe(0);
  });
});

describe('agregarTendencias', () => {
  it('por zona suma al mar y respeta el orden geografico', () => {
    const barras = agregarTendencias(
      {
        agrupacion: 'zona',
        filas: [
          filaT('Wano', 'Grand Line', 4),
          filaT('Loguetown', 'East Blue', 2),
          filaT('Shells Town', 'East Blue', 1),
        ],
      },
      ['East Blue', 'West Blue', 'Grand Line'],
    );
    expect(barras.map((b) => [b.clave, b.activos])).toEqual([
      ['East Blue', 3],
      ['Grand Line', 4],
    ]);
  });

  it('por afiliacion agrupa por tipo de criminal en orden fijo', () => {
    const barras = agregarTendencias({
      agrupacion: 'afiliacion',
      filas: [
        filaT('SIN_AFILIACION', 'Sin afiliacion', 1),
        filaT('PIRATA', 'Tripulación A', 2),
        filaT('PIRATA', 'Tripulación B', 3),
        filaT('REVOLUCIONARIO', 'Ejército', 1),
      ],
    });
    expect(barras.map((b) => [b.clave, b.activos])).toEqual([
      ['PIRATA', 5],
      ['REVOLUCIONARIO', 1],
      ['SIN_AFILIACION', 1],
    ]);
  });

  it('por nivel ordena de Alto a Sin clasificar', () => {
    const barras = agregarTendencias({
      agrupacion: 'nivel',
      filas: [filaT('BAJO', null, 1), filaT('PENDIENTE', null, 1), filaT('ALTO', null, 1)],
    });
    expect(barras.map((b) => b.clave)).toEqual(['ALTO', 'BAJO', 'PENDIENTE']);
  });
});
