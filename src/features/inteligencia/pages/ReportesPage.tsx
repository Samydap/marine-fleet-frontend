import { EmptyState } from '@shared/ui/EmptyState';
import { PageHeader } from '@shared/ui/PageHeader';

/**
 * RF-3 · Dev 5 · PENDIENTE Sprint 1.
 *
 * Bandeja de reportes ciudadanos: aprobar (convierte el reporte en avistamiento
 * oficial) o rechazar con motivo. Es la unica entrada no confiable del sistema,
 * asi que su endpoint de creacion sera el unico @Public() fuera de auth y
 * necesita rate limiting antes de produccion.
 */
export function ReportesPage(): React.ReactElement {
  return (
    <>
      <PageHeader
        kicker="CIPHER POL"
        titulo="Reportes ciudadanos"
        descripcion="Reportes por revisar antes de convertirlos en avistamientos oficiales."
      />
      <EmptyState
        titulo="Bandeja en construcción"
        detalle="RF-3 · Sprint 1 · responsable: Dev 5"
        icono="✉"
      />
    </>
  );
}
