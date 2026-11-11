import { Suspense, type ReactElement } from 'react';
import { Cargando } from './Cargando';

/**
 * Envuelve el elemento de una ruta lazy en su Suspense.
 *
 * Existe para que los nueve `*.routes.tsx` no repitan el mismo boilerplate ni
 * inventen nueve fallbacks distintos.
 */
export function conSuspense(nodo: ReactElement, mensaje?: string): ReactElement {
  return <Suspense fallback={<Cargando mensaje={mensaje} />}>{nodo}</Suspense>;
}
