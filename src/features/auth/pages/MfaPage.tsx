import { EmptyState } from '@shared/ui/EmptyState';

/**
 * RF-7 · Dev 1 · PENDIENTE Sprint 1.
 *
 * Reto TOTP de 6 digitos para los roles con `requiere_2fa = 1`: Almirante,
 * Director de Inteligencia y Especialista en Seguridad.
 */
export function MfaPage(): React.ReactElement {
  return (
    <main className="login-shell">
      <EmptyState
        titulo="Verificación en dos pasos"
        detalle="Pendiente de implementación (RF-7, Sprint 1, Dev 1)."
        icono="⌘"
      />
    </main>
  );
}
