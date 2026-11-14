import { animate, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { formatearBerries } from '@shared/utils/berries';

interface Props {
  readonly valor: number | null | undefined;
  readonly abreviado?: boolean;
  readonly altoRango?: boolean;
  readonly tamano?: 'normal' | 'grande';
  /** Segundos antes de empezar a contar: para escalonar varios montos. */
  readonly retraso?: number;
}

/**
 * MontoBerries que cuenta desde 0 hasta su valor la primera vez que aparece
 * (y de nuevo si el valor cambia). La cuenta es solo visual: el lector de
 * pantalla oye siempre el monto final. Con "reducir movimiento" no cuenta.
 *
 *   <MontoAnimado valor={r.monto} abreviado altoRango={esAltoRango(r.monto)} />
 */
export function MontoAnimado({
  valor,
  abreviado = false,
  altoRango = false,
  tamano = 'normal',
  retraso = 0,
}: Props): React.ReactElement {
  const reducir = useReducedMotion() ?? false;
  const sinMonto = valor === null || valor === undefined;
  const [mostrado, setMostrado] = useState(() => (sinMonto || reducir ? valor : 0));

  useEffect(() => {
    if (sinMonto || reducir) {
      setMostrado(valor);
      return;
    }
    const control = animate(0, valor, {
      duration: 0.7,
      delay: retraso,
      ease: 'easeOut',
      onUpdate: (v) => setMostrado(Math.round(v)),
    });
    return () => control.stop();
  }, [valor, sinMonto, reducir, retraso]);

  const clases = [
    'monto',
    'cifra',
    sinMonto ? 'monto--vacio' : '',
    altoRango ? 'monto--alto-rango' : '',
    tamano === 'grande' ? 'monto--grande' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (sinMonto) {
    return <span className={clases}>{formatearBerries(valor)}</span>;
  }

  return (
    <span className={clases} title={abreviado ? formatearBerries(valor) : undefined}>
      <span aria-hidden="true">{formatearBerries(mostrado, abreviado)}</span>
      <span className="sr-only">{formatearBerries(valor)}</span>
    </span>
  );
}
