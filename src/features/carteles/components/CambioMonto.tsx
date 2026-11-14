import { motion, useReducedMotion } from 'motion/react';
import { MontoAnimado } from '@shared/ui/MontoAnimado';
import { formatearBerries } from '@shared/utils/berries';

interface Props {
  readonly anterior: number;
  readonly actual: number | null;
}

/**
 * La recompensa cambio respecto a la version anterior del cartel: el monto
 * viejo tachado y el nuevo que cae estampado encima.
 */
export function CambioMonto({ anterior, actual }: Props): React.ReactElement {
  const reducir = useReducedMotion() ?? false;
  const subio = actual !== null && actual > anterior;

  return (
    <section className="cambio-monto" aria-labelledby="cambio-monto-titulo">
      <h2 id="cambio-monto-titulo" className="cambio-monto-titulo">
        {subio ? 'La recompensa subió' : 'La recompensa cambió'}
      </h2>
      <p className="sr-only">
        La recompensa pasó de {formatearBerries(anterior)} a {formatearBerries(actual)}
      </p>
      <div className="cambio-monto-cifras" aria-hidden="true">
        <del className="cambio-monto-anterior cifra">{formatearBerries(anterior, true)}</del>
        <motion.span
          className="cambio-monto-actual"
          initial={reducir ? false : { scale: 1.4, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: -2 }}
          transition={{ duration: 0.25, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          <MontoAnimado valor={actual} abreviado tamano="grande" retraso={0.3} />
        </motion.span>
      </div>
    </section>
  );
}
