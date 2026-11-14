/**
 * Imagenes opcionales del tablero (retratos, oficiales, Den Den Mushi).
 *
 * Basta con dejar el archivo en src/assets/comando/ con el nombre esperado
 * (la lista esta en el LEEME.md de esa carpeta). Vite las descubre al compilar:
 * si una no esta, el componente dibuja una silueta y no se pide nada a la red.
 */
const archivos = import.meta.glob<string>('../../assets/comando/*.{avif,webp,png,jpg,jpeg}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const URL_POR_CLAVE = new Map<string, string>();
for (const [ruta, url] of Object.entries(archivos)) {
  const archivo = ruta.split('/').pop() ?? '';
  URL_POR_CLAVE.set(archivo.replace(/\.[^.]+$/, '').toLowerCase(), url);
}

/** URL de la imagen con ese nombre de archivo (sin extension), si existe. */
export function imagenDe(clave: string): string | undefined {
  return URL_POR_CLAVE.get(clave);
}
