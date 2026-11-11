import { EmptyState } from '@shared/ui/EmptyState';
import { PageHeader } from '@shared/ui/PageHeader';

/**
 * RF-6 · Dev 6 · PENDIENTE Sprint 1.
 *
 * BLOQUEANTE: requiere `npm run migration:run` en el backend (tablas
 * `incidentes` e `incidente_participantes`).
 *
 * Pantallas: HistorialPage (linea de tiempo filtrable) e IncidenteFormPage.
 * Componentes: TimelineIncidentes, ResultadoBadge.
 *
 * Ojo con la ambiguedad del dominio: `criminales_historial` NO es esto. Esa
 * tabla la llena un trigger con cambios de atributos; aqui se registran hechos
 * operativos (enfrentamientos, capturas, fugas).
 */
export function IncidentesPage(): React.ReactElement {
  return (
    <>
      <PageHeader
        kicker="HISTORIAL OPERATIVO"
        titulo="Incidentes"
        descripcion="Enfrentamientos, capturas y fugas registradas por la flota."
      />
      <EmptyState
        titulo="Módulo en construcción"
        detalle="RF-6 · Sprint 1 · responsable: Dev 6 · requiere la migración de incidentes"
        icono="⚔"
      />
    </>
  );
}
