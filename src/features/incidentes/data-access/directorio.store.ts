import { create } from 'zustand';
import { resolverCriminales } from '@core/directorio/directorio-criminales';
import type { OperativoOpcion } from '../models/incidente';
import { incidentesApi } from './incidentes-api';

type EstadoCarga = 'inicial' | 'cargando' | 'listo' | 'error';

interface DirectorioState {
  operativos: OperativoOpcion[];
  /** id -> operativo (para mostrar el codigo). */
  operativosPorId: Record<string, OperativoOpcion>;
  estadoOperativos: EstadoCarga;
  cargar: () => Promise<void>;
  /**
   * Resuelve los operativos que no vinieron en las opciones. Los criminales los
   * resuelve el directorio compartido de core/ (nombre, foto y alias).
   */
  resolver: (criminalesIds: readonly string[], operativosIds: readonly string[]) => Promise<void>;
}

const enVuelo = new Set<string>();

/**
 * Directorio de operativos para el selector de origen y para poner codigo a
 * los ids que trae IncidenteResponse. Se carga una vez por sesion.
 */
export const useDirectorioIncidentes = create<DirectorioState>()((set, get) => ({
  operativos: [],
  operativosPorId: {},
  estadoOperativos: 'inicial',

  cargar: async () => {
    const estado = get().estadoOperativos;
    if (estado !== 'inicial' && estado !== 'error') return;
    set({ estadoOperativos: 'cargando' });
    try {
      const lista = await incidentesApi.listarOperativosOpciones();
      set((s) => ({
        operativos: lista,
        operativosPorId: {
          ...s.operativosPorId,
          ...Object.fromEntries(lista.map((o) => [o.id, o])),
        },
        estadoOperativos: 'listo',
      }));
    } catch {
      set({ estadoOperativos: 'error' });
    }
  },

  resolver: async (criminalesIds, operativosIds) => {
    const faltan = [...new Set(operativosIds)].filter(
      (i) => i && !get().operativosPorId[i] && !enVuelo.has(i),
    );
    faltan.forEach((i) => enVuelo.add(i));
    const [, resultados] = await Promise.all([
      resolverCriminales(criminalesIds),
      Promise.allSettled(faltan.map((i) => incidentesApi.obtenerOperativo(i))),
    ]);
    const encontrados: Record<string, OperativoOpcion> = {};
    resultados.forEach((r, i) => {
      enVuelo.delete(faltan[i]);
      if (r.status === 'fulfilled') encontrados[faltan[i]] = r.value;
    });
    if (Object.keys(encontrados).length === 0) return;
    set((s) => ({ operativosPorId: { ...s.operativosPorId, ...encontrados } }));
  },
}));
