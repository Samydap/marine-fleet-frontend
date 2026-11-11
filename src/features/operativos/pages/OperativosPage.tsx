import { EmptyState } from '@shared/ui/EmptyState';
import { PageHeader } from '@shared/ui/PageHeader';

/**
 * RF-4 · Dev 6 · PENDIENTE Sprint 1.
 *
 * BLOQUEANTE: el backend necesita `npm run migration:run` antes de que este
 * modulo tenga endpoints (las tablas `operativos` y `operativo_bases` no
 * existen en el esquema original).
 *
 * Pantallas: OperativosBoardPage (kanban por estado), OperativoDetailPage,
 * OperativoFormPage. Componentes: BasesSelector (multi-base, el nucleo de la
 * coordinacion) y EstadoStepper (PLANIFICADO -> EN_CURSO -> CERRADO).
 */
export function OperativosPage(): React.ReactElement {
  return (
    <>
      <PageHeader
        kicker="COORDINACIÓN DE FLOTA"
        titulo="Operativos"
        descripcion="Coordinación entre bases navales para la captura de objetivos."
      />
      <EmptyState
        titulo="Módulo en construcción"
        detalle="RF-4 · Sprint 1 · responsable: Dev 6 · requiere la migración de operativos"
        icono="⚓"
      />
    </>
  );
}
