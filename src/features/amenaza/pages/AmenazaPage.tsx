import { EmptyState } from '@shared/ui/EmptyState';
import { PageHeader } from '@shared/ui/PageHeader';

/**
 * RF-5 · Dev 3 · PENDIENTE Sprint 1.
 *
 * Pantallas a construir:
 *  - pages/DashboardAmenazaPage   distribución BAJO/MEDIO/ALTO por zona
 *  - pages/CriteriosConfigPage    umbrales de bounty (solo quien pueda)
 * Componentes: MatrizRiesgo, DistribucionChart
 *
 * El motor de clasificacion ya esta implementado y probado en el backend
 * (modules/amenaza/domain/motor-clasificacion.ts): esta pantalla solo lo expone.
 */
export function AmenazaPage(): React.ReactElement {
  return (
    <>
      <PageHeader
        kicker="ANÁLISIS DE RIESGO"
        titulo="Amenaza"
        descripcion="Clasificación automática por recompensa y zona de influencia."
      />
      <EmptyState
        titulo="Módulo en construcción"
        detalle="RF-5 · Sprint 1 · responsable: Dev 3"
        icono="⚠"
      />
    </>
  );
}
