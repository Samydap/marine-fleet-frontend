import { useCallback } from 'react';
import { useCatalogos } from '@core/catalogos/catalogos';
import { CampoSelect, type CampoSelectProps } from './Campo';

/**
 * Zonas de influencia agrupadas por mar, en el orden del mapa de la Marina:
 * East, West, North, South Blue y la Grand Line (useCatalogos ya los ordena).
 * Para meter dentro de un CampoSelect que ya tiene otras opciones.
 */
export function OpcionesZona(): React.ReactElement {
  const { mares, zonasDeMar } = useCatalogos();
  return (
    <>
      {mares.map((mar) => (
        <optgroup key={mar.id} label={mar.nombre}>
          {zonasDeMar(mar.id).map((z) => (
            <option key={z.id} value={z.id}>
              {z.nombre}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );
}

type Props = Omit<CampoSelectProps, 'children' | 'opciones'>;

/**
 * Campo "Zona" del sistema: el mapa mental del usuario es geografico, asi que
 * las zonas siempre van agrupadas por mar. Mientras carga el catalogo queda
 * deshabilitado.
 *
 *   <CampoZona etiqueta="Zona" opcionVacia="Todos los mares" value={zona} onChange={…} />
 */
export function CampoZona(props: Props): React.ReactElement {
  const { estado } = useCatalogos();
  return (
    <CampoSelect {...props} disabled={props.disabled || estado === 'cargando'}>
      <OpcionesZona />
    </CampoSelect>
  );
}

/** "Loguetown · East Blue", o null si no hay zona. */
export function useNombreZonaConMar(): (zonaId: string | null | undefined) => string | null {
  const { zonas, mares } = useCatalogos();
  return useCallback(
    (zonaId) => {
      if (!zonaId) return null;
      const zona = zonas.find((z) => z.id === zonaId);
      if (!zona) return null;
      const mar = zona.mar ?? mares.find((m) => m.id === zona.marId);
      return mar ? `${zona.nombre} · ${mar.nombre}` : zona.nombre;
    },
    [zonas, mares],
  );
}
