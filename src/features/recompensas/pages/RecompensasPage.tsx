import { EmptyState } from '@shared/ui/EmptyState';
import { PageHeader } from '@shared/ui/PageHeader';

/**
 * RF-1/RF-5 · Dev 3 · PENDIENTE Sprint 1.
 *
 * Pantallas a construir en esta carpeta:
 *  - pages/RecompensasListPage    historial por criminal
 *  - pages/SolicitudPage          solicitar un monto (RECOMPENSAS_SOLICITAR)
 *  - pages/BandejaValidacionPage  aprobar o rechazar (RECOMPENSAS_VALIDAR)
 * Mas: data-access/recompensas-api.ts + .store.ts, models/recompensa.ts
 *
 * Copia el patron de features/criminales: ese es el slice de referencia.
 */
export function RecompensasPage(): React.ReactElement {
  return (
    <>
      <PageHeader
        kicker="TESORERÍA NAVAL"
        titulo="Recompensas"
        descripcion="Solicitud, validación e historial de montos en berries."
      />
      <EmptyState
        titulo="Módulo en construcción"
        detalle="RF-1 / RF-5 · Sprint 1 · responsable: Dev 3"
        icono="฿"
      />
    </>
  );
}
