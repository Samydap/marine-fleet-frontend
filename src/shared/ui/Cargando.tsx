import { EstadoCargando } from './Estados';

interface Props {
  readonly mensaje?: string;
}

/**
 * Fallback de los Suspense de cada ruta lazy: el esqueleto de una pagina de
 * listado (cabecera, filtros y filas), no un spinner.
 */
export function Cargando({ mensaje = 'Cargando…' }: Props): React.ReactElement {
  return <EstadoCargando mensaje={mensaje} />;
}
