import { useState } from 'react';
import { notificar } from '@core/services/notification.store';
import { Boton } from '@shared/ui/Boton';
import { CampoAreaTexto, CampoSelect } from '@shared/ui/Campo';
import { DialogoConfirmacion } from '@shared/ui/Dialogo';
import { incidentesApi } from '../data-access/incidentes-api';
import {
  cambiaEstadoCriminal,
  etiquetaResultado,
  etiquetaRol,
  LIMITES_INCIDENTE,
  opcionesDesenlace,
  opcionesResultadoFinal,
  resumirNombres,
  type DesenlaceParticipante,
  type Incidente,
  type ResultadoFinal,
} from '../models/incidente';

interface PropsCierre {
  readonly incidente: Incidente;
  readonly nombreDe: (criminalId: string) => string;
  readonly onCerrado: (incidente: Incidente) => void;
  readonly onConflicto: (error: unknown) => void;
}

/** El elemento principal de un enfrentamiento abierto: cerrarlo con su resultado. */
export function FormularioCierre({
  incidente,
  nombreDe,
  onCerrado,
  onConflicto,
}: PropsCierre): React.ReactElement {
  const [resultado, setResultado] = useState<ResultadoFinal | ''>('');
  const [errorResultado, setErrorResultado] = useState<string | null>(null);
  const [desenlaces, setDesenlaces] = useState<Record<string, DesenlaceParticipante>>(() =>
    Object.fromEntries(incidente.criminales.map((c) => [c.criminalId, c.desenlace])),
  );
  const [observaciones, setObservaciones] = useState('');
  const [confirmar, setConfirmar] = useState(false);

  const conBaja = incidente.criminales.filter((c) =>
    cambiaEstadoCriminal(desenlaces[c.criminalId] ?? 'DESCONOCIDO'),
  );

  function pedirConfirmacion(): void {
    if (!resultado) {
      setErrorResultado('Elige cómo terminó el enfrentamiento.');
      return;
    }
    setConfirmar(true);
  }

  async function cerrar(): Promise<void> {
    if (!resultado) return;
    try {
      const cerrado = await incidentesApi.cerrar(incidente.id, {
        resultado,
        desenlaces: incidente.criminales.map((c) => ({
          criminalId: c.criminalId,
          desenlace: desenlaces[c.criminalId] ?? c.desenlace,
        })),
        observaciones: observaciones.trim() || undefined,
        version: incidente.version,
      });
      notificar.exito(
        `Enfrentamiento cerrado: ${etiquetaResultado(cerrado.resultado).toLowerCase()}.`,
      );
      onCerrado(cerrado);
    } catch (e) {
      onConflicto(e);
    }
  }

  return (
    <section className="inc-panel inc-panel--cierre" aria-labelledby="inc-cierre">
      <h2 id="inc-cierre" className="inc-panel-titulo">
        Cerrar enfrentamiento
      </h2>
      <p className="inc-nota">
        Sigue en curso. Al cerrarlo se fija el resultado y lo que pasó con cada criminal; el cierre
        no se puede deshacer.
      </p>

      <div className="ui-form-grilla">
        <CampoSelect
          etiqueta="Resultado"
          required
          opcionVacia="Elige el resultado"
          value={resultado}
          opciones={opcionesResultadoFinal()}
          error={errorResultado}
          onChange={(e) => {
            setResultado(e.target.value as ResultadoFinal | '');
            setErrorResultado(null);
          }}
        />
      </div>

      <ul className="inc-lista inc-lista--desenlaces">
        {incidente.criminales.map((c) => (
          <li key={c.criminalId} className="inc-lista-fila">
            <span className="inc-celda-doble">
              <strong className="inc-texto-largo">{nombreDe(c.criminalId)}</strong>
              <small>{etiquetaRol(c.rolEnIncidente)}</small>
            </span>
            <CampoSelect
              etiqueta={`Desenlace de ${nombreDe(c.criminalId)}`}
              etiquetaOculta
              claseContenedor="inc-desenlace"
              value={desenlaces[c.criminalId] ?? c.desenlace}
              opciones={opcionesDesenlace()}
              onChange={(e) =>
                setDesenlaces((d) => ({
                  ...d,
                  [c.criminalId]: e.target.value as DesenlaceParticipante,
                }))
              }
            />
          </li>
        ))}
      </ul>

      <CampoAreaTexto
        etiqueta="Observaciones del cierre"
        rows={3}
        maxLength={LIMITES_INCIDENTE.observaciones}
        contador
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
      />

      <div className="inc-cierre-acciones">
        <Boton variante="principal" onClick={pedirConfirmacion}>
          Cerrar enfrentamiento
        </Boton>
      </div>

      <DialogoConfirmacion
        abierto={confirmar}
        onCerrar={() => setConfirmar(false)}
        onConfirmar={cerrar}
        titulo={`¿Cerrar el enfrentamiento con resultado ${resultado ? etiquetaResultado(resultado).toLowerCase() : ''}?`}
        mensaje={
          conBaja.length > 0
            ? `${resumirNombres(conBaja.map((c) => nombreDe(c.criminalId)))} dejarán de estar en búsqueda: el archivo criminal los marcará como capturados o muertos. El cierre no se puede deshacer.`
            : 'Quedará como historial del enfrentamiento. El cierre no se puede deshacer.'
        }
        textoConfirmar="Cerrar enfrentamiento"
        textoConfirmando="Cerrando…"
      />
    </section>
  );
}
