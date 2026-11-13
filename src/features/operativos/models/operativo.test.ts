import { describe, expect, it } from 'vitest';
import {
  aPayloadOperativo,
  agruparTablero,
  basesOrdenadas,
  puedeAbortar,
  puedeCerrar,
  puedeIniciar,
  validarOperativo,
  type BorradorOperativo,
  type Operativo,
} from './operativo';

function op(parcial: Partial<Operativo>): Operativo {
  return {
    id: 'o',
    codigo: 'OP-0001',
    nombre: 'Operativo',
    objetivoCriminalId: 'c-1',
    objetivo: null,
    descripcion: null,
    zonaInfluenciaId: 'z-1',
    baseLiderId: 'b-lider',
    estado: 'PLANIFICADO',
    prioridad: 'MEDIA',
    fechaInicioPlaneada: null,
    fechaInicioReal: null,
    fechaCierre: null,
    resultadoFinal: null,
    observacionesCierre: null,
    bases: [],
    responsables: [],
    version: 1,
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
    ...parcial,
  };
}

const BORRADOR: BorradorOperativo = {
  nombre: 'Captura en Loguetown',
  objetivoCriminalId: 'c-luffy',
  fechaInicioPlaneada: '2026-11-20T06:00',
  objetivo: '  ',
  descripcion: '',
  prioridad: 'ALTA',
  zonaInfluenciaId: '',
  baseLiderId: 'b-153',
  unidadesLider: '12',
  recursosLider: ' 2 buques ',
};

describe('validarOperativo', () => {
  it('acepta un borrador completo', () => {
    expect(validarOperativo(BORRADOR)).toEqual({});
  });

  it('exige nombre de 3+, criminal, fecha y unidades enteras', () => {
    const errores = validarOperativo({
      ...BORRADOR,
      nombre: 'ab',
      objetivoCriminalId: '',
      fechaInicioPlaneada: '',
      unidadesLider: '-2',
    });
    expect(Object.keys(errores).sort()).toEqual(
      ['fechaInicioPlaneada', 'nombre', 'objetivoCriminalId', 'unidadesLider'].sort(),
    );
  });

  it('rechaza nombres de mas de 150 caracteres', () => {
    expect(validarOperativo({ ...BORRADOR, nombre: 'x'.repeat(151) }).nombre).toBeDefined();
  });
});

describe('aPayloadOperativo', () => {
  it('omite opcionales vacios, recorta textos y convierte fecha y unidades', () => {
    const p = aPayloadOperativo(BORRADOR);
    expect(p.objetivo).toBeUndefined();
    expect(p.zonaInfluenciaId).toBeUndefined();
    expect(p.recursosLider).toBe('2 buques');
    expect(p.unidadesLider).toBe(12);
    expect(p.fechaInicioPlaneada).toMatch(/^2026-11-\d{2}T\d{2}:00:00\.000Z$/);
  });
});

describe('agruparTablero', () => {
  it('en curso arriba, luego planificados y al final el archivo; dentro, prioridad y recencia', () => {
    const grupos = agruparTablero([
      op({ id: 'a', estado: 'CERRADO' }),
      op({ id: 'b', estado: 'PLANIFICADO', prioridad: 'BAJA' }),
      op({ id: 'c', estado: 'PLANIFICADO', prioridad: 'CRITICA' }),
      op({ id: 'd', estado: 'EN_CURSO' }),
      op({ id: 'e', estado: 'ABORTADO', updatedAt: '2026-11-05T00:00:00Z' }),
    ]);
    expect(grupos.map((g) => g.clave)).toEqual(['activos', 'planificados', 'archivo']);
    expect(grupos[1].operativos.map((o) => o.id)).toEqual(['c', 'b']);
    expect(grupos[2].operativos.map((o) => o.id)).toEqual(['e', 'a']);
  });

  it('omite los grupos vacios', () => {
    expect(agruparTablero([op({ estado: 'EN_CURSO' })]).map((g) => g.clave)).toEqual(['activos']);
  });
});

describe('basesOrdenadas', () => {
  it('pone la base lider primero aunque no venga en la lista', () => {
    const lista = basesOrdenadas(
      op({
        bases: [
          {
            baseNavalId: 'b-apoyo',
            rolParticipacion: 'APOYO',
            unidadesAsignadas: 3,
            recursos: null,
            confirmada: false,
            observaciones: null,
          },
        ],
      }),
    );
    expect(lista.map((b) => b.baseNavalId)).toEqual(['b-lider', 'b-apoyo']);
    expect(lista[0].rolParticipacion).toBe('LIDER');
  });
});

describe('transiciones', () => {
  it('replican las del backend', () => {
    expect(puedeIniciar('PLANIFICADO')).toBe(true);
    expect(puedeIniciar('EN_CURSO')).toBe(false);
    expect(puedeCerrar('EN_CURSO')).toBe(true);
    expect(puedeCerrar('PLANIFICADO')).toBe(false);
    expect(puedeAbortar('EN_CURSO')).toBe(true);
    expect(puedeAbortar('CERRADO')).toBe(false);
    expect(puedeAbortar('ABORTADO')).toBe(false);
  });
});
