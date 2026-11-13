/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Contraste WCAG de los pares de texto del lienzo oscuro y del papel oficial.
 * Lee los tokens de `:root` en src/styles.css, resuelve las referencias
 * `var(--x)` y calcula la razon de contraste. Si alguien cambia un token y el
 * par baja de AA, esta prueba lo frena antes de llegar a pantalla.
 */

const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');

function leerTokens(fuente: string): Map<string, string> {
  const raiz = /:root\s*\{([\s\S]*?)\n\}/.exec(fuente);
  if (!raiz) throw new Error('No se encontro el bloque :root en styles.css');
  const tokens = new Map<string, string>();
  const declaracion = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = declaracion.exec(raiz[1])) !== null) {
    tokens.set(m[1], m[2].trim());
  }
  return tokens;
}

const tokens = leerTokens(css);

/** Devuelve el hex de un token (siguiendo `var()`) o el hex literal recibido. */
function hex(valor: string, visitados: ReadonlySet<string> = new Set()): string {
  if (valor.startsWith('#')) return valor;
  const referencia = /^var\((--[\w-]+)\)$/.exec(valor);
  const nombre = referencia ? referencia[1] : valor;
  if (visitados.has(nombre)) throw new Error(`Referencia circular en ${nombre}`);
  const crudo = tokens.get(nombre);
  if (crudo === undefined) throw new Error(`El token ${nombre} no existe en :root`);
  return hex(crudo, new Set([...visitados, nombre]));
}

function luminancia(color: string): number {
  const limpio = color.replace('#', '');
  const completo =
    limpio.length === 3
      ? limpio
          .split('')
          .map((c) => c + c)
          .join('')
      : limpio;
  if (!/^[0-9a-f]{6}$/i.test(completo)) throw new Error(`No es un hex opaco: ${color}`);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const canal = parseInt(completo.slice(i, i + 2), 16) / 255;
    return canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(texto: string, fondo: string): number {
  const a = luminancia(hex(texto));
  const b = luminancia(hex(fondo));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

describe('contraste de los tokens', () => {
  it('resuelve tokens encadenados con var()', () => {
    expect(hex('#ffffff')).toBe('#ffffff');
    expect(contraste('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('los pares de texto sobre lienzo y papel cumplen AA', () => {
    const paresTexto: ReadonlyArray<readonly [string, string]> = [
      ['--sobre-navy-texto', '--lienzo'],
      ['#ffffff', '--lienzo'],
      ['--tinta', '--papel'],
      ['--tinta-2', '--papel'],
      ['--tinta-3', '--papel'],
      ['--tinta', '--superficie-campo'],
      // Interinos de la cabecera sobre el lienzo (titulo y "actualizado" viejo).
      ['--sobre-lienzo', '--lienzo'],
      ['--sobre-navy-aviso', '--lienzo'],
    ];
    for (const [texto, fondo] of paresTexto) {
      expect(contraste(texto, fondo), `${texto} sobre ${fondo}`).toBeGreaterThanOrEqual(4.5);
    }

    // Elementos graficos y texto grande: 3:1.
    expect(contraste('--gold', '--lienzo')).toBeGreaterThanOrEqual(3);
  });
});
