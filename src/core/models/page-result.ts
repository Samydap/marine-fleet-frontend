import type { PageMeta } from './api-response';

export type { PageMeta };

export interface PageResult<T> {
  readonly data: T[];
  readonly meta: PageMeta;
}

export const PAGINA_VACIA: PageMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
};

/** Parametros de consulta comunes a todos los listados. */
export interface PageQuery {
  page?: number;
  limit?: number;
  q?: string;
  order?: 'ASC' | 'DESC';
}
