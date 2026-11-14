import { BarrasHorizontales } from '@shared/ui/BarrasHorizontales';
import { formatearBerries } from '@shared/utils/berries';
import { participacion, type FilaRecompensasPorMar } from '../models/reporte-mensual';

interface Props {
  readonly filas: readonly FilaRecompensasPorMar[];
  readonly total: number;
}

/**
 * El total activo de cada mar en una sola serie (navy): sin leyenda, el valor
 * en la punta de cada barra y el detalle exacto en la tabla que acompana. La
 * Grand Line se separa de los Cuatro Mares: es otro teatro de operaciones.
 */
export function BarrasPorMar({ filas, total }: Props): React.ReactElement {
  return (
    <BarrasHorizontales
      titulo="Total en recompensas activas por mar"
      datos={filas.map((f) => ({
        clave: f.marId,
        etiqueta: f.marNombre,
        nombre: `${f.marNombre} (${participacion(f.totalAcumulado, total).toLocaleString('es-CO')} % del total, ${f.cantidadCriminales.toLocaleString('es-CO')} criminales)`,
        valor: f.totalAcumulado,
        textoValor: formatearBerries(f.totalAcumulado, true),
        separada: f.tipoMar === 'GRAND_LINE',
      }))}
    />
  );
}
