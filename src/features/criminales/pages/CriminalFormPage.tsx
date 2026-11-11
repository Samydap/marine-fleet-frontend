import { EmptyState } from '@shared/ui/EmptyState';
import { PageHeader } from '@shared/ui/PageHeader';

/**
 * RF-1 · Dev 2 · PENDIENTE Sprint 1.
 *
 * Por hacer:
 *  - formulario controlado con validacion (nombre obligatorio, edad >= 0)
 *  - selector de organizacion por categoria (PIRATA / REVOLUCIONARIO /
 *    CRIMINAL_INDEPENDIENTE) y rol de membresia (LIDER / OFICIAL / MIEMBRO)
 *  - alias como lista dinamica
 *  - aviso al salir con cambios sin guardar
 *  - al guardar: criminalesApi.crear() y navegar al detalle
 */
export function CriminalFormPage(): React.ReactElement {
  return (
    <>
      <PageHeader titulo="Registrar criminal" kicker="NUEVO REGISTRO" />
      <EmptyState
        titulo="Formulario en construcción"
        detalle="RF-1 · Sprint 1 · responsable: Dev 2"
        icono="+"
      />
    </>
  );
}
