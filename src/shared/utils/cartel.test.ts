import { describe, expect, it } from 'vitest';
import { cifraCartel, escalaAlias, escalaCifra, escalaNombre, leerInstantanea } from './cartel';

describe('leerInstantanea', () => {
  it('lee una instantanea completa del backend', () => {
    const datos = leerInstantanea(
      {
        criminalId: 'c-1',
        nombre: 'Monkey D. Luffy',
        alias: ['Sombrero de Paja'],
        recompensa: 3_000_000_000,
        moneda: 'BERRIES',
        nivelAmenaza: 'ALTO',
        estado: 'CAPTURADO',
        organizacion: 'Piratas del Sombrero de Paja',
        categoriaOrganizacion: 'PIRATA',
        fotoUrl: '/api/v1/archivos/fotos/c-1.png',
        textoLegal: 'Por orden del Gobierno Mundial.',
      },
      'c-1',
    );
    expect(datos).toMatchObject({
      nombre: 'Monkey D. Luffy',
      recompensa: 3_000_000_000,
      estado: 'CAPTURADO',
      categoriaOrganizacion: 'PIRATA',
    });
  });

  it('tolera versiones antiguas con campos faltantes o invalidos', () => {
    const datos = leerInstantanea(
      { nombre: '', alias: ['a', 3, ''], recompensa: '1200', estado: 'DESCONOCIDO' },
      'c-9',
    );
    expect(datos).toMatchObject({
      criminalId: 'c-9',
      nombre: 'Nombre desconocido',
      alias: ['a'],
      recompensa: 1200,
      estado: 'ACTIVO',
      nivelAmenaza: null,
      categoriaOrganizacion: null,
      fotoUrl: null,
    });
  });
});

describe('cifra y escalas del cartel', () => {
  it('pone puntos de miles y el guion final', () => {
    expect(cifraCartel(1_500_000_000)).toBe(`${(1_500_000_000).toLocaleString('es-CO')}-`);
    expect(cifraCartel(null)).toBe('SIN RECOMPENSA');
  });

  it('baja de cuerpo los montos y nombres largos', () => {
    expect(escalaCifra(cifraCartel(30_000_000))).toBe('larga');
    expect(escalaCifra(cifraCartel(5_000_000_000))).toBe('larga');
    expect(escalaCifra(cifraCartel(500_000_000_000))).toBe('muy-larga');
    expect(escalaCifra(cifraCartel(8000))).toBe('normal');
    expect(escalaNombre('Luffy')).toBe('normal');
    expect(escalaNombre('Charlotte Linlin la Gran Madre')).toBe('largo');
    expect(escalaNombre('Donquixote Doflamingo, el Demonio Celestial de Dressrosa')).toBe(
      'muy-largo',
    );
  });

  it('el alias baja de cuerpo en lugar de recortarse', () => {
    expect(escalaAlias('«Sombrero de Paja»')).toBe('normal');
    expect(escalaAlias('«El Cirujano de la Muerte del Mar del Norte»')).toBe('largo');
    expect(escalaAlias(`«${'Capitán '.repeat(9)}»`)).toBe('muy-largo');
  });
});
