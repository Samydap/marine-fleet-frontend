import { olvidarCriminal, useCriminal } from '@core/directorio/directorio-criminales';
import { useEffect, useState } from 'react';
import { notificar } from '@core/services/notification.store';
import { useUsuario } from '@core/session/session.store';
import { EVENTOS } from '@core/sync/eventos';
import { useCambiosSincronizados } from '@core/sync/sincronizacion';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { BadgeAmenaza } from '@shared/ui/BadgeAmenaza';
import { Boton } from '@shared/ui/Boton';
import { CampoAreaTexto } from '@shared/ui/Campo';
import { Dialogo } from '@shared/ui/Dialogo';
import { EstadoError, EstadoVacio, Skeleton } from '@shared/ui/Estados';
import { IconoExito } from '@shared/ui/iconos';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { InsigniaTipoCriminal } from '@shared/ui/InsigniaTipoCriminal';
import { MontoBerries } from '@shared/ui/MontoBerries';
import { CeldaCriminal } from '@shared/ui/CeldaCriminal';
import { PageHeader } from '@shared/ui/PageHeader';
import { Paginacion } from '@shared/ui/Paginacion';
import { formatearBerries } from '@shared/utils/berries';
import { aIso, formatearFecha, tiempoRelativo } from '@shared/utils/fecha';
import { SeccionesRecompensas } from '../components/SeccionesRecompensas';
import { recompensasApi } from '../data-access/recompensas-api';
import { useRecompensasStore } from '../data-access/recompensas.store';
import { MOTIVO_MAXIMO, diferenciaMonto, type Recompensa } from '../models/recompensa';
import '../recompensas.css';

type Decision = { readonly recompensa: Recompensa; readonly aprobar: boolean };

function Expediente({
  recompensa,
  propia,
  onDecidir,
}: {
  readonly recompensa: Recompensa;
  readonly propia: boolean;
  readonly onDecidir: (aprobar: boolean) => void;
}): React.ReactElement {
  const criminal = useCriminal(recompensa.criminalId);
  const vigente = criminal?.recompensaVigenteMonto ?? null;
  const diferencia = diferenciaMonto(recompensa.monto, vigente);
  const idTitulo = `expediente-${recompensa.id}`;

  return (
    <li className="expediente" aria-labelledby={idTitulo}>
      <div className="expediente-criminal" id={idTitulo}>
        <CeldaCriminal
          criminalId={recompensa.criminalId}
          nombre={recompensa.criminalNombre}
          fotoUrl={recompensa.criminalFotoUrl}
          tamano="md"
        />
        {criminal && (
          <div className="expediente-insignias">
            <InsigniaTipoCriminal categoria={criminal.organizacion?.categoria ?? null} />
            <BadgeAmenaza nivel={criminal.nivelAmenaza} />
          </div>
        )}
      </div>

      <dl className="expediente-montos">
        <div>
          <dt>Solicita</dt>
          <dd>
            <MontoBerries valor={recompensa.monto} tamano="grande" altoRango />
          </dd>
        </div>
        <div>
          <dt>Vigente hoy</dt>
          <dd>
            {criminal === undefined ? (
              <Skeleton ancho="6rem" />
            ) : (
              <>
                <MontoBerries valor={vigente} abreviado />
                {diferencia !== null && diferencia !== 0 && (
                  <span className="expediente-diferencia cifra">
                    {diferencia > 0 ? '+' : '−'} {formatearBerries(Math.abs(diferencia), true)}
                  </span>
                )}
              </>
            )}
          </dd>
        </div>
      </dl>

      <div className="expediente-contexto">
        <p className="expediente-solicitud">
          Solicitada{' '}
          <time
            dateTime={aIso(recompensa.fechaSolicitud)}
            title={formatearFecha(recompensa.fechaSolicitud)}
          >
            {tiempoRelativo(recompensa.fechaSolicitud)}
          </time>
          {propia
            ? ' por ti'
            : recompensa.solicitadaPorNombre && ` por ${recompensa.solicitadaPorNombre}`}
        </p>
        {recompensa.motivo ? (
          <blockquote className="expediente-motivo">{recompensa.motivo}</blockquote>
        ) : (
          <p className="recompensa-sin-dato">La solicitud no trae motivo.</p>
        )}
      </div>

      <div className="expediente-acciones">
        {propia ? (
          <p className="expediente-propia">
            La solicitaste tú: debe validarla otro oficial con rango.
          </p>
        ) : (
          <>
            <Boton tamano="compacto" onClick={() => onDecidir(false)}>
              Rechazar
            </Boton>
            <Boton tamano="compacto" variante="autoridad" onClick={() => onDecidir(true)}>
              Validar recompensa
            </Boton>
          </>
        )}
      </div>
    </li>
  );
}

