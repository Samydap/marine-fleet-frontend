import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { notificar } from '@core/services/notification.store';
import { Boton } from '@shared/ui/Boton';
import { CampoSelect, CampoTexto } from '@shared/ui/Campo';
import { Dialogo, DialogoConfirmacion } from '@shared/ui/Dialogo';
import { EstadoVacio } from '@shared/ui/Estados';
import { IconoMas, IconoSinAfiliacion } from '@shared/ui/iconos';
import { InsigniaTipoCriminal } from '@shared/ui/InsigniaTipoCriminal';
import { etiquetaRolMembresia, type RolMembresia } from '@shared/utils/criminal';
import { formatearSoloFecha, valorFechaLocal } from '@shared/utils/fecha';
import { criminalesApi } from '../data-access/criminales-api';
import type { Afiliacion, CriminalDetalle } from '../models/criminal';
import { SelectorOrganizacion } from './SelectorOrganizacion';

interface Props {
  readonly criminal: CriminalDetalle;
  readonly puedeEscribir: boolean;
  /** Tras afiliar o retirar: la ficha y el historial se recargan. */
  readonly onCambio: () => void;
}

const ROLES: readonly RolMembresia[] = ['LIDER', 'OFICIAL', 'MIEMBRO'];
const ORDEN_ROL: Readonly<Record<RolMembresia, number>> = { LIDER: 0, OFICIAL: 1, MIEMBRO: 2 };

/** Tripulaciones, organizaciones o bandas vigentes del criminal. */
export function SeccionAfiliaciones({
  criminal,
  puedeEscribir,
  onCambio,
}: Props): React.ReactElement {
  const [afiliando, setAfiliando] = useState(false);
  const [retirar, setRetirar] = useState<Afiliacion | null>(null);
  const activo = criminal.estado !== 'MUERTO';
  const afiliaciones = [...criminal.afiliaciones].sort(
    (a, b) => ORDEN_ROL[a.rol] - ORDEN_ROL[b.rol],
  );

  return (
    <section className="expediente-seccion" aria-labelledby="sec-afiliaciones">
      <div className="expediente-seccion-cabecera">
        <h2 id="sec-afiliaciones">Afiliaciones</h2>
        {puedeEscribir && activo && (
          <Boton
            tamano="compacto"
            icono={<IconoMas tamano={16} />}
            onClick={() => setAfiliando(true)}
          >
            Afiliar
          </Boton>
        )}
      </div>

      {afiliaciones.length === 0 ? (
        <EstadoVacio
          variante="en-panel"
          icono={<IconoSinAfiliacion tamano={28} />}
          titulo="Sin afiliación conocida"
          detalle="Cuando se le vincule a una tripulación, organización o banda, aparecerá aquí."
        />
      ) : (
        <ul className="afiliaciones">
          {afiliaciones.map((a) => (
            <li key={a.id} className="afiliacion">
              <InsigniaTipoCriminal categoria={a.categoria} variante="icono" />
              <div className="afiliacion-texto">
                <Link to={`/criminales/organizaciones/${a.organizacionId}`}>
                  {a.organizacionNombre ?? 'Organización sin nombre'}
                </Link>
                <span>
                  {etiquetaRolMembresia(a.rol)}
                  {a.fechaIngreso && ` · desde ${formatearSoloFecha(a.fechaIngreso)}`}
                </span>
              </div>
              {puedeEscribir && (
                <Boton variante="fantasma" tamano="compacto" onClick={() => setRetirar(a)}>
                  Retirar
                </Boton>
              )}
            </li>
          ))}
        </ul>
      )}

      <DialogoAfiliar
        abierto={afiliando}
        criminal={criminal}
        onCerrar={() => setAfiliando(false)}
        onAfiliado={() => {
          setAfiliando(false);
          onCambio();
        }}
      />

      <DialogoConfirmacion
        abierto={retirar !== null}
        onCerrar={() => setRetirar(null)}
        titulo={`¿Retirar a ${criminal.nombre} de ${retirar?.organizacionNombre ?? 'la organización'}?`}
        mensaje="La afiliación se cierra con la fecha de hoy y queda en el historial. El cartel se regenera con la afiliación nueva."
        textoConfirmar="Retirar afiliación"
        textoConfirmando="Retirando…"
        peligroso
        onConfirmar={async () => {
          if (!retirar) return;
          await criminalesApi.desafiliar(criminal.id, retirar.organizacionId);
          notificar.exito('Afiliación cerrada.');
          onCambio();
        }}
      />
    </section>
  );
}

