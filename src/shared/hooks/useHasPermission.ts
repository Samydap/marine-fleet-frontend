import type { Permiso } from '@core/session/permiso.enum';
import { tienePermiso } from '@core/session/permiso.enum';
import { useSessionStore } from '@core/session/session.store';

/**
 * Equivalente de la directiva appHasPermission de Angular.
 *
 *   const puedeEscribir = useHasPermission(Permiso.CRIMINALES_ESCRIBIR);
 *   {puedeEscribir && <button>Registrar</button>}
 *
 * Es cosmetico: evita mostrar acciones que el backend va a rechazar.
 */
export function useHasPermission(requerido: Permiso): boolean {
  return useSessionStore((s) => tienePermiso(s.usuario?.permisos, requerido));
}

export function useHasAnyPermission(requeridos: readonly Permiso[]): boolean {
  return useSessionStore((s) =>
    requeridos.some((permiso) => tienePermiso(s.usuario?.permisos, permiso)),
  );
}
