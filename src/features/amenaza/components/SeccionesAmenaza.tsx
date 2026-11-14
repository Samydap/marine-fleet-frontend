import { Permiso } from '@core/session/permiso.enum';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { PestanasSeccion } from '@shared/ui/PestanasSeccion';

/** Pestanas de la feature. Tendencias exige REPORTES_LEER; criterios los ve todo el que entra. */
export function SeccionesAmenaza(): React.ReactElement | null {
  const puedeReportes = useHasPermission(Permiso.REPORTES_LEER);

  return (
    <PestanasSeccion
      etiqueta="Secciones de amenaza"
      secciones={[
        { a: '/amenaza', etiqueta: 'Distribución' },
        ...(puedeReportes ? [{ a: '/amenaza/tendencias', etiqueta: 'Tendencias' }] : []),
        { a: '/amenaza/criterios', etiqueta: 'Criterios' },
      ]}
    />
  );
}
