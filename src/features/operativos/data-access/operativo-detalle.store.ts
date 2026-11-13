import { create } from 'zustand';
import { esConflictoDeVersion } from '@shared/ui/Alerta';
import type {
  BaseAsignadaPayload,
  DetalleOperativo,
  Operativo,
  PrioridadOperativo,
  ResponsablePayload,
  ResultadoOperativo,
} from '../models/operativo';
import { operativosApi } from './operativos-api';

interface DetalleState {
  operativo: DetalleOperativo | null;
  cargando: boolean;
  error: unknown;
  consultadoEn: string | null;
  /** Ultima escritura rechazada con 409: otra base cambio el operativo. */
  conflicto: boolean;
  /** Nombres de usuarios de las bases participantes (para los responsables). */
  nombres: Record<string, string>;
  cargar: (id: string, silencioso?: boolean) => Promise<void>;
  iniciar: (version: number) => Promise<void>;
  abortar: (version: number) => Promise<void>;
  cambiarPrioridad: (prioridad: PrioridadOperativo, version: number) => Promise<void>;
  cerrar: (
    resultado: ResultadoOperativo,
    observaciones: string | undefined,
    version: number,
  ) => Promise<void>;
  asignarBases: (bases: BaseAsignadaPayload[]) => Promise<void>;
  asignarResponsables: (responsables: ResponsablePayload[]) => Promise<void>;
  descartarConflicto: () => void;
}

/**
 * Ficha del operativo. Las mutaciones devuelven OperativoResponse (sin el
 * criminal ni los incidentes): se mezcla sobre el detalle que ya hay.
 */
export const useOperativoDetalleStore = create<DetalleState>()((set, get) => {
  async function mutar(accion: (id: string) => Promise<Operativo>): Promise<void> {
    const actual = get().operativo;
    if (!actual) return;
    try {
      const respuesta = await accion(actual.id);
      set({
        operativo: { ...actual, ...respuesta },
        conflicto: false,
        consultadoEn: new Date().toISOString(),
      });
      void cargarNombres(respuesta);
    } catch (error) {
      if (esConflictoDeVersion(error)) set({ conflicto: true });
      throw error;
    }
  }

  async function cargarNombres(op: Operativo): Promise<void> {
    const ids = [...new Set([op.baseLiderId, ...op.bases.map((b) => b.baseNavalId)])];
    const listas = await Promise.allSettled(ids.map((id) => operativosApi.usuariosDeBase(id)));
    const nombres = { ...get().nombres };
    for (const r of listas) {
      if (r.status === 'fulfilled') for (const u of r.value) nombres[u.id] = u.nombreCompleto;
    }
    set({ nombres });
  }

  return {
    operativo: null,
    cargando: false,
    error: null,
    consultadoEn: null,
    conflicto: false,
    nombres: {},

    cargar: async (id, silencioso = false) => {
      const previo = get().operativo;
      const mismo = previo?.id === id;
      set({
        cargando: !silencioso,
        error: null,
        ...(mismo ? {} : { operativo: null, conflicto: false }),
      });
      try {
        const operativo = await operativosApi.obtener(id, silencioso);
        set({ operativo, cargando: false, consultadoEn: new Date().toISOString() });
        void cargarNombres(operativo);
      } catch (error) {
        set({ cargando: false, error: silencioso && mismo ? null : error });
      }
    },

    iniciar: (version) => mutar((id) => operativosApi.cambiarEstado(id, 'EN_CURSO', version)),
    abortar: (version) => mutar((id) => operativosApi.cambiarEstado(id, 'ABORTADO', version)),
    cambiarPrioridad: (prioridad, version) =>
      mutar((id) => operativosApi.cambiarPrioridad(id, prioridad, version)),
    cerrar: (resultado, observaciones, version) =>
      mutar((id) => operativosApi.cerrar(id, resultado, observaciones, version)),
    asignarBases: (bases) => mutar((id) => operativosApi.asignarBases(id, bases)),
    asignarResponsables: (responsables) =>
      mutar((id) => operativosApi.asignarResponsables(id, responsables)),
    descartarConflicto: () => set({ conflicto: false }),
  };
});
