import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { SelloMarina } from './SelloMarina';

interface Props {
  readonly nombre: string;
  readonly rango: string;
  readonly alTerminar: () => void;
}

/** Lo que dura la bienvenida antes de dejar paso a la pantalla. */
const DURACION_MS = 1200;

/**
 * Bienvenida a bordo tras el login: el sello de la Marina se despliega sobre
 * un velo navy y saluda por rango y nombre. Dura poco mas de un segundo y se
 * salta con un clic o cualquier tecla. Con "reducir movimiento" no aparece.
 * La salida (fundido) la anima el AnimatePresence de quien la monta.
 */
export function BienvenidaAbordo({ nombre, rango, alTerminar }: Props): React.ReactElement | null {
  const reducir = useReducedMotion() ?? false;
  const terminar = useRef(alTerminar);
  terminar.current = alTerminar;

  useEffect(() => {
    if (reducir) {
      terminar.current();
      return;
    }
    let hecho = false;
    const cerrar = (): void => {
      if (hecho) return;
      hecho = true;
      terminar.current();
    };
    const reloj = window.setTimeout(cerrar, DURACION_MS);
    window.addEventListener('keydown', cerrar);
    return () => {
      window.clearTimeout(reloj);
      window.removeEventListener('keydown', cerrar);
    };
  }, [reducir]);

  if (reducir) return null;

  return (
    <motion.div
      className="bienvenida"
      role="status"
      onClick={() => terminar.current()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bienvenida-sello"
        initial={{ scale: 0.6, rotate: -90, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 16 }}
      >
        <SelloMarina />
      </motion.div>
      <motion.p
        className="bienvenida-texto"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.25, ease: [0.23, 1, 0.32, 1] }}
      >
        <span className="bienvenida-saludo">Bienvenido a bordo</span>
        <strong className="bienvenida-nombre">{`${rango} ${nombre}`}</strong>
      </motion.p>
    </motion.div>
  );
}
