import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import type { PointerEvent, ReactNode } from 'react';

interface Props {
  readonly children: ReactNode;
}

/** Inclinacion maxima del papel al seguir el mouse, en grados. */
const INCLINACION = 6;
const RESORTE = { stiffness: 220, damping: 20 } as const;

/**
 * Donde se clava el cartel: cae sobre el tablon con un leve giro y se asienta;
 * con mouse, el papel se inclina hacia el puntero. Quien lo usa le pone `key`
 * de la version para que cada version nueva vuelva a caer. Al imprimir no hay
 * giro (carteles.css anula la transformacion en @media print).
 */
export function EscenarioCartel({ children }: Props): React.ReactElement {
  const reducir = useReducedMotion() ?? false;
  const giroX = useSpring(useMotionValue(0), RESORTE);
  const giroY = useSpring(useMotionValue(0), RESORTE);

  function seguir(e: PointerEvent<HTMLDivElement>): void {
    if (reducir || e.pointerType !== 'mouse') return;
    const caja = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - caja.left) / caja.width - 0.5;
    const y = (e.clientY - caja.top) / caja.height - 0.5;
    giroY.set(x * INCLINACION * 2);
    giroX.set(-y * INCLINACION * 2);
  }

  function soltar(): void {
    giroX.set(0);
    giroY.set(0);
  }

  return (
    <div className="cartel-escenario" onPointerMove={seguir} onPointerLeave={soltar}>
      <motion.div
        className="cartel-escenario-papel cartel-escenario--entra"
        style={{ rotateX: giroX, rotateY: giroY }}
        initial={reducir ? false : { y: -40, rotate: -4, opacity: 0 }}
        animate={{ y: 0, rotate: -0.6, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
