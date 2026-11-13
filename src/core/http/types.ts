/**
 * React no trae interceptores HTTP como Angular, asi que se construyen: una
 * peticion, una funcion `siguiente` y una cadena componible sobre `fetch`.
 *
 * Es el equivalente 1 a 1 de HttpInterceptorFn, y mantiene la misma propiedad
 * que importaba: cada responsabilidad transversal vive en su propio archivo y
 * ninguna feature vuelve a implementar headers, errores ni spinner.
 */
export interface Peticion {
  url: string;
  init: RequestInit;
  /**
   * Peticion de fondo (sondeo de sincronizacion, refresco automatico): no
   * enciende la barra de carga ni publica avisos de error. El error se lanza
   * igual para que quien llamo decida.
   */
  silencioso?: boolean;
  /**
   * La pantalla ya explica el error en linea (EstadoError, AlertaConflicto):
   * la barra de carga se enciende pero no se publica el aviso flotante, que
   * repetiria lo mismo encima del contenido. `true` calla cualquier error;
   * `'conflicto'` solo el 409 (los demas fallos de la escritura si se avisan).
   */
  sinAviso?: boolean | 'conflicto';
}

export type Siguiente = (peticion: Peticion) => Promise<Response>;

export type Interceptor = (peticion: Peticion, siguiente: Siguiente) => Promise<Response>;

/**
 * Compone los interceptores en el orden dado: el primero es el mas externo.
 * En la peticion se ejecutan de izquierda a derecha; en la respuesta, al revés.
 */
export function componer(interceptores: readonly Interceptor[], base: Siguiente): Siguiente {
  return interceptores.reduceRight<Siguiente>(
    (siguiente, interceptor) => (peticion) => interceptor(peticion, siguiente),
    base,
  );
}
