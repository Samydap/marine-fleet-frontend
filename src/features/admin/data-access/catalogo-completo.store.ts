import { useEffect } from 'react';
import { create } from 'zustand';
import {
  ordenarMares,
  recargarCatalogos,
  type BaseNaval,
  type Mar,
  type ZonaInfluencia,
} from '@core/catalogos/catalogos';
import { apiClient } from '@core/http/api-client';

/**
 * El catalogo COMPLETO, con lo inactivo, para la pantalla de administracion
 * (GET /catalogos/...?incluirInactivos=true, exige CATALOGOS_ADMINISTRAR).
 *
 * El catalogo compartido de core/ trae solo lo activo, que es lo que deben
 * ofrecer los formularios. Aqui hace falta todo: un mar o una base dada de
 * baja tiene que seguir a la vista para poder reactivarla.
 */
interface CatalogoCompletoState {
  readonly mares: readonly Mar[];
  readonly zonas: readonly ZonaInfluencia[];
  readonly bases: readonly BaseNaval[];
  readonly estado: 'inicial' | 'cargando' | 'listo' | 'error';
}

const useCatalogoCompletoStore = create<CatalogoCompletoState>()(() => ({
  mares: [],
  zonas: [],
  bases: [],
  estado: 'inicial',
}));

const TODO = { incluirInactivos: true };

async function cargar(): Promise<void> {
  useCatalogoCompletoStore.setState({ estado: 'cargando' });
  try {
    const [mares, zonas, bases] = await Promise.all([
      apiClient.get<Mar[]>('/catalogos/mares', TODO, { sinAviso: true }),
      apiClient.get<ZonaInfluencia[]>('/catalogos/zonas-influencia', TODO, { sinAviso: true }),
      apiClient.get<BaseNaval[]>('/catalogos/bases-navales', TODO, { sinAviso: true }),
    ]);
    useCatalogoCompletoStore.setState({
      mares: ordenarMares(mares),
      zonas,
      bases,
      estado: 'listo',
    });
  } catch {
    useCatalogoCompletoStore.setState({ estado: 'error' });
  }
}

/**
 * Tras crear o editar un mar, una zona o una base: recarga este catalogo y el
 * compartido de core/, que alimenta los formularios del resto del sistema.
 */
export async function recargarCatalogoCompleto(): Promise<void> {
  await Promise.all([cargar(), recargarCatalogos()]);
}

/** Hook: el catalogo completo, leido de nuevo cada vez que se abre la pantalla. */
export function useCatalogoCompleto(): CatalogoCompletoState & {
  readonly zonasDeMar: (marId: string) => readonly ZonaInfluencia[];
} {
  const estado = useCatalogoCompletoStore((s) => s);
  useEffect(() => {
    void cargar();
  }, []);
  return {
    ...estado,
    zonasDeMar: (marId) => estado.zonas.filter((z) => z.marId === marId),
  };
}
