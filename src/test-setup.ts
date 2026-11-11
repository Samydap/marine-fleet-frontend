import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

/**
 * Garantiza un localStorage funcional en las pruebas.
 *
 * Node 25 expone un `localStorage` global propio que tapa el de jsdom pero no
 * trae sus metodos: `typeof localStorage` da 'object' y `setItem` no existe, asi
 * que el try/catch de token.store se come el fallo y el token nunca se guarda.
 * Diagnosticarlo desde la prueba que falla es dificil, de ahi este polyfill
 * explicito en lugar de un apano dentro del codigo de produccion.
 */
function instalarStoragePolyfill(clave: 'localStorage' | 'sessionStorage'): void {
  const actual = (globalThis as Record<string, unknown>)[clave] as Storage | undefined;
  if (actual && typeof actual.setItem === 'function') {
    return;
  }

  const datos = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return datos.size;
    },
    clear: () => datos.clear(),
    getItem: (k) => datos.get(k) ?? null,
    key: (i) => Array.from(datos.keys())[i] ?? null,
    removeItem: (k) => {
      datos.delete(k);
    },
    setItem: (k, v) => {
      datos.set(k, String(v));
    },
  };

  Object.defineProperty(globalThis, clave, { value: storage, configurable: true, writable: true });
}

instalarStoragePolyfill('localStorage');
instalarStoragePolyfill('sessionStorage');

// Desmonta el arbol entre pruebas: sin esto, una prueba ve el DOM de la anterior.
afterEach(() => {
  cleanup();
  localStorage.clear();
});
