import { describe, expect, it } from 'vitest';
import {
  aPayloadIncidente,
  cambiaEstadoCriminal,
  limiteDelDia,
  resumirNombres,
  tonoResultado,
  validarIncidente,
  type FormularioIncidente,
} from './incidente';

const AHORA = new Date('2026-11-12T15:00:00');

const formulario = (cambio: Partial<FormularioIncidente> = {}): FormularioIncidente => ({
  tipo: 'ENFRENTAMIENTO',
  fechaHora: '2026-11-12T10:30',
  ubicacion: 'Puerto de Loguetown, muelle 3',
  descripcion: 'Intercambio de disparos.',
  zonaInfluenciaId: '',
  baseNavalId: 'b-153',
  operativoId: '',
  resultado: 'EN_CURSO',
  observaciones: '',
  bajasMarina: '',
  bajasEnemigas: '',
  criminales: [
    { clave: 'a', criminalId: 'c-luffy', rolEnIncidente: 'OBJETIVO', desenlace: 'CAPTURADO' },
  ],
  marinos: [],
  ...cambio,
});

describe('validarIncidente', () => {
  it('acepta un registro completo', () => {
    expect(validarIncidente(formulario(), AHORA)).toEqual({});
  });

  it('exige al menos un criminal y que no se repita', () => {
    expect(validarIncidente(formulario({ criminales: [] }), AHORA).criminales).toBeDefined();

    const repetido = validarIncidente(
      formulario({
        criminales: [
          {
            clave: 'a',
            criminalId: 'c-luffy',
            rolEnIncidente: 'OBJETIVO',
            desenlace: 'DESCONOCIDO',
          },
          {
            clave: 'b',
            criminalId: 'c-luffy',
            rolEnIncidente: 'COMPLICE',
            desenlace: 'DESCONOCIDO',
          },
          { clave: 'c', criminalId: '', rolEnIncidente: 'TESTIGO', desenlace: 'DESCONOCIDO' },
        ],
      }),
      AHORA,
    );
    expect(repetido['criminal-0']).toBeUndefined();
    expect(repetido['criminal-1']).toMatch(/ya está/);
    expect(repetido['criminal-2']).toMatch(/Elige/);
  });

  it('valida fecha futura, lugar, marinos sin nombre y bajas no enteras', () => {
    const errores = validarIncidente(
      formulario({
        fechaHora: '2026-11-14T10:00',
        ubicacion: 'a',
        marinos: [{ clave: 'm', nombre: ' ', rango: '' }],
        bajasMarina: '-1',
        bajasEnemigas: '2.5',
      }),
      AHORA,
    );
    expect(Object.keys(errores).sort()).toEqual([
      'bajasEnemigas',
      'bajasMarina',
      'fechaHora',
      'marino-0',
      'ubicacion',
    ]);
  });
});

describe('aPayloadIncidente', () => {
  it('mientras sigue en curso no envia desenlaces ni campos vacios', () => {
    const payload = aPayloadIncidente(formulario());
    expect(payload.criminales).toEqual([
      { criminalId: 'c-luffy', rolEnIncidente: 'OBJETIVO', desenlace: 'DESCONOCIDO' },
    ]);
    expect(payload.zonaInfluenciaId).toBeUndefined();
    expect(payload.operativoId).toBeUndefined();
    expect(payload.marinos).toBeUndefined();
    expect(payload.bajasMarina).toBeUndefined();
    expect(payload.fechaHora).toBe(new Date('2026-11-12T10:30').toISOString());
  });

  it('con resultado final conserva el desenlace y convierte las bajas a numero', () => {
    const payload = aPayloadIncidente(
      formulario({
        resultado: 'EXITO',
        bajasMarina: '2',
        bajasEnemigas: '0',
        operativoId: 'op-1',
        marinos: [{ clave: 'm', nombre: ' Smoker ', rango: '' }],
      }),
    );
    expect(payload.criminales[0].desenlace).toBe('CAPTURADO');
    expect(payload.bajasMarina).toBe(2);
    expect(payload.bajasEnemigas).toBe(0);
    expect(payload.operativoId).toBe('op-1');
    expect(payload.marinos).toEqual([{ nombre: 'Smoker', rango: undefined }]);
  });
});

describe('vocabulario', () => {
  it('resume listas largas de nombres', () => {
    expect(resumirNombres([])).toBe('Sin criminales');
    expect(resumirNombres(['Luffy'])).toBe('Luffy');
    expect(resumirNombres(['Luffy', 'Zoro'])).toBe('Luffy y Zoro');
    expect(resumirNombres(['Luffy', 'Zoro', 'Nami', 'Usopp'])).toBe('Luffy, Zoro y 2 más');
  });

  it('solo capturado y muerto cambian el estado del criminal', () => {
    expect(cambiaEstadoCriminal('CAPTURADO')).toBe(true);
    expect(cambiaEstadoCriminal('MUERTO')).toBe(true);
    expect(cambiaEstadoCriminal('ESCAPO')).toBe(false);
    expect(cambiaEstadoCriminal('DESCONOCIDO')).toBe(false);
  });

  it('cada resultado tiene su tono (en curso y parcial comparten aviso)', () => {
    expect(tonoResultado('EN_CURSO')).toBe('aviso');
    expect(tonoResultado('EXITO')).toBe('exito');
    expect(tonoResultado('PARCIAL')).toBe('aviso');
    expect(tonoResultado('FRACASO')).toBe('peligro');
  });

  it('el filtro "hasta" cubre el dia completo', () => {
    expect(limiteDelDia('', 'inicio')).toBeUndefined();
    const fin = new Date(limiteDelDia('2026-11-12', 'fin') ?? '');
    expect(fin.getHours()).toBe(23);
    expect(fin.getMinutes()).toBe(59);
    expect(new Date(limiteDelDia('2026-11-12', 'inicio') ?? '').getHours()).toBe(0);
  });
});
