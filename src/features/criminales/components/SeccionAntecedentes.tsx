import { useState, type FormEvent } from 'react';
import { notificar } from '@core/services/notification.store';
import { Boton } from '@shared/ui/Boton';
import { CampoAreaTexto, CampoTexto } from '@shared/ui/Campo';
import { Dialogo } from '@shared/ui/Dialogo';
import { EstadoError, EstadoVacio } from '@shared/ui/Estados';
import { IconoMas } from '@shared/ui/iconos';
import { aIso, formatearSoloFecha, valorFechaLocal } from '@shared/utils/fecha';
import { criminalesApi } from '../data-access/criminales-api';
import type { Antecedente } from '../models/criminal';

interface Props {
  readonly criminalId: string;
  readonly nombre: string;
  readonly antecedentes: readonly Antecedente[];
  readonly error: unknown;
  readonly puedeEscribir: boolean;
  readonly onReintentar: () => void;
  readonly onRegistrado: () => void;
}

/** Del hecho mas reciente al mas antiguo; sin fecha del hecho, por fecha de registro. */
function ordenar(lista: readonly Antecedente[]): Antecedente[] {
  const clave = (a: Antecedente): number => new Date(a.fechaHecho ?? a.createdAt).getTime();
  return [...lista].sort((a, b) => clave(b) - clave(a));
}

/** Antecedentes y delitos: un registro cronologico, no tarjetas. */
export function SeccionAntecedentes({
  criminalId,
  nombre,
  antecedentes,
  error,
  puedeEscribir,
  onReintentar,
  onRegistrado,
}: Props): React.ReactElement {
  const [abierto, setAbierto] = useState(false);

  return (
    <section className="expediente-seccion" aria-labelledby="sec-antecedentes">
      <div className="expediente-seccion-cabecera">
        <h2 id="sec-antecedentes">
          Antecedentes y delitos
          {antecedentes.length > 0 && (
            <span className="expediente-contador cifra">{antecedentes.length}</span>
          )}
        </h2>
        {puedeEscribir && (
          <Boton
            tamano="compacto"
            icono={<IconoMas tamano={16} />}
            onClick={() => setAbierto(true)}
          >
            Registrar delito
          </Boton>
        )}
      </div>

      {error && antecedentes.length === 0 ? (
        <EstadoError variante="en-panel" error={error} onReintentar={onReintentar} />
      ) : antecedentes.length === 0 ? (
        <EstadoVacio
          variante="en-panel"
          titulo="Sin antecedentes registrados"
          detalle="Los delitos que se documenten aparecerán aquí en orden cronológico."
        />
      ) : (
        <ol className="antecedentes">
          {ordenar(antecedentes).map((a) => (
            <li key={a.id} className="antecedente">
              <div className="antecedente-cabecera">
                <h3>{a.tipoDelito}</h3>
                <time dateTime={aIso(a.fechaHecho ?? a.createdAt)}>
                  {a.fechaHecho ? formatearSoloFecha(a.fechaHecho) : 'Fecha del hecho desconocida'}
                </time>
              </div>
              {a.ubicacion && <p className="antecedente-lugar">{a.ubicacion}</p>}
              <p className="antecedente-descripcion">{a.descripcion}</p>
            </li>
          ))}
        </ol>
      )}

      <DialogoAntecedente
        abierto={abierto}
        criminalId={criminalId}
        nombre={nombre}
        onCerrar={() => setAbierto(false)}
        onRegistrado={() => {
          setAbierto(false);
          onRegistrado();
        }}
      />
    </section>
  );
}

interface PropsDialogo {
  readonly abierto: boolean;
  readonly criminalId: string;
  readonly nombre: string;
  readonly onCerrar: () => void;
  readonly onRegistrado: () => void;
}

interface Borrador {
  tipoDelito: string;
  descripcion: string;
  fechaHecho: string;
  ubicacion: string;
}

