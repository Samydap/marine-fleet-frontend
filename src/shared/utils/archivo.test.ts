import { describe, expect, it } from 'vitest';
import { TAMANO_MAXIMO_FOTO, validarFoto } from './archivo';

describe('validarFoto (CambiarFotoDto)', () => {
  it('acepta JPG, PNG y WEBP de hasta 2 MB', () => {
    expect(validarFoto({ type: 'image/png', size: 1000 })).toBeNull();
    expect(validarFoto({ type: 'image/webp', size: TAMANO_MAXIMO_FOTO })).toBeNull();
  });

  it('rechaza otros formatos', () => {
    expect(validarFoto({ type: 'image/gif', size: 1000 })).toMatch(/JPG, PNG o WEBP/);
  });

  it('rechaza mas de 2 MB', () => {
    expect(validarFoto({ type: 'image/jpeg', size: TAMANO_MAXIMO_FOTO + 1 })).toMatch(/2 MB/);
  });
});
