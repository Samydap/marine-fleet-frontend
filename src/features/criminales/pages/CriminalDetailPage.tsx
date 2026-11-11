import { useParams } from 'react-router-dom';
import { EmptyState } from '@shared/ui/EmptyState';
import { PageHeader } from '@shared/ui/PageHeader';

/**
 * RF-1 · Dev 2 · PENDIENTE Sprint 1.
 *
 * Por hacer: ficha del criminal, antecedentes, membresias, historial de
 * recompensas, cartel vigente y la accion de cambiar estado, que debe enviar
 * `version` para que el backend detecte ediciones concurrentes (409).
 */
export function CriminalDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <PageHeader titulo="Detalle del criminal" kicker="FICHA" />
      <EmptyState
        titulo="Ficha en construcción"
        detalle={`RF-1 · Sprint 1 · responsable: Dev 2 · id solicitado: ${id ?? '—'}`}
        icono="◎"
      />
    </>
  );
}
