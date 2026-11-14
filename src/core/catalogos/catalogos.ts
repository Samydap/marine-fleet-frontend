import { useEffect } from 'react';
import { create } from 'zustand';
import { apiClient } from '../http/api-client';

/**
 * Catalogo geografico compartido: mares, zonas de influencia y bases navales.
 *
 * Vive en core/ porque lo consumen casi todas las features (filtros por zona
 * de criminales, avistamientos e incidentes; bases de los operativos; reporte
 * por mar de recompensas) y una feature no puede importar a otra. Se carga una
 * vez por sesion y se comparte; Administracion llama a `recargarCatalogos()`
 * despues de editarlo.
 *
 * Endpoints: GET /catalogos/mares, /catalogos/zonas-influencia y
 * /catalogos/bases-navales (cualquier usuario autenticado).
 */

export type TipoMar = 'CUATRO_MARES' | 'GRAND_LINE';
export type EstadoBase = 'ACTIVA' | 'INACTIVA';

/** Espejo de la entidad Mar (catalogos/entities/mar.entity.ts). */
export interface Mar {
  readonly id: string;
  readonly nombre: string;
  readonly tipo: TipoMar;
  readonly activo: boolean;
}

/** Espejo de ZonaInfluencia. `mar` llega embebido (eager). */
export interface ZonaInfluencia {
  readonly id: string;
  readonly marId: string;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly activo: boolean;
  readonly mar?: Mar;
}

/** Espejo de BaseNaval. `zonaInfluencia` llega embebida (eager). */
export interface BaseNaval {
  readonly id: string;
  readonly nombre: string;
  readonly zonaInfluenciaId: string;
  readonly ubicacion: string;
  readonly comandanteNombre: string;
  readonly estado: EstadoBase;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly zonaInfluencia?: ZonaInfluencia;
}

/**
 * El mapa mental del usuario: los Cuatro Mares en su orden canonico y despues
 * la Grand Line. Los ids son los del seed (one-piece.data.ts); un mar nuevo
 * creado desde Administracion va al final, por nombre.
 */
const ORDEN_MARES = ['m-east-blue', 'm-west-blue', 'm-north-blue', 'm-south-blue', 'm-grand-line'];

export function ordenarMares<T extends Pick<Mar, 'id' | 'nombre'>>(mares: readonly T[]): T[] {
  const posicion = (m: T): number => {
    const i = ORDEN_MARES.indexOf(m.id);
    return i === -1 ? ORDEN_MARES.length : i;
  };
  return [...mares].sort((a, b) => posicion(a) - posicion(b) || a.nombre.localeCompare(b.nombre));
}

type EstadoCarga = 'inicial' | 'cargando' | 'listo' | 'error';

interface CatalogosState {
  readonly mares: readonly Mar[];
  readonly zonas: readonly ZonaInfluencia[];
  readonly bases: readonly BaseNaval[];
  readonly estado: EstadoCarga;
}

export const useCatalogosStore = create<CatalogosState>()(() => ({
  mares: [],
  zonas: [],
  bases: [],
  estado: 'inicial',
}));

let enCurso: Promise<void> | null = null;

async function cargar(): Promise<void> {
  useCatalogosStore.setState({ estado: 'cargando' });
  try {
    const [mares, zonas, bases] = await Promise.all([
      apiClient.get<Mar[]>('/catalogos/mares'),
      apiClient.get<ZonaInfluencia[]>('/catalogos/zonas-influencia'),
      apiClient.get<BaseNaval[]>('/catalogos/bases-navales'),
    ]);
    useCatalogosStore.setState({ mares: ordenarMares(mares), zonas, bases, estado: 'listo' });
  } catch {
    useCatalogosStore.setState({ estado: 'error' });
  }
}

/** Carga el catalogo si aun no esta (idempotente y sin peticiones duplicadas). */
export function cargarCatalogos(): Promise<void> {
  if (useCatalogosStore.getState().estado === 'listo') return Promise.resolve();
  enCurso ??= cargar().finally(() => {
    enCurso = null;
  });
  return enCurso;
}

/** Fuerza la recarga (tras crear o editar un mar, una zona o una base). */
export function recargarCatalogos(): Promise<void> {
  useCatalogosStore.setState({ estado: 'inicial' });
  return cargarCatalogos();
}

/**
 * Hook: el catalogo, cargado bajo demanda la primera vez que alguien lo pide.
 *
 *   const { mares, zonas, bases, estado } = useCatalogos();
 */
export function useCatalogos(): CatalogosState & {
  readonly zonasDeMar: (marId: string) => readonly ZonaInfluencia[];
  readonly nombreZona: (zonaId: string | null | undefined) => string | null;
  readonly nombreBase: (baseId: string | null | undefined) => string | null;
} {
  const estadoActual = useCatalogosStore((s) => s);

  useEffect(() => {
    if (estadoActual.estado === 'inicial') void cargarCatalogos();
  }, [estadoActual.estado]);

  return {
    ...estadoActual,
    zonasDeMar: (marId) => estadoActual.zonas.filter((z) => z.marId === marId),
    nombreZona: (id) => estadoActual.zonas.find((z) => z.id === id)?.nombre ?? null,
    nombreBase: (id) => estadoActual.bases.find((b) => b.id === id)?.nombre ?? null,
  };
}

/** Al cerrar sesion: el catalogo de una base no debe verse en la siguiente. */
export function limpiarCatalogos(): void {
  useCatalogosStore.setState({ mares: [], zonas: [], bases: [], estado: 'inicial' });
}