function DialogoDecision({
  decision,
  onCerrar,
  onResuelta,
}: {
  readonly decision: Decision | null;
  readonly onCerrar: () => void;
  readonly onResuelta: (r: Recompensa, aprobada: boolean) => void;
}): React.ReactElement {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enCurso, setEnCurso] = useState(false);
  const delDirectorio = useCriminal(
    decision && decision.recompensa.criminalNombre === undefined
      ? decision.recompensa.criminalId
      : null,
  );
  const nombre = decision?.recompensa.criminalNombre ?? delDirectorio?.nombre ?? null;

  useEffect(() => {
    setMotivo('');
    setError(null);
  }, [decision]);

  if (!decision) return <Dialogo abierto={false} onCerrar={onCerrar} titulo="" />;

  const { recompensa, aprobar } = decision;
  const monto = formatearBerries(recompensa.monto);
  const objeto = nombre ?? 'este criminal';

  async function confirmar(): Promise<void> {
    if (!aprobar && motivo.trim().length === 0) {
      setError('Escribe por qué se rechaza: lo verá la base que la pidió.');
      return;
    }
    setEnCurso(true);
    try {
      const resultado = await recompensasApi.validar(recompensa.id, {
        aprobar,
        motivo: motivo.trim() || undefined,
      });
      onResuelta(resultado, aprobar);
    } catch {
      // El interceptor ya aviso; el dialogo queda abierto para reintentar o cancelar.
    } finally {
      setEnCurso(false);
    }
  }

  return (
    <Dialogo
      abierto
      onCerrar={onCerrar}
      bloqueado={enCurso}
      titulo={aprobar ? `¿Validar ${monto} para ${objeto}?` : `¿Rechazar ${monto} para ${objeto}?`}
      descripcion={
        aprobar
          ? 'La recompensa entra en vigor ahora, reemplaza la anterior y el cartel se regenera en todas las bases.'
          : 'La solicitud se cierra y la recompensa vigente no cambia.'
      }
      acciones={
        <>
          <Boton onClick={onCerrar} disabled={enCurso}>
            Cancelar
          </Boton>
          {aprobar ? (
            <Boton
              variante="autoridad"
              cargando={enCurso}
              textoCargando="Validando…"
              onClick={() => void confirmar()}
            >
              Validar recompensa
            </Boton>
          ) : (
            <Boton
              variante="peligro"
              cargando={enCurso}
              textoCargando="Rechazando…"
              onClick={() => void confirmar()}
            >
              Rechazar solicitud
            </Boton>
          )}
        </>
      }
    >
      <CampoAreaTexto
        etiqueta={aprobar ? 'Observación' : 'Motivo del rechazo'}
        required={!aprobar}
        value={motivo}
        onChange={(e) => {
          setMotivo(e.target.value);
          setError(null);
        }}
        maxLength={MOTIVO_MAXIMO}
        contador
        rows={3}
        error={error}
        ayuda={aprobar ? 'Opcional. Queda en el historial de la recompensa.' : undefined}
      />
    </Dialogo>
  );
}

