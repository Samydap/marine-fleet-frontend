/**
 * Archivos: guardar descargas (carteles, exportaciones PDF/CSV) y preparar la
 * foto de un criminal para PUT /criminales/:id/foto, que la recibe en base64
 * dentro de un JSON (CambiarFotoDto).
 */

/** Tipos de imagen que acepta CambiarFotoDto. */
export const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type TipoImagen = (typeof TIPOS_IMAGEN)[number];

/** 2 MB: el limite del backend para la foto. */
export const TAMANO_MAXIMO_FOTO = 2 * 1024 * 1024;

/** Mensaje de error si la foto no es valida; null si se puede enviar. */
export function validarFoto(archivo: Pick<File, 'type' | 'size'>): string | null {
  if (!(TIPOS_IMAGEN as readonly string[]).includes(archivo.type)) {
    return 'La foto debe ser JPG, PNG o WEBP.';
  }
  if (archivo.size > TAMANO_MAXIMO_FOTO) {
    return 'La foto supera los 2 MB. Usa una imagen más liviana.';
  }
  return null;
}

/** Lee un archivo como data URL (`data:image/png;base64,...`), que el backend acepta tal cual. */
export function leerComoDataUrl(archivo: Blob): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(String(lector.result));
    lector.onerror = () => rechazar(lector.error ?? new Error('No se pudo leer el archivo.'));
    lector.readAsDataURL(archivo);
  });
}

/**
 * Ofrece un Blob como descarga con su nombre. Funciona con lo que devuelve
 * `apiClient.descargar(...)`:
 *
 *   const { blob, nombre } = await apiClient.descargar(`/carteles/${id}/descargar`, { formato: 'pdf' });
 *   guardarArchivo(blob, nombre);
 */
export function guardarArchivo(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.rel = 'noopener';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  // Diferido: Safari cancela la descarga si se revoca en el mismo tick.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Abre un Blob en una pestana nueva (imprimir un cartel PDF desde el visor del navegador). */
export function abrirArchivo(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
