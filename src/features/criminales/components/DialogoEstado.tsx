import { useState } from 'react';
import { esConflictoDeVersion } from '@shared/ui/Alerta';
import { DialogoConfirmacion } from '@shared/ui/Dialogo';
import type { CriminalDetalle, EstadoCriminal } from '../models/criminal';

interface Props {
  readonly abierto: boolean;
  readonly criminal: CriminalDetalle;
  /** 'baja': capturado o muerto. 'reactivar': de capturado a en busqueda. */
  readonly modo: 'baja' | 'reactivar';
  readonly onCerrar: () => void;
  readonly onConfirmar: (estado: EstadoCriminal) => Promise<void>;
  /** 409: otra base cambio el registro. El dialogo se cierra y la ficha lo explica. */
  readonly onConflicto: () => void;
}

/**
 * Baja logica (RF-1): el registro no se borra; pasa a CAPTURADO o MUERTO y el
 * cartel se regenera con el sello. Un fallecido no vuelve a estar en busqueda
 * (regla del backend), asi que solo un capturado se puede reactivar.
 */
export function DialogoEstado({
  abierto,
  criminal,
  modo,
  onCerrar,
  onConfirmar,
  onConflicto,
}: Props): React.ReactElement {
  const [destino, setDestino] = useState<'CAPTURADO' | 'MUERTO'>('CAPTURADO');
  const puedeCapturar = criminal.estado === 'ACTIVO';
  // Un capturado solo puede pasar a fallecido.
  const elegido = puedeCapturar ? destino : 'MUERTO';

  async function confirmar(): Promise<void> {
    const estado: EstadoCriminal = modo === 'reactivar' ? 'ACTIVO' : elegido;
    try {
      await onConfirmar(estado);
    } catch (error) {
      if (esConflictoDeVersion(error)) {
        onConflicto();
        return;
      }
      throw error;
    }
  }

  if (modo === 'reactivar') {
    return (
      <DialogoConfirmacion
        abierto={abierto}
        onCerrar={onCerrar}
        onConfirmar={confirmar}
        titulo={`¿Reactivar la búsqueda de ${criminal.nombre}?`}
        mensaje="Vuelve a figurar en búsqueda en todas las bases y su cartel se regenera sin el sello de capturado. Úsalo si escapó o fue liberado."
        textoConfirmar="Reactivar búsqueda"
        textoConfirmando="Reactivando…"
      />
    );
  }

  return (
    <DialogoConfirmacion
      abierto={abierto}
      onCerrar={onCerrar}
      onConfirmar={confirmar}
      titulo={`¿Cerrar la búsqueda de ${criminal.nombre}?`}
      mensaje="Sigue en el archivo con todo su historial, pero deja de ser objetivo. El cartel se regenera con el sello de su estado."
      textoConfirmar={elegido === 'MUERTO' ? 'Registrar fallecimiento' : 'Registrar captura'}
      textoConfirmando="Registrando…"
      peligroso
    >
      <fieldset className="baja-opciones">
        <legend>Cómo termina la búsqueda</legend>
        <label className="baja-opcion">
          <input
            type="radio"
            name="motivo-baja"
            value="CAPTURADO"
            checked={elegido === 'CAPTURADO'}
            disabled={!puedeCapturar}
            onChange={() => setDestino('CAPTURADO')}
          />
          <span>
            <strong>Capturado</strong>
            <small>Está bajo custodia de la Marina. Podría reactivarse si escapa.</small>
          </span>
        </label>
        <label className="baja-opcion">
          <input
            type="radio"
            name="motivo-baja"
            value="MUERTO"
            checked={elegido === 'MUERTO'}
            onChange={() => setDestino('MUERTO')}
          />
          <span>
            <strong>Fallecido</strong>
            <small>Definitivo: un registro fallecido no vuelve a estar en búsqueda.</small>
          </span>
        </label>
      </fieldset>
    </DialogoConfirmacion>
  );
}