interface PropsDialogo {
  readonly abierto: boolean;
  readonly criminal: CriminalDetalle;
  readonly onCerrar: () => void;
  readonly onAfiliado: () => void;
}

function DialogoAfiliar({
  abierto,
  criminal,
  onCerrar,
  onAfiliado,
}: PropsDialogo): React.ReactElement {
  const [organizacionId, setOrganizacionId] = useState('');
  const [rol, setRol] = useState<RolMembresia | ''>('');
  const [fecha, setFecha] = useState('');
  const [errores, setErrores] = useState<{ org?: string; rol?: string }>({});
  const [enviando, setEnviando] = useState(false);

  function cerrar(): void {
    setOrganizacionId('');
    setRol('');
    setFecha('');
    setErrores({});
    onCerrar();
  }

  async function enviar(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const nuevos = {
      org: organizacionId ? undefined : 'Elige la organización.',
      rol: rol ? undefined : 'Indica el rol que ocupa.',
    };
    setErrores(nuevos);
    if (nuevos.org || nuevos.rol || !rol) return;
    setEnviando(true);
    try {
      await criminalesApi.afiliar(criminal.id, {
        organizacionId,
        rol,
        fechaIngreso: fecha ? new Date(`${fecha}T00:00:00`).toISOString() : undefined,
      });
      notificar.exito('Afiliación registrada.');
      setOrganizacionId('');
      setRol('');
      setFecha('');
      onAfiliado();
    } catch {
      // El interceptor ya publico el aviso; el dialogo queda abierto.
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialogo
      abierto={abierto}
      onCerrar={cerrar}
      bloqueado={enviando}
      titulo={`Afiliar a ${criminal.nombre}`}
      descripcion="La afiliación de mayor rango define el tipo de criminal y aparece en su cartel."
      acciones={
        <>
          <Boton onClick={cerrar} disabled={enviando}>
            Cancelar
          </Boton>
          <Boton
            type="submit"
            form="form-afiliar"
            variante="principal"
            cargando={enviando}
            textoCargando="Afiliando…"
          >
            Afiliar
          </Boton>
        </>
      }
    >
      <form id="form-afiliar" className="dialogo-form" noValidate onSubmit={(e) => void enviar(e)}>
        <SelectorOrganizacion
          etiqueta="Tripulación, organización o banda"
          required
          opcionVacia="Elige una"
          value={organizacionId}
          error={errores.org}
          excluir={criminal.afiliaciones.map((a) => a.organizacionId)}
          onChange={(e) => setOrganizacionId(e.target.value)}
        />
        <CampoSelect
          etiqueta="Rol"
          required
          opcionVacia="Elige el rol"
          value={rol}
          error={errores.rol}
          opciones={ROLES.map((r) => ({ valor: r, etiqueta: etiquetaRolMembresia(r) }))}
          onChange={(e) => setRol(e.target.value as RolMembresia | '')}
        />
        <CampoTexto
          etiqueta="Fecha de ingreso"
          type="date"
          max={valorFechaLocal()}
          value={fecha}
          ayuda="Opcional. Si no se conoce, se deja vacía."
          onChange={(e) => setFecha(e.target.value)}
        />
      </form>
    </Dialogo>
  );
}