/**
 * RF-1 · Bandeja del Almirante: recompensas de alto rango (desde 1.000
 * millones de berries) que esperan firma. Aqui va el dorado de autoridad: el
 * monto solicitado y el boton de validar.
 */
export function ValidacionPage(): React.ReactElement {
  const usuario = useUsuario();
  const { pendientes, cargarPendientes, quitarPendiente } = useRecompensasStore();
  const [decision, setDecision] = useState<Decision | null>(null);

  useEffect(() => {
    void cargarPendientes(1);
  }, [cargarPendientes]);

  // Otra base pidio una recompensa, u otro Almirante ya firmo una de la bandeja.
  useCambiosSincronizados(
    [EVENTOS.RECOMPENSA_SOLICITADA, EVENTOS.RECOMPENSA_VIGENTE],
    () => void cargarPendientes(),
  );
  useCambiosSincronizados<{ criminalId: string }>(
    [EVENTOS.CRIMINAL_ACTUALIZADO, EVENTOS.CRIMINAL_ESTADO_CAMBIADO],
    (cambio) => olvidarCriminal(cambio.datos.criminalId),
  );

  const { recompensas, meta, cargando, error, consultadoEn } = pendientes;
  const primeraCarga = cargando && consultadoEn === null;

  function resuelta(r: Recompensa, aprobada: boolean): void {
    setDecision(null);
    quitarPendiente(r.id);
    olvidarCriminal(r.criminalId);
    if (aprobada) {
      notificar.exito(`Recompensa validada: ${formatearBerries(r.monto)} ya está vigente.`);
    } else {
      notificar.info('Solicitud rechazada. La recompensa anterior sigue vigente.');
    }
    void cargarPendientes();
  }

  return (
    <>
      <PageHeader
        titulo="Validación de alto rango"
        descripcion="Recompensas desde 1.000 millones de berries que esperan la firma de un Almirante."
        meta={
          consultadoEn && (
            <>
              <InsigniaEstado
                etiqueta={
                  meta.total === 1
                    ? '1 por validar'
                    : `${meta.total.toLocaleString('es-CO')} por validar`
                }
                tono={meta.total > 0 ? 'aviso' : 'exito'}
              />
              <ActualizadoHace fecha={consultadoEn} prefijo="Consultado" />
            </>
          )
        }
      />
      <SeccionesRecompensas />

      {error && recompensas.length === 0 ? (
        <EstadoError
          error={error}
          onReintentar={() => void cargarPendientes()}
          reintentando={cargando}
        />
      ) : primeraCarga ? (
        <div className="recompensas-panel bandeja" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="expediente expediente--esqueleto">
              <Skeleton forma="bloque" ancho={48} alto={48} />
              <Skeleton ancho="40%" />
              <Skeleton ancho="25%" />
            </div>
          ))}
          <span className="sr-only">Cargando la bandeja</span>
        </div>
      ) : recompensas.length === 0 ? (
        <EstadoVacio
          variante="pantalla"
          icono={<IconoExito tamano={28} />}
          titulo="No hay recompensas esperando firma"
          detalle="Cuando una base pida un monto de alto rango, aparecerá aquí."
        />
      ) : (
        <section
          className={`recompensas-panel bandeja${cargando ? ' bandeja--actualizando' : ''}`}
          aria-label="Recompensas por validar"
          aria-busy={cargando || undefined}
        >
          <ol className="bandeja-lista">
            {recompensas.map((r) => (
              <Expediente
                key={r.id}
                recompensa={r}
                propia={r.solicitadaPor !== null && r.solicitadaPor === usuario?.id}
                onDecidir={(aprobar) => setDecision({ recompensa: r, aprobar })}
              />
            ))}
          </ol>
        </section>
      )}

      <Paginacion
        meta={meta}
        sustantivo="solicitudes"
        deshabilitada={cargando}
        onCambiarPagina={(p) => void cargarPendientes(p)}
      />

      <DialogoDecision
        decision={decision}
        onCerrar={() => setDecision(null)}
        onResuelta={resuelta}
      />
    </>
  );
}
