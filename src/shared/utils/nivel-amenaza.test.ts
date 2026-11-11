import { describe, expect, it } from 'vitest';
import { etiquetaNivelAmenaza } from './nivel-amenaza';

describe('etiquetaNivelAmenaza', () => {
  it('traduce los tres niveles', () => {
    expect(etiquetaNivelAmenaza('BAJO')).toBe('Bajo');
    expect(etiquetaNivelAmenaza('MEDIO')).toBe('Medio');
    expect(etiquetaNivelAmenaza('ALTO')).toBe('Alto');
  });

  it('muestra PENDIENTE como "Sin clasificar"', () => {
    expect(etiquetaNivelAmenaza('PENDIENTE')).toBe('Sin clasificar');
  });

  it('trata null y undefined como pendiente de clasificacion', () => {
    expect(etiquetaNivelAmenaza(null)).toBe('Sin clasificar');
    expect(etiquetaNivelAmenaza(undefined)).toBe('Sin clasificar');
  });
});
