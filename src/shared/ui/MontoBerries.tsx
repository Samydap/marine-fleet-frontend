import { formatearBerries } from '@shared/utils/berries';

interface Props {
  readonly valor: number | null | undefined;
  /** "3 MM ฿" en vez de "3.000.000.000 ฿". El monto completo queda en el tooltip. */
  readonly abreviado?: boolean;
  /**
   * Monto de alto rango (el que exige validacion del Almirante): lleva el
   * dorado de autoridad. Lo decide la feature, no este componente.
   */
  readonly altoRango?: boolean;
  /** `grande` para el monto protagonista de una ficha o del cartel. */
  readonly tamano?: 'normal' | 'grande';
}

/**
 * Monto de recompensa con cifras tabulares (las columnas se alinean) y el
 * simbolo de berries. Siempre formatearBerries por debajo.
 *
 *   <MontoBerries valor={c.recompensaVigenteMonto} abreviado />
 */
export function MontoBerries({
  valor,
  abreviado = false,
  altoRango = false,
  tamano = 'normal',
}: Props): React.ReactElement {
  const completo = formatearBerries(valor);
  const sinMonto = valor === null || valor === undefined;
  const clases = [
    'monto',
    'cifra',
    sinMonto ? 'monto--vacio' : '',
    altoRango ? 'monto--alto-rango' : '',
    tamano === 'grande' ? 'monto--grande' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={clases} title={abreviado && !sinMonto ? completo : undefined}>
      {formatearBerries(valor, abreviado)}
      {abreviado && !sinMonto && <span className="sr-only"> ({completo})</span>}
    </span>
  );
}
