import { Link } from 'react-router-dom';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { formatearFecha } from '@shared/utils/fecha';
import { TextoRecortado } from '@shared/ui/TextoRecortado';
import {
  basesOrdenadas,
  etiquetaEstadoOperativo,
  etiquetaResultado,
  tonoEstadoOperativo,
  type Operativo,
} from '../models/operativo';
import { MarcaPrioridad } from '@shared/ui/MarcaPrioridad';

interface Props {
  readonly operativo: Operativo;
  readonly nombreBase: (id: string) => string | null;
  readonly nombreZona: (id: string) => string | null;
  /** Llego un cambio de otra base hace un momento. */
  readonly reciente?: boolean;
}

const MAX_BASES = 4;

/** Linea temporal corta segun el estado: lo que el oficial necesita saber de un vistazo. */
function momento(op: Operativo): string {
  switch (op.estado) {
    case 'PLANIFICADO':
      return `Inicio previsto ${formatearFecha(op.fechaInicioPlaneada)}`;
    case 'EN_CURSO':
      return `Desde ${formatearFecha(op.fechaInicioReal ?? op.fechaInicioPlaneada)}`;
    case 'CERRADO':
      return op.resultadoFinal
        ? `Resultado: ${etiquetaResultado(op.resultadoFinal).toLowerCase()}`
        : `Cerrado ${formatearFecha(op.fechaCierre)}`;
    default:
      return `Abortado ${formatearFecha(op.fechaCierre ?? op.updatedAt)}`;
  }
}

/**
 * Una fila del tablero de despliegue: prioridad, codigo y nombre (enlace a la
 * ficha), estado, bases asignadas y ultimo cambio, todo sin abrir el detalle.
 */
export function FilaOperativo({
  operativo: op,
  nombreBase,
  nombreZona,
  reciente = false,
}: Props): React.ReactElement {
  const bases = basesOrdenadas(op);
  const visibles = bases.slice(0, MAX_BASES);
  const ocultas = bases.length - visibles.length;
  const zona = nombreZona(op.zonaInfluenciaId);

  return (
    <li className={reciente ? 'despliegue-fila despliegue-fila--reciente' : 'despliegue-fila'}>
      <div className="despliegue-prioridad">
        <MarcaPrioridad prioridad={op.prioridad} />
      </div>

      <div className="despliegue-ident">
        <span className="despliegue-codigo cifra">{op.codigo}</span>
        <Link className="despliegue-nombre" to={op.id} title={op.nombre}>
          {op.nombre}
        </Link>
        <TextoRecortado
          className="despliegue-sub"
          texto={[zona, op.objetivo].filter(Boolean).join(' · ') || 'Sin objetivo táctico descrito'}
        />
      </div>

      <div className="despliegue-estado">
        <InsigniaEstado
          etiqueta={etiquetaEstadoOperativo(op.estado)}
          tono={tonoEstadoOperativo(op.estado)}
          enCurso={op.estado === 'EN_CURSO'}
        />
        <TextoRecortado className="despliegue-sub" texto={momento(op)} />
      </div>

      <div className="despliegue-bases">
        <span className="sr-only">Bases asignadas:</span>
        <ul>
          {visibles.map((b) => (
            <li
              key={b.baseNavalId}
              className={
                b.rolParticipacion === 'LIDER' ? 'base-chip base-chip--lider' : 'base-chip'
              }
              title={b.baseNavalNombre ?? nombreBase(b.baseNavalId) ?? b.baseNavalId}
            >
              {b.rolParticipacion === 'LIDER' && <span className="sr-only">Base líder: </span>}
              {b.baseNavalNombre ?? nombreBase(b.baseNavalId) ?? b.baseNavalId}
            </li>
          ))}
          {ocultas > 0 && (
            <li className="base-chip base-chip--mas">
              +{ocultas}
              <span className="sr-only"> bases más</span>
            </li>
          )}
        </ul>
      </div>

      <div className="despliegue-hora">
        {reciente && <span className="despliegue-senal">Cambio recibido</span>}
        <ActualizadoHace fecha={op.updatedAt} prefijo="Cambió" />
      </div>
    </li>
  );
}
