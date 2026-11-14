import {
  olvidarCriminal,
  resolverCriminales,
  useDirectorioStore,
} from '@core/directorio/directorio-criminales';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApiError } from '@core/models/api-response';
import { notificar } from '@core/services/notification.store';
import { Alerta } from '@shared/ui/Alerta';
import { BadgeAmenaza } from '@shared/ui/BadgeAmenaza';
import { Boton, BotonEnlace } from '@shared/ui/Boton';
import { CampoAreaTexto, CampoTexto } from '@shared/ui/Campo';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { MontoBerries } from '@shared/ui/MontoBerries';
import { PageHeader } from '@shared/ui/PageHeader';
import { SelectorCriminal } from '@shared/ui/SelectorCriminal';
import { formatearBerries } from '@shared/utils/berries';
import { recompensasApi } from '../data-access/recompensas-api';
import { SeccionesRecompensas } from '../components/SeccionesRecompensas';
import {
  MOTIVO_MAXIMO,
  UMBRAL_ALTO_RANGO,
  diferenciaMonto,
  esAltoRango,
  leerMonto,
  nivelEstimado,
  validarSolicitud,
  type CriminalResumen,
  type ErroresSolicitud,
  type RangoAmenaza,
} from '../models/recompensa';
import '../recompensas.css';

/** Errores de negocio de SolicitarRecompensaUseCase que la pantalla explica en linea. */
const EXPLICACION_ERROR: Readonly<Record<string, { titulo: string; detalle: string }>> = {
  RECOMPENSA_PENDIENTE_EXISTENTE: {
    titulo: 'Este criminal ya tiene una solicitud esperando al Almirante',
    detalle: 'Hasta que se valide o se rechace no se puede pedir otro monto.',
  },
  CRIMINAL_NO_ACTIVO: {
    titulo: 'El criminal ya no está en búsqueda',
    detalle: 'Otra base registró su captura o su muerte. No se emiten recompensas nuevas.',
  },
};

function textoDiferencia(diferencia: number): string {
  const signo = diferencia > 0 ? '+' : '−';
  return `${signo} ${formatearBerries(Math.abs(diferencia), true)}`;
}

/**
 * RF-1 · Registrar o actualizar el monto de la recompensa de un criminal.
 *
 * Lo principal es la decision: cuanto, para quien y que pasara al enviarla
 * (rige de inmediato o va a la bandeja del Almirante). Por eso el resumen de la
 * derecha cambia mientras se escribe.
 */
