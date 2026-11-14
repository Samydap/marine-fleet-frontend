import { useEffect, useRef } from 'react';
import { create } from 'zustand';
import { apiClient } from '../http/api-client';
import { PREFIJO_API } from '../http/api-url.interceptor';
import { tokenStore } from '../session/token.store';
import { NOMBRES_EVENTO, type CambioSincronizado, type NombreEvento } from './eventos';

/**
 * Canal de sincronizacion entre bases navales (RNF: un cambio de estado de un
 * operativo es visible en las bases asignadas en 15 s como maximo).
 *
 *  - En vivo: Server-Sent Events en GET /sincronizacion/stream?token=...
 *  - Al (re)conectar: GET /sincronizacion/cambios?despuesDeId=N recupera lo que
 *    paso mientras el canal estuvo cerrado. Va por apiClient, asi que si el
 *    token vencio se renueva solo antes de reabrir el stream.
 *  - Sin EventSource (o pruebas): sondeo cada 10 s del mismo endpoint.
 *
 * Lo arranca MainLayout; las features solo se suscriben con
 * useCambiosSincronizados y leen el estado con useEstadoSincronizacion.
 */

export type EstadoCanal = 'inactivo' | 'conectando' | 'en-vivo' | 'sondeo' | 'sin-conexion';

interface EstadoSincronizacion {
  readonly estado: EstadoCanal;
  /** ISO de la ultima senal del servidor (cambio o latido). */
  readonly ultimaSenal: string | null;
}

export const useSincronizacionStore = create<EstadoSincronizacion>()(() => ({
  estado: 'inactivo',
  ultimaSenal: null,
}));

export const INTERVALO_SONDEO_MS = 10_000;
const ESPERA_MAXIMA_MS = 30_000;

type Oyente = (cambio: CambioSincronizado) => void;

interface Suscripcion {
  readonly eventos: readonly NombreEvento[] | '*';
  readonly oyente: Oyente;
}

const suscripciones = new Set<Suscripcion>();
let fuente: EventSource | null = null;
let temporizador: ReturnType<typeof setTimeout> | null = null;
let ultimoId: number | null = null;
let fallos = 0;
let activo = false;

function marcar(estado: EstadoCanal): void {
  useSincronizacionStore.setState({ estado });
}

function senal(fecha = new Date().toISOString()): void {
  useSincronizacionStore.setState({ ultimaSenal: fecha });
}

/** Reparte un cambio a los suscriptores. Exportada para pruebas. */
export function despachar(cambio: CambioSincronizado): void {
  if (ultimoId !== null && cambio.id <= ultimoId) return; // ya entregado
  ultimoId = cambio.id;
  senal(cambio.fecha);
  for (const { eventos, oyente } of suscripciones) {
    if (eventos === '*' || eventos.includes(cambio.evento)) {
      try {
        oyente(cambio);
      } catch (error) {
        console.error('Fallo un oyente de sincronizacion', error);
      }
    }
  }
}

async function ponerseAlDia(): Promise<void> {
  const respuesta = await apiClient.get<{ ultimoId: number; cambios: CambioSincronizado[] }>(
    '/sincronizacion/cambios',
    { despuesDeId: ultimoId ?? undefined },
    { silencioso: true },
  );

  // La primera vez solo se toma la marca: lo anterior a abrir la app ya esta
  // en las pantallas, que lo cargan por su cuenta.
  if (ultimoId === null) {
    ultimoId = respuesta.ultimoId;
  } else {
    respuesta.cambios.forEach(despachar);
  }
  senal();
}

function programar(accion: () => void, ms: number): void {
  if (temporizador) clearTimeout(temporizador);
  temporizador = setTimeout(accion, ms);
}

function cerrarFuente(): void {
  fuente?.close();
  fuente = null;
}

function abrirStream(): void {
  const token = tokenStore.accessToken;
  if (!token) {
    marcar('sin-conexion');
    return;
  }

  const query = new URLSearchParams({ token });
  if (ultimoId !== null) query.set('ultimoId', String(ultimoId));
  const es = new EventSource(`${PREFIJO_API}/sincronizacion/stream?${query.toString()}`);
  fuente = es;

  es.onopen = () => {
    fallos = 0;
    marcar('en-vivo');
    senal();
  };

  const alRecibir = (evento: MessageEvent<string>): void => {
    try {
      despachar(JSON.parse(evento.data) as CambioSincronizado);
    } catch {
      // Un mensaje malformado no tumba el canal.
    }
  };
  for (const nombre of NOMBRES_EVENTO) es.addEventListener(nombre, alRecibir);
  es.addEventListener('latido', () => senal());

  // El servidor cierra el canal a los 15 min (vida del token) o cae la red:
  // se cierra aqui para que EventSource no reintente con el token viejo, y se
  // reconecta poniendose al dia primero.
  es.onerror = () => {
    cerrarFuente();
    if (!activo) return;
    fallos += 1;
    marcar(fallos > 1 ? 'sin-conexion' : 'conectando');
    programar(() => void ciclo(), Math.min(1000 * 2 ** fallos, ESPERA_MAXIMA_MS));
  };
}

async function ciclo(): Promise<void> {
  if (!activo) return;
  try {
    await ponerseAlDia();
  } catch {
    fallos += 1;
    marcar('sin-conexion');
    programar(() => void ciclo(), Math.min(1000 * 2 ** fallos, ESPERA_MAXIMA_MS));
    return;
  }

  if (!activo) return;
  if (typeof EventSource === 'undefined') {
    fallos = 0;
    marcar('sondeo');
    programar(() => void ciclo(), INTERVALO_SONDEO_MS);
    return;
  }
  abrirStream();
}

export function iniciarSincronizacion(): void {
  if (activo) return;
  activo = true;
  fallos = 0;
  marcar('conectando');
  void ciclo();
}

export function detenerSincronizacion(): void {
  activo = false;
  if (temporizador) clearTimeout(temporizador);
  temporizador = null;
  cerrarFuente();
  ultimoId = null;
  useSincronizacionStore.setState({ estado: 'inactivo', ultimaSenal: null });
}

/** Suscripcion imperativa. Devuelve la funcion para cancelarla. */
export function suscribirCambios(
  eventos: readonly NombreEvento[] | '*',
  oyente: Oyente,
): () => void {
  const suscripcion: Suscripcion = { eventos, oyente };
  suscripciones.add(suscripcion);
  return () => {
    suscripciones.delete(suscripcion);
  };
}

/**
 * Hook para las pantallas: ejecuta `oyente` cada vez que llega uno de los
 * eventos. El oyente puede cambiar entre renders sin re-suscribirse.
 *
 *   useCambiosSincronizados([EVENTOS.OPERATIVO_ACTUALIZADO], (c) => {
 *     void recargarOperativo((c.datos as OperativoActualizadoDatos).operativoId);
 *   });
 */
export function useCambiosSincronizados<D = unknown>(
  eventos: readonly NombreEvento[] | '*',
  oyente: (cambio: CambioSincronizado<D>) => void,
): void {
  const ref = useRef(oyente);
  ref.current = oyente;
  const clave = eventos === '*' ? '*' : eventos.join('|');

  useEffect(() => {
    const lista = clave === '*' ? '*' : (clave.split('|') as NombreEvento[]);
    return suscribirCambios(lista, (c) => ref.current(c as CambioSincronizado<D>));
  }, [clave]);
}

export const useEstadoSincronizacion = (): EstadoSincronizacion => useSincronizacionStore((s) => s);
