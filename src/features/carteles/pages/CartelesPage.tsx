import { EmptyState } from '@shared/ui/EmptyState';
import { PageHeader } from '@shared/ui/PageHeader';

/**
 * RF-2 · Dev 4 · PENDIENTE Sprint 1.
 *
 * Pantallas a construir:
 *  - pages/CartelGalleryPage   galeria de carteles vigentes
 *  - pages/CartelPreviewPage   vista previa del PDF + historial de versiones
 * Componentes: WantedPosterPreview, VersionHistory
 *
 * Recuerda: la generacion es AUTOMATICA (la disparan eventos del backend). Esta
 * pantalla consulta y descarga; el boton "generar" es solo para el motivo MANUAL.
 *
 * Dev 4 es ademas dueno de shared/ui: lo que pongas ahi lo consumen las otras
 * cinco features, asi que su API debe ser estable.
 */
export function CartelesPage(): React.ReactElement {
  return (
    <>
      <PageHeader
        kicker="ARCHIVO DOCUMENTAL"
        titulo="Carteles de búsqueda"
        descripcion="Wanted posters versionados, generados automáticamente."
      />
      <EmptyState
        titulo="Módulo en construcción"
        detalle="RF-2 · Sprint 1 · responsable: Dev 4"
        icono="▤"
      />
    </>
  );
}
