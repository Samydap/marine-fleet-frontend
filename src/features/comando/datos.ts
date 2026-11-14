/**
 * Datos de muestra del Centro de Comando. El tablero es una maqueta de alta
 * fidelidad: no consume el API. Cuando se conecte, estos arreglos se reemplazan
 * por las respuestas de /criminales, /operativos y /inteligencia.
 *
 * `id` es tambien el nombre del archivo de imagen en src/assets/comando/.
 */

/** Rasgo de la silueta que se dibuja cuando no hay imagen. */
export type Rasgo = 'sombrero' | 'barba' | 'cuernos' | 'nariz' | 'garfio' | 'gafas' | 'gorra';

export type NivelAmenaza = 'ALTA' | 'MEDIA' | 'BAJA';

export interface CartelBuscado {
  readonly id: string;
  readonly nombre: string;
  readonly alias: string;
  readonly recompensa: number;
  readonly zona: string;
  readonly amenaza: NivelAmenaza;
  readonly rasgo: Rasgo;
  /** Color de fondo de la silueta. */
  readonly fondo: string;
  readonly capturado: boolean;
  readonly prioritario: boolean;
}

type Ficha = Omit<CartelBuscado, 'prioritario'>;

const FICHAS: readonly Ficha[] = [
  {
    id: 'luffy',
    nombre: 'LUFFY',
    alias: 'Sombrero de Paja',
    recompensa: 3_000_000_000,
    zona: 'Nuevo Mundo',
    amenaza: 'ALTA',
    rasgo: 'sombrero',
    fondo: '#b9d4d6',
    capturado: false,
  },
  {
    id: 'buggy',
    nombre: 'BUGGY',
    alias: 'El Payaso',
    recompensa: 3_189_000_000,
    zona: 'Karai Bari',
    amenaza: 'MEDIA',
    rasgo: 'nariz',
    fondo: '#d6b7a2',
    capturado: true,
  },
  {
    id: 'crocodile',
    nombre: 'CROCODILE',
    alias: 'Sir Crocodile',
    recompensa: 1_965_000_000,
    zona: 'Arabasta',
    amenaza: 'MEDIA',
    rasgo: 'garfio',
    fondo: '#c9c19a',
    capturado: true,
  },
  {
    id: 'doflamingo',
    nombre: 'DOFLAMINGO',
    alias: 'Demonio Celestial',
    recompensa: 340_000_000,
    zona: 'Dressrosa',
    amenaza: 'MEDIA',
    rasgo: 'gafas',
    fondo: '#d9aeb8',
    capturado: true,
  },
  {
    id: 'kaido',
    nombre: 'KAIDO',
    alias: 'Rey de las Bestias',
    recompensa: 4_611_100_000,
    zona: 'País de Wano',
    amenaza: 'ALTA',
    rasgo: 'cuernos',
    fondo: '#b7a7c4',
    capturado: true,
  },
  {
    id: 'barbanegra',
    nombre: 'BARBANEGRA',
    alias: 'Marshall D. Teach',
    recompensa: 3_996_000_000,
    zona: 'Isla Colmena',
    amenaza: 'ALTA',
    rasgo: 'barba',
    fondo: '#a9a39a',
    capturado: false,
  },
  {
    id: 'zoro',
    nombre: 'ZORO',
    alias: 'Cazador de Piratas',
    recompensa: 1_111_000_000,
    zona: 'Nuevo Mundo',
    amenaza: 'ALTA',
    rasgo: 'gafas',
    fondo: '#a8c7a4',
    capturado: false,
  },
  {
    id: 'law',
    nombre: 'LAW',
    alias: 'Cirujano de la Muerte',
    recompensa: 3_000_000_000,
    zona: 'Nuevo Mundo',
    amenaza: 'ALTA',
    rasgo: 'sombrero',
    fondo: '#c7c9d6',
    capturado: false,
  },
  {
    id: 'shanks',
    nombre: 'SHANKS',
    alias: 'El Pelirrojo',
    recompensa: 4_048_900_000,
    zona: 'Elbaf',
    amenaza: 'ALTA',
    rasgo: 'barba',
    fondo: '#d9b3a0',
    capturado: false,
  },
];

export const CARTELES_INICIALES: readonly CartelBuscado[] = FICHAS.map((ficha) => ({
  ...ficha,
  prioritario: false,
}));