export function SolicitudPage(): React.ReactElement {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const idInicial = params.get('criminal');

  const [criminal, setCriminal] = useState<CriminalResumen | null>(null);
  const [cargandoInicial, setCargandoInicial] = useState(Boolean(idInicial));
  const [montoTexto, setMontoTexto] = useState('');
  const [motivo, setMotivo] = useState('');
  const [errores, setErrores] = useState<ErroresSolicitud>({});
  const [intentado, setIntentado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorNegocio, setErrorNegocio] = useState<string | null>(null);
  const [rangos, setRangos] = useState<readonly RangoAmenaza[]>([]);

  // Criminal que llega desde su ficha: /recompensas/solicitar?criminal=<id>.
  useEffect(() => {
    if (!idInicial) return;
    let vigente = true;
    void resolverCriminales([idInicial]).finally(() => {
      if (!vigente) return;
      setCriminal(useDirectorioStore.getState().porId[idInicial] ?? null);
      setCargandoInicial(false);
    });
    return () => {
      vigente = false;
    };
  }, [idInicial]);

  useEffect(() => {
    recompensasApi
      .criteriosAmenaza()
      .then(setRangos)
      .catch(() => setRangos([]));
  }, []);

  const datos = { criminal, montoTexto, motivo };
  // Tras el primer intento los errores se recalculan mientras se corrige.
  const erroresVisibles = intentado ? validarSolicitud(datos) : errores;

  const monto = leerMonto(montoTexto);
  const montoValido = monto !== null && monto >= 1 && !erroresVisibles.monto;
  const altoRango = montoValido && esAltoRango(monto);
  const nivel = montoValido ? nivelEstimado(monto, rangos) : null;
  const diferencia =
    montoValido && criminal ? diferenciaMonto(monto, criminal.recompensaVigenteMonto) : null;

  async function enviar(e: FormEvent): Promise<void> {
    e.preventDefault();
    setIntentado(true);
    const encontrados = validarSolicitud(datos);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0 || !criminal || monto === null) return;

    setEnviando(true);
    setErrorNegocio(null);
    try {
      const creada = await recompensasApi.solicitar({
        criminalId: criminal.id,
        monto,
        motivo: motivo.trim() || undefined,
      });
      // El monto vigente cambio: la proxima tabla lo vuelve a pedir.
      olvidarCriminal(criminal.id);
      if (creada.estado === 'VIGENTE') {
        notificar.exito(
          `Recompensa vigente: ${formatearBerries(creada.monto)} por ${criminal.nombre}.`,
        );
      } else {
        notificar.info(
          `Solicitud enviada al Almirante: ${formatearBerries(creada.monto)} por ${criminal.nombre}.`,
        );
      }
      navigate('/recompensas');
    } catch (error) {
      if (error instanceof ApiError && EXPLICACION_ERROR[error.codigo]) {
        setErrorNegocio(error.codigo);
      }
    } finally {
      setEnviando(false);
    }
  }

  const explicacion = errorNegocio ? EXPLICACION_ERROR[errorNegocio] : null;

  return (
    <>
      <PageHeader
        titulo="Solicitar recompensa"
        descripcion="Fija o actualiza el monto en berries de un criminal en búsqueda."
      />
      <SeccionesRecompensas />

      <form className="solicitud" onSubmit={(e) => void enviar(e)} noValidate>
        <section
          className="recompensas-panel solicitud-formulario"
          aria-labelledby="solicitud-datos"
        >
          <h2 id="solicitud-datos" className="recompensas-panel-titulo">
            Datos de la solicitud
          </h2>

          {explicacion && (
            <Alerta tipo="aviso" titulo={explicacion.titulo}>
              {explicacion.detalle}
            </Alerta>
          )}

          <SelectorCriminal
            etiqueta="Criminal"
            obligatorio
            montoAltoRango={(m) => m !== null && esAltoRango(m)}
            seleccionado={criminal}
            cargandoInicial={cargandoInicial}
            onSeleccionar={(c) => {
              setCriminal(c);
              setErrorNegocio(null);
            }}
            error={erroresVisibles.criminal}
          />

          <CampoTexto
            etiqueta="Monto en berries"
            required
            inputMode="numeric"
            autoComplete="off"
            placeholder="Por ejemplo 150000000"
            value={montoTexto}
            onChange={(e) => setMontoTexto(e.target.value)}
            error={erroresVisibles.monto}
            ayuda={
              montoValido
                ? `${formatearBerries(monto)} (${formatearBerries(monto, true)})`
                : `Desde ${formatearBerries(UMBRAL_ALTO_RANGO)} requiere la firma del Almirante.`
            }
          />

          <CampoAreaTexto
            etiqueta="Motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            maxLength={MOTIVO_MAXIMO}
            contador
            rows={3}
            error={erroresVisibles.motivo}
            ayuda="Opcional. Hechos que justifican el monto; lo leerá quien valide."
          />

          <div className="ui-form-acciones">
            <BotonEnlace to="/recompensas" variante="secundario">
              Cancelar
            </BotonEnlace>
            <Boton type="submit" variante="principal" cargando={enviando} textoCargando="Enviando…">
              {altoRango ? 'Enviar al Almirante' : 'Fijar recompensa'}
            </Boton>
          </div>
        </section>

        <aside className="recompensas-panel solicitud-resumen" aria-labelledby="solicitud-resumen">
          <h2 id="solicitud-resumen" className="recompensas-panel-titulo">
            Qué pasará al enviarla
          </h2>
          <dl className="solicitud-resumen-datos">
            <div>
              <dt>Nuevo monto</dt>
              <dd>
                {montoValido ? (
                  <MontoBerries valor={monto} tamano="grande" altoRango={altoRango} />
                ) : (
                  <span className="recompensa-sin-dato">Escribe un monto</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Frente al vigente</dt>
              <dd className="cifra">
                {diferencia === null
                  ? criminal && montoValido
                    ? 'Sin recompensa previa'
                    : '—'
                  : diferencia === 0
                    ? 'Sin cambio'
                    : textoDiferencia(diferencia)}
              </dd>
            </div>
            <div>
              <dt>Nivel de amenaza estimado</dt>
              <dd>
                {nivel ? <BadgeAmenaza nivel={nivel} /> : '—'}
                {nivel && nivel !== 'ALTO' && nivel !== 'PENDIENTE' && (
                  <small className="solicitud-nota">
                    Sube un nivel si opera en la Grand Line o cerca del Cuartel General.
                  </small>
                )}
              </dd>
            </div>
            <div>
              <dt>Trámite</dt>
              <dd>
                {!montoValido ? (
                  '—'
                ) : altoRango ? (
                  <span className="solicitud-tramite">
                    <InsigniaEstado etiqueta="Pendiente de validación" tono="aviso" />
                    <small className="solicitud-nota">
                      Es de alto rango: queda en la bandeja del Almirante y rige cuando otro oficial
                      con rango la valide. El monto actual sigue vigente mientras tanto.
                    </small>
                  </span>
                ) : (
                  <span className="solicitud-tramite">
                    <InsigniaEstado etiqueta="Vigente al enviar" tono="exito" />
                    <small className="solicitud-nota">
                      Reemplaza la recompensa actual y el cartel se regenera.
                    </small>
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </aside>
      </form>
    </>
  );
}
