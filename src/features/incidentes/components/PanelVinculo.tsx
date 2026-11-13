import { useState } from 'react';
import { notificar } from '@core/services/notification.store';
import { Boton } from '@shared/ui/Boton';
import { CampoSelect } from '@shared/ui/Campo';
import { incidentesApi } from '../data-access/incidentes-api';
import type { Incidente } from '../models/incidente';

interface PropsVinculo {
  readonly incidente: Incidente;
  readonly opciones: { valor: string; etiqueta: string }[];
  readonly onVinculado: (incidente: Incidente) => void;
  readonly onConflicto: (error: unknown) => void;
}

export function PanelVinculo({
  incidente,
  opciones,
  onVinculado,
  onConflicto,
}: PropsVinculo): React.ReactElement {
  const [operativoId, setOperativoId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function vincular(): Promise<void> {
    if (!operativoId) {
      setError('Elige el operativo del que surgió.');
      return;
    }
    setEnviando(true);
    try {
      const actualizado = await incidentesApi.vincularOperativo(
        incidente.id,
        operativoId,
        incidente.version,
      );
      notificar.exito('Enfrentamiento vinculado a su operativo.');
      onVinculado(actualizado);
    } catch (e) {
      try {
        onConflicto(e);
      } catch {
        // Otro error: el interceptor ya aviso.
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="inc-vinculo">
      <p className="inc-nota">
        Sin vincular. Si surgió de un operativo, vincúlalo para verlo en su tablero.
      </p>
      <CampoSelect
        etiqueta="Operativo"
        opcionVacia={opciones.length ? 'Elige un operativo' : 'No hay operativos visibles'}
        value={operativoId}
        opciones={opciones}
        error={error}
        onChange={(e) => {
          setOperativoId(e.target.value);
          setError(null);
        }}
      />
      <Boton cargando={enviando} textoCargando="Vinculando…" onClick={() => void vincular()}>
        Vincular operativo
      </Boton>
    </div>
  );
}