export interface Mision {
  readonly id: string;
  readonly nombre: string;
  readonly objetivo: string;
  readonly progreso: number;
  readonly total: number;
  /** Premio de la mision: millones de berries o estrellas de merito. */
  readonly premio: { readonly tipo: 'berries' | 'merito'; readonly valor: number };
  /** Oficial al mando; tambien es el nombre del archivo de imagen. */
  readonly ejecutor: string;
  readonly nombreEjecutor: string;
  readonly fondo: string;
}

export const MISIONES_INICIALES: readonly Mision[] = [
  {
    id: 'buster-call',
    nombre: 'Buster Call',
    objetivo: 'Objetivos neutralizados',
    progreso: 0,
    total: 5,
    premio: { tipo: 'berries', valor: 27 },
    ejecutor: 'akainu',
    nombreEjecutor: 'Almirante de Flota Akainu',
    fondo: '#7f2a2a',
  },
  {
    id: 'impel-down',
    nombre: 'Impel Down Guard',
    objetivo: 'Niveles asegurados',
    progreso: 2,
    total: 5,
    premio: { tipo: 'berries', valor: 50 },
    ejecutor: 'magellan',
    nombreEjecutor: 'Alcaide Magellan',
    fondo: '#4b3a73',
  },
  {
    id: 'sabaody',
    nombre: 'Sabaody Raid',
    objetivo: 'Progreso de captura',
    progreso: 1,
    total: 5,
    premio: { tipo: 'merito', valor: 109 },
    ejecutor: 'kizaru',
    nombreEjecutor: 'Almirante Kizaru',
    fondo: '#8a7420',
  },
];

/** Tamano del lienzo de la carta naval; las posiciones se dan en estas unidades. */
export const CARTA = { ancho: 600, alto: 400 } as const;

export interface Nave {
  readonly id: string;
  readonly nombre: string;
  readonly bando: 'marina' | 'pirata';
  readonly x: number;
  readonly y: number;
  readonly latitud: string;
  readonly longitud: string;
}

export const NAVES: readonly Nave[] = [
  {
    id: '01',
    nombre: 'Acorazado del G-1',
    bando: 'marina',
    x: 80,
    y: 222,
    latitud: '12.04 N',
    longitud: '000.00 E',
  },
  {
    id: '02',
    nombre: 'Fragata del G-5',
    bando: 'marina',
    x: 530,
    y: 235,
    latitud: '03.51 N',
    longitud: '071.40 E',
  },
  {
    id: '03',
    nombre: 'Navío pirata al noroeste',
    bando: 'pirata',
    x: 175,
    y: 105,
    latitud: '27.18 N',
    longitud: '034.12 O',
  },
  {
    id: '04',
    nombre: 'Navío pirata en ruta de patrulla',
    bando: 'pirata',
    x: 150,
    y: 195,
    latitud: '14.33 N',
    longitud: '041.05 O',
  },
  {
    id: '05',
    nombre: 'Navío pirata al sur',
    bando: 'pirata',
    x: 345,
    y: 352,
    latitud: '09.27 S',
    longitud: '008.44 E',
  },
];

/** Lecturas por sector: numero de sector, buques desplegados y contactos. */
export const SECTORES: ReadonlyArray<readonly [sector: string, buques: number, contactos: number]> =
  [
    ['01', 333, 133],
    ['02', 532, 133],
    ['03', 297, 133],
    ['04', 296, 133],
    ['05', 230, 133],
    ['06', 230, 355],
  ];

export interface CanalRadio {
  readonly id: string;
  readonly nombre: string;
}

export const CANALES: readonly CanalRadio[] = [
  { id: 'cuartel', nombre: 'Cuartel General' },
  { id: 'flota', nombre: 'Flota del G-5' },
  { id: 'impel', nombre: 'Impel Down' },
];

export interface Aviso {
  readonly id: string;
  readonly texto: string;
}

export const NOTIFICACIONES: readonly Aviso[] = [
  { id: 'n1', texto: 'Avistamiento confirmado cerca de Sabaody.' },
];

export const MENSAJES: readonly Aviso[] = [
  { id: 'm1', texto: 'El G-5 solicita refuerzos para la patrulla.' },
  { id: 'm2', texto: 'Impel Down confirma el traslado del nivel 6.' },
];

/** `฿ 3,000,000,000-`, como se imprime en los carteles. */
export function formatearRecompensa(monto: number): string {
  return `฿ ${new Intl.NumberFormat('en-US').format(monto)}-`;
}
