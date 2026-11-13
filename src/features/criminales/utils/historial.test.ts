import { describe, expect, it } from 'vitest';
import type { EntradaHistorial } from '../models/criminal';
import { describirCambio } from './historial';
import { claveDeRango, rangoPorClave } from './rangos-recompensa';

const ctx = { nombreZona: (id: string | null | undefined) => (id === 'z-wano' ? 'Wano' : null) };

function entrada(campo: string, anterior: string | null, nuevo: string | null): EntradaHistorial {
  return {
    id: 1,
    criminalId: 'c-1',
    campo,
    valorAnterior: anterior,
    valorNuevo: nuevo,
    usuarioId: 'u-1',
    usuarioNombre: 'Vicealmirante Garp',
    fecha: '2026-11-01T10:00:00Z',
  };
}

describe('describirCambio', () => {
  it('traduce la recompensa a berries', () => {
    const c = describirCambio(entrada('recompensa_vigente_monto', '1500000000', '3000000000'), ctx);
    expect(c.etiqueta).toBe('Recompensa vigente');
    expect(c.anterior).toBe(`${(1_500_000_000).toLocaleString('es-CO')} ฿`);
    expect(c.nuevo).toBe(`${(3_000_000_000).toLocaleString('es-CO')} ฿`);
  });

  it('traduce estado, nivel de amenaza y zona al vocabulario de la Marina', () => {
    expect(describirCambio(entrada('estado', 'ACTIVO', 'CAPTURADO'), ctx)).toMatchObject({
      anterior: 'En búsqueda',
      nuevo: 'Capturado',
    });
    expect(describirCambio(entrada('nivel_amenaza', 'MEDIO', 'ALTO'), ctx).nuevo).toBe('Alto');
    expect(describirCambio(entrada('zona_influencia_id', null, 'z-wano'), ctx)).toMatchObject({
      etiqueta: 'Zona',
      anterior: null,
      nuevo: 'Wano',
    });
  });

  it('lee los alias guardados como JSON y el rol de la afiliacion', () => {
    expect(describirCambio(entrada('alias', '[]', '["Mugiwara","Luffy"]'), ctx)).toMatchObject({
      anterior: 'Sin alias',
      nuevo: 'Mugiwara, Luffy',
    });
    expect(
      describirCambio(entrada('afiliacion', null, 'Piratas del Sombrero de Paja (LIDER)'), ctx)
        .nuevo,
    ).toBe('Piratas del Sombrero de Paja (Líder)');
    expect(describirCambio(entrada('afiliacion', 'X (MIEMBRO)', 'DESAFILIADO'), ctx).nuevo).toBe(
      'Retirado de la afiliación',
    );
  });

  it('nombra el alta y los cambios de una recompensa', () => {
    expect(describirCambio(entrada('REGISTRO', null, 'Luffy'), ctx).etiqueta).toBe(
      'Alta en el archivo criminal',
    );
    expect(describirCambio(entrada('recompensa:r-9', 'PENDIENTE', 'VIGENTE'), ctx)).toMatchObject({
      etiqueta: 'Estado de una recompensa',
      anterior: 'Pendiente de validación',
      nuevo: 'Vigente',
    });
  });

  it('humaniza un campo desconocido en lugar de fallar', () => {
    expect(describirCambio(entrada('campo_nuevo', 'a', 'b'), ctx).etiqueta).toBe('Campo nuevo');
  });
});

describe('rangos de recompensa', () => {
  it('ida y vuelta entre clave y limites', () => {
    const rango = rangoPorClave('100m-1000m');
    expect(rango).toMatchObject({ min: 100_000_000, max: 1_000_000_000 });
    expect(claveDeRango(rango?.min, rango?.max)).toBe('100m-1000m');
    expect(claveDeRango(1_000_000_000, undefined)).toBe('mas-1000m');
    expect(claveDeRango(undefined, undefined)).toBe('');
  });
});
