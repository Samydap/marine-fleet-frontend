import { describe, expect, it } from 'vitest';
import type { CriminalDetalle } from '../models/criminal';
import {
  aActualizarPayload,
  aCrearPayload,
  BORRADOR_VACIO,
  borradorDesde,
  normalizarAlias,
  validarBorrador,
} from './borrador-criminal';

const ORIGINAL: CriminalDetalle = {
  id: 'c-1',
  nombre: 'Monkey D. Luffy',
  alias: ['Sombrero de Paja'],
  edad: 19,
  descripcionFisica: 'Cicatriz bajo el ojo izquierdo',
  fotoUrl: null,
  estado: 'ACTIVO',
  nivelAmenaza: 'ALTO',
  recompensaVigenteMonto: 3_000_000_000,
  zonaInfluenciaId: 'z-wano',
  organizacion: null,
  fechaBaja: null,
  version: 7,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-11-01T00:00:00Z',
  afiliaciones: [],
  origenBaseId: null,
  creadoPor: null,
  actualizadoPor: null,
};

describe('validarBorrador', () => {
  it('exige nombre de al menos 2 letras', () => {
    expect(validarBorrador({ ...BORRADOR_VACIO }).nombre).toMatch(/Escribe el nombre/);
    expect(validarBorrador({ ...BORRADOR_VACIO, nombre: ' L ' }).nombre).toMatch(/al menos 2/);
    expect(validarBorrador({ ...BORRADOR_VACIO, nombre: 'Lu' }).nombre).toBeUndefined();
  });

  it('rechaza edades fuera de 0 a 500 o con decimales', () => {
    const base = { ...BORRADOR_VACIO, nombre: 'Zoro' };
    expect(validarBorrador({ ...base, edad: '-1' }).edad).toBeDefined();
    expect(validarBorrador({ ...base, edad: '501' }).edad).toBeDefined();
    expect(validarBorrador({ ...base, edad: '20.5' }).edad).toBeDefined();
    expect(validarBorrador({ ...base, edad: '0' }).edad).toBeUndefined();
    expect(validarBorrador({ ...base, edad: '' }).edad).toBeUndefined();
  });

  it('pide el rol si se eligio una organizacion', () => {
    const errores = validarBorrador({ ...BORRADOR_VACIO, nombre: 'Nami', organizacionId: 'org-1' });
    expect(errores.rolEnOrganizacion).toBeDefined();
  });

  it('limita la cantidad y el largo de los alias', () => {
    const muchos = Array.from({ length: 11 }, (_, i) => `alias ${i}`);
    expect(
      validarBorrador({ ...BORRADOR_VACIO, nombre: 'Usopp', alias: muchos }).alias,
    ).toBeDefined();
    expect(
      validarBorrador({ ...BORRADOR_VACIO, nombre: 'Usopp', alias: ['x'.repeat(101)] }).alias,
    ).toBeDefined();
  });
});

describe('normalizarAlias', () => {
  it('quita vacios, espacios sobrantes y repetidos sin distinguir mayusculas', () => {
    expect(normalizarAlias(['  Mugiwara ', '', 'mugiwara', 'Sombrero   de Paja'])).toEqual([
      'Mugiwara',
      'Sombrero de Paja',
    ]);
  });
});

describe('aCrearPayload', () => {
  it('solo envia los campos con valor y la afiliacion completa', () => {
    expect(aCrearPayload({ ...BORRADOR_VACIO, nombre: ' Nico Robin ', edad: '28' })).toEqual({
      nombre: 'Nico Robin',
      edad: 28,
    });
    expect(
      aCrearPayload({
        ...BORRADOR_VACIO,
        nombre: 'Robin',
        organizacionId: 'org-1',
        rolEnOrganizacion: 'OFICIAL',
      }),
    ).toMatchObject({ organizacionId: 'org-1', rolEnOrganizacion: 'OFICIAL' });
  });
});

describe('aActualizarPayload', () => {
  it('devuelve null si no hay cambios', () => {
    expect(aActualizarPayload(borradorDesde(ORIGINAL), ORIGINAL)).toBeNull();
  });

  it('envia solo lo que cambio con la version leida, y null al vaciar', () => {
    const borrador = { ...borradorDesde(ORIGINAL), edad: '', zonaInfluenciaId: 'z-sabaody' };
    expect(aActualizarPayload(borrador, ORIGINAL)).toEqual({
      version: 7,
      edad: null,
      zonaInfluenciaId: 'z-sabaody',
    });
  });
});
