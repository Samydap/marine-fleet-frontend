import { useState, type FormEvent } from 'react';
import { notificar } from '@core/services/notification.store';
import { Boton } from '@shared/ui/Boton';
import { CampoAreaTexto } from '@shared/ui/Campo';
import { Dialogo } from '@shared/ui/Dialogo';
import { IconoAlerta } from '@shared/ui/iconos';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import {
  RESULTADOS,
  etiquetaResultado,
  tonoResultado,
  type ResultadoOperativo,
} from '../models/operativo';

interface Props {
  readonly abierto: boolean;
  readonly onCerrar: () => void;
  readonly codigo: string;
  /** Version leida al abrir: si otra base cambia el operativo, el backend responde 409. */
  readonly version: number;
  readonly onCerrarOperativo: (
    resultado: ResultadoOperativo,
    observaciones: string | undefined,
    version: number,
  ) => Promise<void>;
}

const AYUDA: Readonly<Record<ResultadoOperativo, string>> = {
  EXITOSO: 'Se cumplió el objetivo.',
  PARCIAL: 'Se cumplió una parte (capturas sin el objetivo principal, por ejemplo).',
  FALLIDO: 'No se cumplió: el objetivo escapó o el despliegue no llegó a tiempo.',
};

/** Completa el operativo con su resultado y observaciones. Solo desde EN_CURSO. */
export function DialogoCierre({
  abierto,
  onCerrar,
  codigo,
  version,
  onCerrarOperativo,
}: Props): React.ReactElement {
  const [resultado, setResultado] = useState<ResultadoOperativo | ''>('');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function enviar(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!resultado) {
      setError('Elige el resultado del operativo.');
      return;
    }
    setGuardando(true);
    try {
      await onCerrarOperativo(resultado, observaciones.trim() || undefined, version);
      notificar.exito(`Operativo ${codigo} completado.`);
      setResultado('');
      setObservaciones('');
      onCerrar();
    } catch {
      // 409 o validacion: lo resuelve la ficha (AlertaConflicto) o el interceptor.
      onCerrar();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialogo
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={`Completar ${codigo}`}
      descripcion="El cierre es definitivo. El estado de cada criminal se registra en los incidentes."
      bloqueado={guardando}
      acciones={
        <>
          <Boton onClick={onCerrar} disabled={guardando}>
            Cancelar
          </Boton>
          <Boton
            type="submit"
            form="form-cierre"
            variante="principal"
            cargando={guardando}
            textoCargando="Completando…"
          >
            Completar operativo
          </Boton>
        </>
      }
    >
      <form id="form-cierre" noValidate onSubmit={(e) => void enviar(e)}>
        <fieldset
          className="cierre-resultados"
          aria-describedby={error ? 'cierre-resultado-error' : undefined}
        >
          <legend className="ui-campo-etiqueta">
            Resultado
            <span className="ui-campo-obligatorio" aria-hidden="true">
              {' '}
              *
            </span>
          </legend>
          {RESULTADOS.map((r) => (
            <label key={r} className="cierre-resultado">
              <input
                type="radio"
                name="resultado"
                value={r}
                required
                checked={resultado === r}
                onChange={() => {
                  setResultado(r);
                  setError(null);
                }}
              />
              <span>
                <InsigniaEstado etiqueta={etiquetaResultado(r)} tono={tonoResultado(r)} />
                <small>{AYUDA[r]}</small>
              </span>
            </label>
          ))}
          {error && (
            <p id="cierre-resultado-error" className="ui-campo-error">
              <IconoAlerta tamano={16} />
              {error}
            </p>
          )}
        </fieldset>
        <CampoAreaTexto
          etiqueta="Observaciones"
          maxLength={4000}
          contador
          rows={4}
          placeholder="Qué pasó, quién escapó y hacia dónde."
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </form>
    </Dialogo>
  );
}
