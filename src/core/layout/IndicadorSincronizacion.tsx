import { useEffect, useRef, useState } from 'react';
import {
  useCambiosSincronizados,
  useEstadoSincronizacion,
  type EstadoCanal,
} from '../sync/sincronizacion';
import { DenDenMushi } from './emblemas/DenDenMushi';

/** Lo que dura el parpadeo del caracol al llegar un cambio de otra base. */
const DURACION_LLAMADA_MS = 600;

const TEXTO: Readonly<Record<Exclude<EstadoCanal, 'inactivo'>, string>> = {
  'en-vivo': 'En vivo',
  sondeo: 'Actualiza cada 10 s',
  conectando: 'Conectando…',
  'sin-conexion': 'Sin conexión, reintentando',
};

/** Para la franja del telefono (≤410 px): mismo estado, menos ancho. */
const TEXTO_CORTO: Readonly<Record<Exclude<EstadoCanal, 'inactivo'>, string>> = {
  'en-vivo': 'En vivo',
  sondeo: 'Cada 10 s',
  conectando: 'Conectando…',
  'sin-conexion': 'Sin conexión',
};

const DETALLE: Readonly<Record<Exclude<EstadoCanal, 'inactivo'>, string>> = {
  'en-vivo': 'Los cambios de las demás bases llegan al instante.',
  sondeo: 'Los cambios de las demás bases se consultan cada 10 segundos.',
  conectando: 'Abriendo el canal con las demás bases.',
  'sin-conexion':
    'No hay canal con el servidor. Lo que ves puede estar desactualizado; se reintenta solo.',
};

function hora(iso: string | null): string {
  if (!iso) return '';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  return new Intl.DateTimeFormat('es-CO', { timeStyle: 'medium' }).format(fecha);
}

/**
 * Estado del canal entre bases. Va en el shell porque responde a la pregunta
 * que todo dato sincronizado plantea: "¿esto que veo esta al dia?".
 * El estado se nombra con texto; el Den Den Mushi solo lo acompana.
 */
export function IndicadorSincronizacion(): React.ReactElement | null {
  const { estado, ultimaSenal } = useEstadoSincronizacion();
  const [llamando, setLlamando] = useState(false);
  const temporizador = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  useCambiosSincronizados('*', () => {
    setLlamando(true);
    window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => setLlamando(false), DURACION_LLAMADA_MS);
  });

  if (estado === 'inactivo') return null;

  const ultima = hora(ultimaSenal);
  const titulo = ultima ? `${DETALLE[estado]} Última señal: ${ultima}.` : DETALLE[estado];

  return (
    <p className={`sync sync--${estado}`} title={titulo} role="status">
      <DenDenMushi
        className="sync-mushi"
        estado={estado === 'sin-conexion' ? 'dormido' : llamando ? 'llamando' : 'vivo'}
      />
      <span className="sync-texto">{TEXTO[estado]}</span>
      <span className="sync-texto-corto" aria-hidden="true">
        {TEXTO_CORTO[estado]}
      </span>
      <span className="sr-only">. {titulo}</span>
    </p>
  );
}
