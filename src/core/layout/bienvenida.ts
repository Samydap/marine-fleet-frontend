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

/** Solo lee: el modo estricto de React llama dos veces al inicializador. */
export function hayBienvenida(): boolean {
  try {
    return sessionStorage.getItem(CLAVE) === '1';
  } catch {
    return false;
  }
}

/** La bienvenida ya se mostro: recargar no la repite. */
export function olvidarBienvenida(): void {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {
    // Sin almacenamiento no hubo marca que borrar.
  }
}
