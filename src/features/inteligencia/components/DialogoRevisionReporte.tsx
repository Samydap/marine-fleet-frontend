import { useEffect, useState } from 'react';
import { notificar } from '@core/services/notification.store';
import { Boton } from '@shared/ui/Boton';
import { CampoAreaTexto } from '@shared/ui/Campo';
import { Dialogo } from '@shared/ui/Dialogo';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { aIso, formatearFecha } from '@shared/utils/fecha';
import { inteligenciaApi } from '../data-access/inteligencia-api';
import {
  etiquetaEstadoReporte,
  LIMITES_REPORTE,
  nombreInformante,
  tonoEstadoReporte,
  type ReporteCiudadano,
  type ReporteRevisado,
} from '../models/reporte';

interface Props {
  readonly reporte: ReporteCiudadano | null;
  readonly nombreCriminal: string;
  readonly zona: string | null;
  readonly puedeRevisar: boolean;
  readonly onCerrar: () => void;
  readonly onRevisado: (reporte: ReporteRevisado) => void;
}

/**
 * Revisión de un reporte ciudadano: es información no confiable hasta que un
 * oficial la lee completa y decide. Aprobar la convierte en avistamiento
 * oficial (verificado); rechazar exige el motivo.
 */
export function DialogoRevisionReporte({
  reporte,
  nombreCriminal,
  zona,
  puedeRevisar,
  onCerrar,
  onRevisado,
}: Props): React.ReactElement {
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [errorMotivo, setErrorMotivo] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<'APROBADO' | 'RECHAZADO' | null>(null);

  useEffect(() => {
    setRechazando(false);
    setMotivo('');
    setErrorMotivo(null);
  }, [reporte?.id]);

  const pendiente = reporte?.estado === 'PENDIENTE';
  const decide = Boolean(reporte && pendiente && puedeRevisar);

  async function revisar(decision: 'APROBADO' | 'RECHAZADO'): Promise<void> {
    if (!reporte) return;
    if (decision === 'RECHAZADO' && !motivo.trim()) {
      setErrorMotivo('Escribe por qué se rechaza: queda en el registro del reporte.');
      return;
    }
    setEnviando(decision);
    try {
      const revisado = await inteligenciaApi.revisarReporte(reporte.id, {
        decision,
        motivoRechazo: decision === 'RECHAZADO' ? motivo.trim() : undefined,
      });
      notificar.exito(
        decision === 'APROBADO'
          ? `Reporte aprobado: ya figura como avistamiento verificado de ${nombreCriminal}.`
          : 'Reporte rechazado. El motivo queda registrado.',
      );
      onRevisado(revisado);
    } catch {
      // El interceptor avisa; el dialogo sigue abierto con lo escrito.
    } finally {
      setEnviando(null);
    }
  }

  const acciones = !decide ? (
    <Boton onClick={onCerrar}>Cerrar</Boton>
  ) : rechazando ? (
    <>
      <Boton onClick={() => setRechazando(false)} disabled={enviando !== null}>
        Volver
      </Boton>
      <Boton
        variante="peligro"
        cargando={enviando === 'RECHAZADO'}
        textoCargando="Rechazando…"
        onClick={() => void revisar('RECHAZADO')}
      >
        Rechazar reporte
      </Boton>
    </>
  ) : (
    <>
      <Boton onClick={() => setRechazando(true)} disabled={enviando !== null}>
        Rechazar…
      </Boton>
      <Boton
        variante="principal"
        cargando={enviando === 'APROBADO'}
        textoCargando="Aprobando…"
        onClick={() => void revisar('APROBADO')}
      >
        Aprobar como avistamiento
      </Boton>
    </>
  );

  return (
    <Dialogo
      abierto={reporte !== null}
      onCerrar={onCerrar}
      bloqueado={enviando !== null}
      ancho="amplio"
      titulo={`Reporte sobre ${nombreCriminal}`}
      descripcion={
        decide
          ? 'Léelo completo antes de decidir. Si lo apruebas, entra al archivo como avistamiento verificado.'
          : undefined
      }
      acciones={acciones}
    >
      {reporte && (
        <div className="intel-revision">
          <div className="intel-revision-estado">
            <InsigniaEstado
              etiqueta={etiquetaEstadoReporte(reporte.estado)}
              tono={tonoEstadoReporte(reporte.estado)}
            />
            <span>
              Recibido el{' '}
              <time dateTime={aIso(reporte.createdAt)}>{formatearFecha(reporte.createdAt)}</time>
            </span>
          </div>

          <blockquote className="intel-revision-relato">{reporte.descripcion}</blockquote>

          <dl className="intel-datos">
            <div>
              <dt>Lugar</dt>
              <dd>{reporte.ubicacion}</dd>
            </div>
            <div>
              <dt>Zona</dt>
              <dd>{zona ?? 'No la indicó'}</dd>
            </div>
            <div>
              <dt>Cuándo lo vio</dt>
              <dd>
                {reporte.fechaHecho ? (
                  <time dateTime={aIso(reporte.fechaHecho)}>
                    {formatearFecha(reporte.fechaHecho)}
                  </time>
                ) : (
                  'No lo indicó'
                )}
              </dd>
            </div>
            <div>
              <dt>Informante</dt>
              <dd>
                {nombreInformante(reporte.informante)}
                {!reporte.informante.anonimo && reporte.informante.contacto && (
                  <small>{reporte.informante.contacto}</small>
                )}
              </dd>
            </div>
            {reporte.fechaRevision && (
              <div>
                <dt>Revisado el</dt>
                <dd>
                  <time dateTime={aIso(reporte.fechaRevision)}>
                    {formatearFecha(reporte.fechaRevision)}
                  </time>
                </dd>
              </div>
            )}
            {reporte.motivoRechazo && (
              <div className="intel-datos-ancho">
                <dt>Motivo del rechazo</dt>
                <dd>{reporte.motivoRechazo}</dd>
              </div>
            )}
          </dl>

          {decide && rechazando && (
            <CampoAreaTexto
              etiqueta="Motivo del rechazo"
              required
              rows={3}
              autoFocus
              maxLength={LIMITES_REPORTE.motivoRechazo}
              contador
              placeholder="Ej.: la descripción no coincide con el criminal; ese día estaba bajo custodia."
              value={motivo}
              error={errorMotivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                if (errorMotivo) setErrorMotivo(null);
              }}
            />
          )}
        </div>
      )}
    </Dialogo>
  );
}
