import { create } from 'zustand';

export type TipoNotificacion = 'info' | 'exito' | 'error';

export interface Notificacion {
  readonly id: number;
  readonly tipo: TipoNotificacion;
  readonly mensaje: string;
}

interface NotificationState {
  notificaciones: Notificacion[];
  info: (mensaje: string) => void;
  exito: (mensaje: string) => void;
  error: (mensaje: string) => void;
  descartar: (id: number) => void;
}

/**
 * Nunca hay mas de tres avisos a la vez: una pila mas alta tapa el contenido
 * (y el boton "Reintentar" del estado de error que la provoco). Al llegar el
 * cuarto se retira el mas antiguo.
 */
export const MAXIMO_AVISOS = 3;

const DURACION: Record<TipoNotificacion, number> = { info: 4000, exito: 4000, error: 8000 };

let siguienteId = 1;
const temporizadores = new Map<number, ReturnType<typeof setTimeout>>();

export const useNotificationStore = create<NotificationState>()((set, get) => {
  const programar = (id: number, tipo: TipoNotificacion): void => {
    const previo = temporizadores.get(id);
    if (previo) clearTimeout(previo);
    temporizadores.set(
      id,
      setTimeout(() => get().descartar(id), DURACION[tipo]),
    );
  };

  const publicar = (tipo: TipoNotificacion, mensaje: string): void => {
    // El mismo aviso repetido (tres peticiones fallando por la misma caida) no
    // se apila: el que ya esta en pantalla vuelve a contar su tiempo.
    const repetido = get().notificaciones.find((n) => n.tipo === tipo && n.mensaje === mensaje);
    if (repetido) {
      programar(repetido.id, tipo);
      return;
    }

    const id = siguienteId++;
    const siguientes = [...get().notificaciones, { id, tipo, mensaje }];
    const sobrantes = siguientes.slice(0, Math.max(0, siguientes.length - MAXIMO_AVISOS));
    for (const n of sobrantes) {
      clearTimeout(temporizadores.get(n.id));
      temporizadores.delete(n.id);
    }
    set({ notificaciones: siguientes.slice(-MAXIMO_AVISOS) });
    programar(id, tipo);
  };

  return {
    notificaciones: [],
    info: (mensaje) => publicar('info', mensaje),
    exito: (mensaje) => publicar('exito', mensaje),
    error: (mensaje) => publicar('error', mensaje),
    descartar: (id) => {
      clearTimeout(temporizadores.get(id));
      temporizadores.delete(id);
      set((s) => ({ notificaciones: s.notificaciones.filter((n) => n.id !== id) }));
    },
  };
});

/** Para usar desde fuera de un componente (interceptores, stores). */
export const notificar = {
  info: (m: string): void => useNotificationStore.getState().info(m),
  exito: (m: string): void => useNotificationStore.getState().exito(m),
  error: (m: string): void => useNotificationStore.getState().error(m),
};
