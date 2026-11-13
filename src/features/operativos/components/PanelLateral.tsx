import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Boton } from '@shared/ui/Boton';
import { CampoSelect } from '@shared/ui/Campo';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { formatearFecha } from '@shared/utils/fecha';
import {
  esEstadoFinal,
  etiquetaResultado,
  opcionesPrioridad,
  tonoResultado,
  type DetalleOperativo,
  type PrioridadOperativo,
} from '../models/operativo';
import { MarcaPrioridad } from '@shared/ui/MarcaPrioridad';

interface Props {
  readonly operativo: DetalleOperativo;
  readonly puedeCoordinar: boolean;
  readonly onCambiarPrioridad: (p: PrioridadOperativo, version: number) => Promise<void>;
}

/** Prioridad (editable), cronologia y vinculos del operativo. */
export function PanelLateral({
  operativo: op,
  puedeCoordinar,
  onCambiarPrioridad,
}: Props): React.ReactElement {
  const [prioridad, setPrioridad] = useState<PrioridadOperativo>(op.prioridad);
  const [guardando, setGuardando] = useState(false);
  // Si otra base cambia la prioridad, el selector muestra la nueva.
  useEffect(() => setPrioridad(op.prioridad), [op.prioridad]);

  const editable = puedeCoordinar && !esEstadoFinal(op.estado);

  async function guardar(): Promise<void> {
    setGuardando(true);
    try {
      await onCambiarPrioridad(prioridad, op.version);
    } catch {
      setPrioridad(op.prioridad);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <aside className="ficha-lateral">
      <section className="ficha-bloque" aria-labelledby="lat-prioridad">
        <h2 id="lat-prioridad" className="ficha-bloque-titulo">
          Prioridad
        </h2>
        {editable ? (
          <div className="prioridad-editor">
            <CampoSelect
              etiqueta="Prioridad del operativo"
              etiquetaOculta
              value={prioridad}
              opciones={opcionesPrioridad()}
              onChange={(e) => setPrioridad(e.target.value as PrioridadOperativo)}
            />
            <Boton
              tamano="compacto"
              disabled={prioridad === op.prioridad}
              cargando={guardando}
              textoCargando="Guardando…"
              onClick={() => void guardar()}
            >
              Cambiar
            </Boton>
          </div>
        ) : (
          <MarcaPrioridad prioridad={op.prioridad} />
        )}
        {editable && <p className="ficha-nota">Las bases asignadas reciben aviso del cambio.</p>}
      </section>

      <section className="ficha-bloque" aria-labelledby="lat-cronologia">
        <h2 id="lat-cronologia" className="ficha-bloque-titulo">
          Cronología
        </h2>
        <ol className="cronologia">
          <li>
            <span>Planificado</span>
            <time dateTime={op.createdAt}>{formatearFecha(op.createdAt)}</time>
          </li>
          <li>
            <span>Inicio previsto</span>
            <time dateTime={op.fechaInicioPlaneada ?? undefined}>
              {formatearFecha(op.fechaInicioPlaneada)}
            </time>
          </li>
          <li className={op.fechaInicioReal ? undefined : 'cronologia-pendiente'}>
            <span>Inicio real</span>
            {op.fechaInicioReal ? (
              <time dateTime={op.fechaInicioReal}>{formatearFecha(op.fechaInicioReal)}</time>
            ) : (
              <span>{op.estado === 'ABORTADO' ? 'No llegó a iniciar' : 'Aún no inicia'}</span>
            )}
          </li>
          <li className={op.fechaCierre ? undefined : 'cronologia-pendiente'}>
            <span>{op.estado === 'ABORTADO' ? 'Abortado' : 'Cierre'}</span>
            {op.fechaCierre ? (
              <time dateTime={op.fechaCierre}>{formatearFecha(op.fechaCierre)}</time>
            ) : (
              <span>{op.estado === 'ABORTADO' ? formatearFecha(op.updatedAt) : 'Abierto'}</span>
            )}
          </li>
        </ol>
        {op.resultadoFinal && (
          <div className="cierre-resumen">
            <InsigniaEstado
              etiqueta={`Resultado ${etiquetaResultado(op.resultadoFinal).toLowerCase()}`}
              tono={tonoResultado(op.resultadoFinal)}
            />
            {op.observacionesCierre && <p>{op.observacionesCierre}</p>}
          </div>
        )}
      </section>

      <section className="ficha-bloque" aria-labelledby="lat-incidentes">
        <h2 id="lat-incidentes" className="ficha-bloque-titulo">
          Incidentes
        </h2>
        <p className="ficha-cifra">
          <strong className="cifra">{op.incidentesVinculados}</strong>{' '}
          {op.incidentesVinculados === 1
            ? 'enfrentamiento vinculado'
            : 'enfrentamientos vinculados'}
        </p>
        {op.incidentesVinculados > 0 && (
          <Link to={`/incidentes?operativoId=${encodeURIComponent(op.id)}`}>
            Ver incidentes de {op.codigo}
          </Link>
        )}
      </section>
    </aside>
  );
}
