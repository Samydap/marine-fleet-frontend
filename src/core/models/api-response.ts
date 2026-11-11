/** Sobre unico de la API (TransformResponseInterceptor del backend). */
export interface ApiResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly meta?: PageMeta;
}

export interface PageMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
  readonly hasNext: boolean;
}

/** Forma de error unica (AllExceptionsFilter del backend). */
export interface ApiErrorBody {
  readonly success: false;
  readonly error: { codigo: string; message: string; status: number };
  readonly path: string;
  readonly timestamp: string;
}

/**
 * Error tipado que lanza el cliente HTTP. Las features pueden distinguir un 409
 * de concurrencia de un 400 de validacion sin volver a parsear la respuesta.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly codigo: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get esConflicto(): boolean {
    return this.status === 409;
  }

  get esNoAutorizado(): boolean {
    return this.status === 401 || this.status === 403;
  }
}
