import { useCallback, useEffect } from 'react';
import { create } from 'zustand';
import { apiClient } from '../http/api-client';

/**
 * Directorio de criminales compartido por las features que muestran o eligen
 * un criminal sin ser su duena (recompensas, operativos, inteligencia,
 * incidentes). Antes cada una tenia su copia del buscador y de la cache; ahora
 * hay una sola, y la frontera con features/criminales sigue siendo el endpoint
 * (GET /criminales y GET /criminales/:id), nunca un import.
 *
 * Todas las lecturas son de fondo (silenciosas): quien pinta el resultado
 * decide como contar el fallo ("Criminal no disponible", "No se pudo buscar").
 */

/** Lo que trae GET /criminales de cada criminal (CriminalResponseDto, recortado). */
export interface CriminalBreve {
  readonly id: string;
  readonly nombre: string;
  readonly alias: readonly string[];
  readonly fotoUrl: string | null;
  readonly estado: 'ACTIVO' | 'CAPTURADO' | 'MUERTO';
  readonly nivelAmenaza: 'BAJO' | 'MEDIO' | 'ALTO' | 'PENDIENTE';
  readonly recompensaVigenteMonto: number | null;
  readonly zonaInfluenciaId: string | null;
  readonly organizacion: {
    readonly organizacionNombre: string | null;
    readonly categoria: 'PIRATA' | 'REVOLUCIONARIO' | 'CRIMINAL_INDEPENDIENTE' | null;
  } | null;
}

/** Un criminal resuelto, `null` si no se pudo leer (borrado o sin acceso). */
export type EntradaDirectorio = CriminalBreve | null;

type EstadoCarga = 'inicial' | 'cargando' | 'listo' | 'error';

interface DirectorioState {
  /** Los primeros 100 por orden alfabetico: filtros y listas cortas. */
  readonly opciones: readonly CriminalBreve[];
  readonly estadoOpciones: EstadoCarga;
  /** Cache por id. `undefined`: aun no se pidio; `null`: no disponible. */
  readonly porId: Readonly<Record<string, EntradaDirectorio>>;
}

const RUTA = '/criminales';
/** El maximo que pagina el backend. */
const LIMITE_OPCIONES = 100;

export const useDirectorioStore = create<DirectorioState>()(() => ({
  opciones: [],
  estadoOpciones: 'inicial',
  porId: {},
}));

const enVuelo = new Set<string>();

/** Guarda criminales ya leidos (un buscador los trae completos). */
export function recordarCriminales(lista: readonly CriminalBreve[]): void {
  if (lista.length === 0) return;
  useDirectorioStore.setState((s) => ({
    porId: { ...s.porId, ...Object.fromEntries(lista.map((c) => [c.id, c])) },
  }));
}

/** Olvida un criminal para que se vuelva a pedir (otra base lo cambio). */
export function olvidarCriminal(id: string): void {
  useDirectorioStore.setState((s) => {
    if (!(id in s.porId)) return s;
    const resto = { ...s.porId };
    delete resto[id];
    return { porId: resto };
  });
}

/** Pide los criminales que falten en la cache, en paralelo y una sola vez. */
export async function resolverCriminales(ids: readonly string[]): Promise<void> {
  const conocidos = useDirectorioStore.getState().porId;
  const faltan = [...new Set(ids)].filter((id) => id && !(id in conocidos) && !enVuelo.has(id));
  if (faltan.length === 0) return;
  faltan.forEach((id) => enVuelo.add(id));

  const leidos = await Promise.all(
    faltan.map(async (id): Promise<[string, EntradaDirectorio]> => {
      try {
        return [
          id,
          await apiClient.get<CriminalBreve>(`${RUTA}/${encodeURIComponent(id)}`, undefined, {
            silencioso: true,
          }),
        ];
      } catch {
        return [id, null];
      } finally {
        enVuelo.delete(id);
      }
    }),
  );
  useDirectorioStore.setState((s) => ({ porId: { ...s.porId, ...Object.fromEntries(leidos) } }));
}

let opcionesEnCurso: Promise<void> | null = null;

/** Carga las opciones si aun no estan (idempotente, sin peticiones duplicadas). */
export function cargarOpcionesCriminales(): Promise<void> {
  if (useDirectorioStore.getState().estadoOpciones === 'listo') return Promise.resolve();
  opcionesEnCurso ??= (async () => {
    useDirectorioStore.setState({ estadoOpciones: 'cargando' });
    try {
      const pagina = await apiClient.getPage<CriminalBreve>(
        RUTA,
        { limit: LIMITE_OPCIONES, order: 'DESC' },
        { silencioso: true },
      );
      const ordenadas = [...pagina.data].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
      recordarCriminales(ordenadas);
      useDirectorioStore.setState({ opciones: ordenadas, estadoOpciones: 'listo' });
    } catch {
      useDirectorioStore.setState({ estadoOpciones: 'error' });
    }
  })().finally(() => {
    opcionesEnCurso = null;
  });
  return opcionesEnCurso;
}

export interface OpcionesBusqueda {
  /** Solo los que siguen en busqueda (un objetivo de operativo, una recompensa nueva). */
  readonly soloActivos?: boolean;
  readonly limite?: number;
}

/** Busqueda por nombre o alias. Lo encontrado queda en la cache. */
export async function buscarCriminales(
  q: string,
  { soloActivos = false, limite = 8 }: OpcionesBusqueda = {},
): Promise<CriminalBreve[]> {
  const pagina = await apiClient.getPage<CriminalBreve>(
    RUTA,
    { q: q || undefined, estado: soloActivos ? 'ACTIVO' : undefined, limit: limite, page: 1 },
    { silencioso: true },
  );
  recordarCriminales(pagina.data);
  // El backend ya filtra por estado; se asegura aqui por si un servidor viejo lo ignora.
  return soloActivos ? pagina.data.filter((c) => c.estado === 'ACTIVO') : pagina.data;
}

/**
 * Hook: el criminal de un id, pedido bajo demanda.
 *
 *   const criminal = useCriminal(r.criminalId); // undefined = cargando, null = no disponible
 */
export function useCriminal(id: string | null | undefined): EntradaDirectorio | undefined {
  const entrada = useDirectorioStore((s) => (id ? s.porId[id] : null));
  useEffect(() => {
    if (id && entrada === undefined) void resolverCriminales([id]);
  }, [id, entrada]);
  return id ? entrada : null;
}

/** Hook: las opciones (primeros 100), cargadas la primera vez que alguien las pide. */
export function useOpcionesCriminales(): Pick<DirectorioState, 'opciones' | 'estadoOpciones'> {
  const opciones = useDirectorioStore((s) => s.opciones);
  const estadoOpciones = useDirectorioStore((s) => s.estadoOpciones);
  useEffect(() => {
    if (estadoOpciones === 'inicial') void cargarOpcionesCriminales();
  }, [estadoOpciones]);
  return { opciones, estadoOpciones };
}

/** Hook: id -> nombre de lo que ya esta en la cache. */
export function useNombresCriminales(): (id: string, porDefecto?: string) => string {
  const porId = useDirectorioStore((s) => s.porId);
  return useCallback(
    (id: string, porDefecto = 'Criminal no disponible') => porId[id]?.nombre ?? porDefecto,
    [porId],
  );
}

/** Al cerrar sesion: el archivo que vio una base no debe verse en la siguiente. */
export function limpiarDirectorioCriminales(): void {
  useDirectorioStore.setState({ opciones: [], estadoOpciones: 'inicial', porId: {} });
}
