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
