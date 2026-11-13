import { useEffect, useState, type FormEvent } from 'react';
import { useCatalogos } from '@core/catalogos/catalogos';
import { notificar } from '@core/services/notification.store';
import { etiquetaRol } from '@core/session/permiso.enum';
import { Boton } from '@shared/ui/Boton';
import { CampoSelect, CampoTexto } from '@shared/ui/Campo';
import { Dialogo } from '@shared/ui/Dialogo';
import { EstadoError, Skeleton } from '@shared/ui/Estados';
import { operativosApi } from '../data-access/operativos-api';
import {
  basesOrdenadas,
  type Operativo,
  type ResponsablePayload,
  type UsuarioDeBase,
} from '../models/operativo';

interface Props {
  readonly abierto: boolean;
  readonly onCerrar: () => void;
  readonly operativo: Operativo;
  readonly onAsignar: (responsables: ResponsablePayload[]) => Promise<void>;
}

/**
 * Responsables del operativo: se eligen entre los marines activos de las bases
 * que participan. Asignar de nuevo a alguien solo actualiza su funcion.
 */
export function DialogoResponsables({
  abierto,
  onCerrar,
  operativo,
  onAsignar,
}: Props): React.ReactElement {
  const { nombreBase } = useCatalogos();
  const basesOp = basesOrdenadas(operativo);
  const [baseId, setBaseId] = useState(operativo.baseLiderId);
  const [usuarios, setUsuarios] = useState<UsuarioDeBase[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [intento, setIntento] = useState(0);
  const [elegidos, setElegidos] = useState<Record<string, string>>({});
  const [falta, setFalta] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    let vigente = true;
    setUsuarios(null);
    setError(null);
    operativosApi
      .usuariosDeBase(baseId)
      .then((u) => vigente && setUsuarios(u.filter((x) => x.estado === 'ACTIVO')))
      .catch((e: unknown) => vigente && setError(e));
    return () => {
      vigente = false;
    };
  }, [abierto, baseId, intento]);

  const funcionActual = (id: string): string | undefined =>
    operativo.responsables.find((r) => r.usuarioId === id)?.funcion;

  function cerrar(): void {
    setElegidos({});
    setFalta(false);
    onCerrar();
  }

  async function enviar(e: FormEvent): Promise<void> {
    e.preventDefault();
    const lista = Object.entries(elegidos);
    if (lista.length === 0) {
      setFalta(true);
      return;
    }
    setGuardando(true);
    try {
      await onAsignar(
        lista.map(([usuarioId, funcion]) => ({ usuarioId, funcion: funcion.trim() || undefined })),
      );
      notificar.exito(
        lista.length === 1 ? 'Responsable asignado.' : `${lista.length} responsables asignados.`,
      );
      cerrar();
    } catch {
      // Aviso publicado por el interceptor.
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialogo
      abierto={abierto}
      onCerrar={cerrar}
      titulo={`Responsables de ${operativo.codigo}`}
      descripcion="Elige marines de las bases que participan y la función de cada uno."
      ancho="amplio"
      bloqueado={guardando}
      acciones={
        <>
          <Boton onClick={cerrar} disabled={guardando}>
            Cancelar
          </Boton>
          <Boton
            type="submit"
            form="form-responsables"
            variante="principal"
            cargando={guardando}
            textoCargando="Asignando…"
          >
            Asignar responsables
          </Boton>
        </>
      }
    >
      <form id="form-responsables" noValidate onSubmit={(e) => void enviar(e)}>
        <CampoSelect
          etiqueta="Base"
          value={baseId}
          opciones={basesOp.map((b) => ({
            valor: b.baseNavalId,
            etiqueta: `${nombreBase(b.baseNavalId) ?? b.baseNavalId}${
              b.rolParticipacion === 'LIDER' ? ' (líder)' : ''
            }`,
          }))}
          onChange={(e) => setBaseId(e.target.value)}
        />
        <fieldset className="responsables-lista" aria-busy={usuarios === null || undefined}>
          <legend className="sr-only">Marines de la base</legend>
          {error ? (
            <EstadoError error={error} onReintentar={() => setIntento((n) => n + 1)} />
          ) : usuarios === null ? (
            <>
              <Skeleton alto={20} />
              <Skeleton alto={20} ancho="70%" />
            </>
          ) : usuarios.length === 0 ? (
            <p className="objetivo-nota">
              Esta base no tiene marines activos con acceso al sistema.
            </p>
          ) : (
            usuarios.map((u) => {
              const marcado = u.id in elegidos;
              const actual = funcionActual(u.id);
              return (
                <div key={u.id} className="responsable-opcion">
                  <label className="responsable-check">
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={(e) => {
                        setFalta(false);
                        setElegidos((prev) => {
                          const sig = { ...prev };
                          if (e.target.checked) sig[u.id] = actual ?? '';
                          else delete sig[u.id];
                          return sig;
                        });
                      }}
                    />
                    <span>
                      <strong>{u.nombreCompleto}</strong>
                      <small>
                        {etiquetaRol(u.rol)}
                        {actual ? ` · ya asignado: ${actual}` : ''}
                      </small>
                    </span>
                  </label>
                  {marcado && (
                    <CampoTexto
                      etiqueta={`Función de ${u.nombreCompleto}`}
                      etiquetaOculta
                      placeholder="Comandante en el terreno"
                      maxLength={100}
                      value={elegidos[u.id]}
                      onChange={(e) => setElegidos((p) => ({ ...p, [u.id]: e.target.value }))}
                    />
                  )}
                </div>
              );
            })
          )}
        </fieldset>
        {falta && (
          <p className="ui-campo-error" role="alert">
            Marca al menos un marine.
          </p>
        )}
      </form>
    </Dialogo>
  );
}
