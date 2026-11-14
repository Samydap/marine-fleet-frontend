import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { EstadoError, Skeleton } from '@shared/ui/Estados';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { MontoAnimado } from '@shared/ui/MontoAnimado';
import { RetratoCriminal } from '@shared/ui/RetratoCriminal';
import {
  esAltoRango,
  etiquetaEstadoRecompensa,
  tonoEstadoRecompensa,
  type Recompensa,
} from '../models/recompensa';

interface Props {
  readonly recompensas: readonly Recompensa[];
  readonly cargando: boolean;
  readonly error: unknown;
  readonly onReintentar: () => void;
  readonly vacio: React.ReactNode;
}

/** Tope de carteles que entran escalonados; el resto entra con el ultimo. */
const MAX_ESCALONADOS = 11;

/**
 * Segunda vista del historial: cada recompensa como un mini cartel clavado en
 * el tablon (foto, nombre, monto y estado). Mismos datos, filtros y paginas
 * que la tabla; la tabla sigue siendo la vista para revisar en detalle.
 */
export function TablonRecompensas({
  recompensas,
  cargando,
  error,
  onReintentar,
  vacio,
}: Props): React.ReactElement {
  const reducir = useReducedMotion() ?? false;

  if (cargando && recompensas.length === 0) {
    return (
      <div className="tablero-recompensas" role="status" aria-busy="true">
        <span className="sr-only">Cargando recompensas…</span>
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} forma="bloque" className="tablero-recompensas-hueso" />
        ))}
      </div>
    );
  }

  if (error && recompensas.length === 0) {
    return <EstadoError error={error} onReintentar={onReintentar} />;
  }

  if (recompensas.length === 0) return <>{vacio}</>;

  return (
    <ul className="tablero-recompensas" aria-label="Tablón de recompensas" aria-busy={cargando}>
      {recompensas.map((r, i) => {
        const cerrada = r.estado === 'HISTORICA' || r.estado === 'RECHAZADA';
        const retraso = Math.min(i, MAX_ESCALONADOS) * 0.05;
        return (
          <motion.li
            key={r.id}
            className={`recompensa-cartel${cerrada ? ' recompensa-cartel--cerrado' : ''}`}
            initial={reducir ? false : { opacity: 0, y: 12, rotate: -1.5 }}
            animate={{ opacity: cerrada ? 0.72 : 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.35, delay: retraso, ease: 'easeOut' }}
          >
            <RetratoCriminal
              fotoUrl={r.criminalFotoUrl}
              nombre={r.criminalNombre ?? '?'}
              tamano="lg"
              marco="cartel"
            />
            {r.criminalNombre === null ? (
              <span className="recompensa-cartel-nombre recompensa-cartel-nombre--ausente">
                Criminal no disponible
              </span>
            ) : (
              <Link className="recompensa-cartel-nombre" to={`/criminales/${r.criminalId}`}>
                {r.criminalNombre ?? 'Ver criminal'}
              </Link>
            )}
            <MontoAnimado
              valor={r.monto}
              abreviado
              altoRango={esAltoRango(r.monto)}
              retraso={retraso + 0.15}
            />
            <InsigniaEstado etiqueta={etiquetaEstadoRecompensa(r)} tono={tonoEstadoRecompensa(r)} />
          </motion.li>
        );
      })}
    </ul>
  );
}
