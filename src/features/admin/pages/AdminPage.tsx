import { EmptyState } from '@shared/ui/EmptyState';
import { PageHeader } from '@shared/ui/PageHeader';

/**
 * RF-7 · Dev 1 · PENDIENTE Sprint 1.
 *
 * Pantallas: UsuariosListPage, UsuarioFormPage, RolesMatrixPage (visualiza
 * PERMISOS_POR_ROL del backend) y BitacoraPage (consume el AuditInterceptor).
 */
export function AdminPage(): React.ReactElement {
  return (
    <>
      <PageHeader
        kicker="SEGURIDAD"
        titulo="Administración"
        descripcion="Usuarios, roles, permisos y bitácora de accesos."
      />
      <EmptyState
        titulo="Módulo en construcción"
        detalle="RF-7 · Sprint 1 · responsable: Dev 1"
        icono="⚙"
      />
    </>
  );
}
