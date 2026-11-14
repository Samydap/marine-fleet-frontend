import { useState, type FormEvent } from 'react';
import { useCatalogos } from '@core/catalogos/catalogos';
import { notificar } from '@core/services/notification.store';
import { Boton, BotonIcono } from '@shared/ui/Boton';
import { CampoSelect, CampoTexto } from '@shared/ui/Campo';
import { Dialogo } from '@shared/ui/Dialogo';
import { IconoCerrar, IconoMas } from '@shared/ui/iconos';
import {
  opcionesRolAsignable,
  type BaseAsignadaPayload,
  type Operativo,
  type RolParticipacion,
} from '../models/operativo';

interface Fila {
  clave: number;
  baseNavalId: string;
  rolParticipacion: RolParticipacion;
  unidades: string;
  recursos: string;
}

interface Props {
  readonly abierto: boolean;
  readonly onCerrar: () => void;
  readonly operativo: Operativo;
  readonly onAsignar: (bases: BaseAsignadaPayload[]) => Promise<void>;
}

let siguiente = 1;
const filaNueva = (): Fila => ({
  clave: siguiente++,
  baseNavalId: '',
  rolParticipacion: 'APOYO',
  unidades: '',
  recursos: '',
});

/**
 * Asigna una o varias bases con su rol, unidades y recursos. Si la base ya
 * participa, el backend actualiza su asignacion (es idempotente).
 */
export function DialogoAsignarBases({
  abierto,
  onCerrar,
  operativo,
  onAsignar,
}: Props): React.ReactElement {
  const { mares, zonasDeMar, bases } = useCatalogos();
  const [filas, setFilas] = useState<Fila[]>(() => [filaNueva()]);
  const [errores, setErrores] = useState<Record<number, string>>({});
  const [guardando, setGuardando] = useState(false);

  const participan = new Set(operativo.bases.map((b) => b.baseNavalId));
  const actualizar = (clave: number, cambio: Partial<Fila>): void =>
    setFilas((fs) => fs.map((f) => (f.clave === clave ? { ...f, ...cambio } : f)));

  function cerrar(): void {
    setFilas([filaNueva()]);
    setErrores({});
    onCerrar();
  }

  async function enviar(e: FormEvent): Promise<void> {
    e.preventDefault();
    const encontrados: Record<number, string> = {};
    const vistas = new Set<string>();
    for (const f of filas) {
      if (!f.baseNavalId) encontrados[f.clave] = 'Elige una base.';
      else if (vistas.has(f.baseNavalId)) encontrados[f.clave] = 'Esta base ya está en la lista.';
      else if (f.unidades && (!Number.isInteger(Number(f.unidades)) || Number(f.unidades) < 0))
        encontrados[f.clave] = 'Las unidades son un entero desde 0.';
      vistas.add(f.baseNavalId);
    }
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setGuardando(true);
    try {
      await onAsignar(
        filas.map((f) => ({
          baseNavalId: f.baseNavalId,
          rolParticipacion: f.baseNavalId === operativo.baseLiderId ? 'LIDER' : f.rolParticipacion,
          unidadesAsignadas: f.unidades ? Number(f.unidades) : undefined,
          recursos: f.recursos.trim() || undefined,
        })),
      );
      notificar.exito(
        filas.length === 1 ? 'Base asignada al operativo.' : `${filas.length} bases asignadas.`,
      );
      cerrar();
    } catch {
      // El interceptor ya publico el motivo; el dialogo conserva lo escrito.
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialogo
      abierto={abierto}
      onCerrar={cerrar}
      titulo={`Asignar bases a ${operativo.codigo}`}
      descripcion="Las bases asignadas ven el operativo y reciben los cambios de estado y prioridad."
      ancho="amplio"
      bloqueado={guardando}
      acciones={
        <>
          <Boton onClick={cerrar} disabled={guardando}>
            Cancelar
          </Boton>
          <Boton
            type="submit"
            form="form-asignar-bases"
            variante="principal"
            cargando={guardando}
            textoCargando="Asignando…"
          >
            {filas.length === 1 ? 'Asignar base' : `Asignar ${filas.length} bases`}
          </Boton>
        </>
      }
    >
      <form id="form-asignar-bases" noValidate onSubmit={(e) => void enviar(e)}>
        <ol className="asignacion-lista">
          {filas.map((f, i) => (
            <li key={f.clave} className="asignacion-fila">
              <CampoSelect
                etiqueta={`Base ${i + 1}`}
                required
                opcionVacia="Elige una base"
                value={f.baseNavalId}
                error={errores[f.clave]}
                onChange={(e) => actualizar(f.clave, { baseNavalId: e.target.value })}
              >
                {mares.map((mar) => {
                  const zonas = new Set(zonasDeMar(mar.id).map((z) => z.id));
                  const delMar = bases.filter((x) => zonas.has(x.zonaInfluenciaId));
                  if (delMar.length === 0) return null;
                  return (
                    <optgroup key={mar.id} label={mar.nombre}>
                      {delMar.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.nombre}
                          {participan.has(x.id) ? ' (ya asignada)' : ''}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </CampoSelect>
              <CampoSelect
                etiqueta="Rol"
                value={f.baseNavalId === operativo.baseLiderId ? 'LIDER' : f.rolParticipacion}
                disabled={f.baseNavalId === operativo.baseLiderId}
                opciones={
                  f.baseNavalId === operativo.baseLiderId
                    ? [{ valor: 'LIDER', etiqueta: 'Base líder' }]
                    : opcionesRolAsignable()
                }
                onChange={(e) =>
                  actualizar(f.clave, { rolParticipacion: e.target.value as RolParticipacion })
                }
              />
              <CampoTexto
                etiqueta="Unidades"
                type="number"
                inputMode="numeric"
                min={0}
                value={f.unidades}
                onChange={(e) => actualizar(f.clave, { unidades: e.target.value })}
              />
              <CampoTexto
                etiqueta="Recursos"
                maxLength={2000}
                placeholder="1 buque, 30 marines"
                value={f.recursos}
                onChange={(e) => actualizar(f.clave, { recursos: e.target.value })}
              />
              {filas.length > 1 && (
                <BotonIcono
                  etiqueta={`Quitar la base ${i + 1} de la lista`}
                  icono={<IconoCerrar tamano={18} />}
                  tamano="compacto"
                  onClick={() => setFilas((fs) => fs.filter((x) => x.clave !== f.clave))}
                />
              )}
            </li>
          ))}
        </ol>
        {filas.length < 30 && (
          <Boton
            variante="fantasma"
            tamano="compacto"
            icono={<IconoMas tamano={16} />}
            onClick={() => setFilas((fs) => [...fs, filaNueva()])}
          >
            Añadir otra base
          </Boton>
        )}
      </form>
    </Dialogo>
  );
}
