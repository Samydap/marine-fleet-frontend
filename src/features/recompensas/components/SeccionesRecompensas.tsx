import { Permiso } from '@core/session/permiso.enum';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { PestanasSeccion, type SeccionPestana } from '@shared/ui/PestanasSeccion';

/**
 * Pestanas de la feature. Solo aparecen las que el cargo puede abrir: el
 * Capitan ve Historial y Solicitar; el Almirante, ademas, la Validacion.
 */
export function SeccionesRecompensas(): React.ReactElement | null {
  const puedeSolicitar = useHasPermission(Permiso.RECOMPENSAS_SOLICITAR);
  const puedeValidar = useHasPermission(Permiso.RECOMPENSAS_VALIDAR);
  const puedeReportes = useHasPermission(Permiso.REPORTES_LEER);

  const secciones: SeccionPestana[] = [
    { a: '/recompensas', etiqueta: 'Historial' },
    ...(puedeSolicitar ? [{ a: '/recompensas/solicitar', etiqueta: 'Solicitar' }] : []),
    ...(puedeValidar ? [{ a: '/recompensas/validacion', etiqueta: 'Validación' }] : []),
    ...(puedeReportes ? [{ a: '/recompensas/reporte-mensual', etiqueta: 'Reporte por mar' }] : []),
  ];

  return <PestanasSeccion etiqueta="Secciones de recompensas" secciones={secciones} />;
}