const VACIO: Borrador = { tipoDelito: '', descripcion: '', fechaHecho: '', ubicacion: '' };

/** Mismas reglas que RegistrarAntecedenteDto. */
export function validarAntecedente(b: Borrador): Partial<Record<keyof Borrador, string>> {
  const errores: Partial<Record<keyof Borrador, string>> = {};
  const tipo = b.tipoDelito.trim();
  const descripcion = b.descripcion.trim();
  if (tipo.length < 3) errores.tipoDelito = 'Nombra el delito (al menos 3 caracteres).';
  if (descripcion.length < 3) errores.descripcion = 'Describe qué ocurrió (al menos 3 caracteres).';
  if (b.fechaHecho && b.fechaHecho > valorFechaLocal()) {
    errores.fechaHecho = 'La fecha del hecho no puede ser futura.';
  }
  return errores;
}

function DialogoAntecedente({
  abierto,
  criminalId,
  nombre,
  onCerrar,
  onRegistrado,
}: PropsDialogo): React.ReactElement {
  const [b, setB] = useState<Borrador>(VACIO);
  const [errores, setErrores] = useState<Partial<Record<keyof Borrador, string>>>({});
  const [enviando, setEnviando] = useState(false);

  function cerrar(): void {
    setB(VACIO);
    setErrores({});
    onCerrar();
  }

  async function enviar(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const encontrados = validarAntecedente(b);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) return;
    setEnviando(true);
    try {
      await criminalesApi.registrarAntecedente(criminalId, {
        tipoDelito: b.tipoDelito.trim(),
        descripcion: b.descripcion.trim(),
        fechaHecho: b.fechaHecho ? new Date(`${b.fechaHecho}T00:00:00`).toISOString() : undefined,
        ubicacion: b.ubicacion.trim() || undefined,
      });
      notificar.exito('Antecedente registrado.');
      setB(VACIO);
      onRegistrado();
    } catch {
      // Aviso publicado por el interceptor; el dialogo conserva lo escrito.
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialogo
      abierto={abierto}
      onCerrar={cerrar}
      bloqueado={enviando}
      ancho="amplio"
      titulo={`Registrar un delito de ${nombre}`}
      descripcion="Queda en su expediente y en el historial con tu usuario."
      acciones={
        <>
          <Boton onClick={cerrar} disabled={enviando}>
            Cancelar
          </Boton>
          <Boton
            type="submit"
            form="form-antecedente"
            variante="principal"
            cargando={enviando}
            textoCargando="Registrando…"
          >
            Registrar delito
          </Boton>
        </>
      }
    >
      <form
        id="form-antecedente"
        className="ui-form-grilla"
        noValidate
        onSubmit={(e) => void enviar(e)}
      >
        <CampoTexto
          etiqueta="Delito"
          required
          maxLength={100}
          placeholder="Ej.: Ataque a un buque de la Marina"
          value={b.tipoDelito}
          error={errores.tipoDelito}
          claseContenedor="ui-campo--ancho"
          onChange={(e) => setB({ ...b, tipoDelito: e.target.value })}
        />
        <CampoTexto
          etiqueta="Fecha del hecho"
          type="date"
          max={valorFechaLocal()}
          value={b.fechaHecho}
          error={errores.fechaHecho}
          onChange={(e) => setB({ ...b, fechaHecho: e.target.value })}
        />
        <CampoTexto
          etiqueta="Lugar"
          maxLength={500}
          placeholder="Ej.: Archipiélago Sabaody"
          value={b.ubicacion}
          onChange={(e) => setB({ ...b, ubicacion: e.target.value })}
        />
        <CampoAreaTexto
          etiqueta="Qué ocurrió"
          required
          maxLength={4000}
          contador
          rows={5}
          value={b.descripcion}
          error={errores.descripcion}
          claseContenedor="ui-campo--ancho"
          onChange={(e) => setB({ ...b, descripcion: e.target.value })}
        />
      </form>
    </Dialogo>
  );
}
