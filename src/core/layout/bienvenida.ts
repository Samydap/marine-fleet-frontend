const CLAVE = 'marina.bienvenida';

/**
 * El login deja pendiente la bienvenida a bordo; el shell la toma una sola
 * vez. Vive en sessionStorage: recargar la pagina no la repite.
 */
export function marcarBienvenida(): void {
  try {
    sessionStorage.setItem(CLAVE, '1');
  } catch {
    // Sin almacenamiento: se entra sin bienvenida, nada mas.
  }
}

export function tomarBienvenida(): boolean {
  try {
    const pendiente = sessionStorage.getItem(CLAVE) === '1';
    sessionStorage.removeItem(CLAVE);
    return pendiente;
  } catch {
    return false;
  }
}
