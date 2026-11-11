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

let siguienteId = 1;

export const useNotificationStore = create<NotificationState>()((set, get) => {
  const publicar = (tipo: TipoNotificacion, mensaje: string): void => {
    const id = siguienteId++;
    set((s) => ({ notificaciones: [...s.notificaciones, { id, tipo, mensaje }] }));
    setTimeout(() => get().descartar(id), tipo === 'error' ? 8000 : 4000);
  };

  return {
    notificaciones: [],
    info: (mensaje) => publicar('info', mensaje),
    exito: (mensaje) => publicar('exito', mensaje),
    error: (mensaje) => publicar('error', mensaje),
    descartar: (id) =>
      set((s) => ({ notificaciones: s.notificaciones.filter((n) => n.id !== id) })),
  };
});

/** Para usar desde fuera de un componente (interceptores, stores). */
export const notificar = {
  info: (m: string): void => useNotificationStore.getState().info(m),
  exito: (m: string): void => useNotificationStore.getState().exito(m),
  error: (m: string): void => useNotificationStore.getState().error(m),
};
