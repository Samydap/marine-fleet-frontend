import type { CategoriaCriminal } from '@shared/utils/criminal';
import type { NivelAmenaza } from '@shared/utils/nivel-amenaza';
import es from '../../../assets/i18n/es.json';

export type NivelClasificado = Exclude<NivelAmenaza, 'PENDIENTE'>;

/** Espejo de CriterioResponse (amenaza/presentation/mappers/amenaza.mapper.ts). */
export interface CriterioAmenaza {
  readonly id: string;
  readonly nivel: NivelClasificado;
  readonly montoMinimo: number;
  readonly montoMaximo: number | null;
  readonly vigente: boolean;
  readonly vigenteDesde: string;
  readonly vigenteHasta: string | null;
  readonly modificadoPor: string | null;
  readonly motivo: string | null;
}

/** Cuerpo de PUT /amenaza/criterios (ActualizarCriteriosDto). */
export interface ActualizacionCriterios {
  readonly criterios: readonly {
    readonly nivel: NivelClasificado;
    readonly montoMinimo: number;
    readonly montoMaximo: number | null;
  }[];
  readonly motivo: string;
}

/** Espejo de ResumenReclasificacion (reclasificar-masivo.use-case.ts). */
export interface ResumenReclasificacion {
  readonly total: number;
  readonly reclasificados: number;
  readonly sinCambio: number;
  readonly errores: readonly { criminalId: string; mensaje: string }[];
  readonly duracionMs: number;
}

/** Espejo de DistribucionAmenaza (GET /amenaza/distribucion). */
export interface DistribucionAmenaza {
  readonly total: number;
  readonly soloActivos: boolean;
  readonly niveles: readonly { nivel: NivelAmenaza; total: number; porcentaje: number }[];
}

/** Espejo de PuntoGrafico y Estadisticas (reportes/domain/reportes.types.ts). */
export interface PuntoGrafico {
  readonly etiqueta: string;
  readonly valor: number;
}

export interface Estadisticas {
  readonly resumen: {
    readonly criminalesActivos: number;
    readonly criminalesCapturados: number;
    readonly criminalesMuertos: number;
    readonly recompensaActivaTotal: number;
    readonly reportesPendientes: number;
    readonly avistamientosPendientes: number;
    readonly recompensasPorValidar: number;
  };
  readonly porNivelAmenaza: readonly PuntoGrafico[];
  readonly porMar: readonly PuntoGrafico[];
  readonly porCategoria: readonly PuntoGrafico[];
  readonly porEstado: readonly PuntoGrafico[];
  readonly avistamientosPorMes: readonly PuntoGrafico[];
}

export type AgrupacionTendencia = 'zona' | 'afiliacion' | 'nivel';
export const AGRUPACIONES: readonly AgrupacionTendencia[] = ['zona', 'afiliacion', 'nivel'];

/** Espejo de FilaTendencia. */
export interface FilaTendencia {
  /** Zona, categoria de organizacion (o SIN_AFILIACION) o nivel, segun la agrupacion. */
  readonly grupo: string;
  /** Mar de la zona, o nombre de la organizacion. Null en la agrupacion por nivel. */
  readonly subgrupo: string | null;
  readonly totalCriminales: number;
  readonly activos: number;
  readonly capturados: number;
  readonly muertos: number;
  readonly recompensaActiva: number;
  /** Avistamientos de los ultimos `ventanaDias` dias. */
  readonly avistamientosRecientes: number;
}

/** Espejo de Tendencias (GET /reportes/tendencias). */
export interface Tendencias {
  readonly agrupacion: AgrupacionTendencia;
  readonly ventanaDias: number;
  readonly filas: readonly FilaTendencia[];
}

export type FormatoExportacion = 'pdf' | 'csv';

export function etiquetaAgrupacion(a: AgrupacionTendencia): string {
  return es.analisisAmenaza.agrupacion[a];
}

const ORDEN_NIVEL: Readonly<Record<NivelAmenaza, number>> = {
  ALTO: 0,
  MEDIO: 1,
  BAJO: 2,
  PENDIENTE: 3,
};

const NIVELES_CONOCIDOS = Object.keys(ORDEN_NIVEL);

export function esNivel(valor: string): valor is NivelAmenaza {
  return NIVELES_CONOCIDOS.includes(valor);
}

const CATEGORIAS: readonly string[] = ['PIRATA', 'REVOLUCIONARIO', 'CRIMINAL_INDEPENDIENTE'];

/** Categoria de la fila de afiliacion; null para SIN_AFILIACION o un valor desconocido. */
export function categoriaDeGrupo(grupo: string): CategoriaCriminal | null {
  return CATEGORIAS.includes(grupo) ? (grupo as CategoriaCriminal) : null;
}

/** Niveles del mas grave al menos grave, con los que falten en cero. */
export function completarNiveles(
  niveles: DistribucionAmenaza['niveles'],
): { nivel: NivelAmenaza; total: number; porcentaje: number }[] {
  return (Object.keys(ORDEN_NIVEL) as NivelAmenaza[])
    .sort((a, b) => ORDEN_NIVEL[a] - ORDEN_NIVEL[b])
    .map((nivel) => niveles.find((n) => n.nivel === nivel) ?? { nivel, total: 0, porcentaje: 0 });
}

/** Una barra agregada del grafico de tendencias. */
export interface BarraTendencia {
  readonly clave: string;
  readonly etiqueta: string;
  readonly activos: number;
  readonly recompensaActiva: number;
  readonly avistamientos: number;
}

/**
 * Suma las filas de tendencias al nivel que se lee de un vistazo:
 *  - zona -> por mar (subgrupo), en el orden que recibe en `ordenMares`;
 *  - afiliacion -> por tipo de criminal (grupo);
 *  - nivel -> por nivel, del mas grave al menos grave.
 */
export function agregarTendencias(
  tendencias: Pick<Tendencias, 'agrupacion' | 'filas'>,
  ordenMares: readonly string[] = [],
): BarraTendencia[] {
  const clave = (f: FilaTendencia): string =>
    tendencias.agrupacion === 'zona' ? (f.subgrupo ?? 'Sin mar') : f.grupo;

  const mapa = new Map<string, BarraTendencia>();
  for (const f of tendencias.filas) {
    const k = clave(f);
    const previa = mapa.get(k);
    mapa.set(k, {
      clave: k,
      etiqueta: k,
      activos: (previa?.activos ?? 0) + f.activos,
      recompensaActiva: (previa?.recompensaActiva ?? 0) + f.recompensaActiva,
      avistamientos: (previa?.avistamientos ?? 0) + f.avistamientosRecientes,
    });
  }

  const barras = [...mapa.values()];
  if (tendencias.agrupacion === 'nivel') {
    return barras.sort(
      (a, b) =>
        (ORDEN_NIVEL[a.clave as NivelAmenaza] ?? 9) - (ORDEN_NIVEL[b.clave as NivelAmenaza] ?? 9),
    );
  }
  if (tendencias.agrupacion === 'afiliacion') {
    const orden = [...CATEGORIAS, 'SIN_AFILIACION'];
    const pos = (k: string): number => (orden.includes(k) ? orden.indexOf(k) : orden.length);
    return barras.sort((a, b) => pos(a.clave) - pos(b.clave));
  }
  const pos = (k: string): number => {
    const i = ordenMares.findIndex((m) => m.toLowerCase() === k.toLowerCase());
    return i === -1 ? ordenMares.length : i;
  };
  return barras.sort((a, b) => pos(a.clave) - pos(b.clave) || a.clave.localeCompare(b.clave, 'es'));
}

// --- Criterios ---------------------------------------------------------------

export const MOTIVO_CRITERIOS_MINIMO = 5;
export const MOTIVO_CRITERIOS_MAXIMO = 1000;

/** Los dos cortes que definen los tres rangos contiguos (BAJO empieza en 1, ALTO sin techo). */
export interface CortesCriterios {
  /** Ultimo monto de BAJO. */
  readonly techoBajo: number;
  /** Ultimo monto de MEDIO. */
  readonly techoMedio: number;
}

/** Lee los cortes de los criterios vigentes (null si no estan los tres niveles). */
export function cortesDeCriterios(criterios: readonly CriterioAmenaza[]): CortesCriterios | null {
  const bajo = criterios.find((c) => c.nivel === 'BAJO');
  const medio = criterios.find((c) => c.nivel === 'MEDIO');
  if (!bajo || !medio || bajo.montoMaximo === null || medio.montoMaximo === null) return null;
  return { techoBajo: bajo.montoMaximo, techoMedio: medio.montoMaximo };
}

/**
 * Arma los tres criterios contiguos que exige validarCriterios del backend:
 * BAJO [1, techoBajo], MEDIO [techoBajo+1, techoMedio], ALTO [techoMedio+1, sin techo].
 */
export function construirCriterios(cortes: CortesCriterios): ActualizacionCriterios['criterios'] {
  return [
    { nivel: 'BAJO', montoMinimo: 1, montoMaximo: cortes.techoBajo },
    { nivel: 'MEDIO', montoMinimo: cortes.techoBajo + 1, montoMaximo: cortes.techoMedio },
    { nivel: 'ALTO', montoMinimo: cortes.techoMedio + 1, montoMaximo: null },
  ];
}

export interface ErroresCriterios {
  techoBajo?: string;
  techoMedio?: string;
  motivo?: string;
}

/** Mismas reglas que validador-criterios.ts y ActualizarCriteriosDto, para avisar antes de enviar. */
export function validarCortes(
  techoBajo: number | null,
  techoMedio: number | null,
  motivo: string,
): ErroresCriterios {
  const errores: ErroresCriterios = {};
  if (techoBajo === null) errores.techoBajo = 'Escribe hasta qué monto es amenaza baja.';
  else if (techoBajo < 1) errores.techoBajo = 'Debe ser de al menos 1 berry.';

  if (techoMedio === null) errores.techoMedio = 'Escribe hasta qué monto es amenaza media.';
  else if (techoBajo !== null && techoMedio <= techoBajo) {
    errores.techoMedio = 'Debe ser mayor que el límite de amenaza baja.';
  }

  const largo = motivo.trim().length;
  if (largo < MOTIVO_CRITERIOS_MINIMO) {
    errores.motivo = `Explica el cambio en al menos ${MOTIVO_CRITERIOS_MINIMO} caracteres: queda en la bitácora.`;
  } else if (largo > MOTIVO_CRITERIOS_MAXIMO) {
    errores.motivo = `El motivo no puede pasar de ${MOTIVO_CRITERIOS_MAXIMO} caracteres.`;
  }
  return errores;
}

export { leerMonto } from '@shared/utils/berries';

/** Una version de los criterios: los tres niveles que rigieron juntos. */
export interface VersionCriterios {
  readonly desde: string;
  readonly hasta: string | null;
  readonly vigente: boolean;
  readonly modificadoPor: string | null;
  readonly motivo: string | null;
  readonly criterios: readonly CriterioAmenaza[];
}

/**
 * Agrupa el historial (una fila por nivel y version) en versiones, de la mas
 * reciente a la mas antigua. Las tres filas de una version comparten
 * `vigenteDesde`.
 */
export function agruparVersiones(historial: readonly CriterioAmenaza[]): VersionCriterios[] {
  const mapa = new Map<string, CriterioAmenaza[]>();
  for (const c of historial) {
    const fecha = new Date(c.vigenteDesde);
    // Al segundo: las tres filas de una version se graban en la misma transaccion.
    const k = Number.isNaN(fecha.getTime())
      ? String(c.vigenteDesde)
      : fecha.toISOString().slice(0, 19);
    mapa.set(k, [...(mapa.get(k) ?? []), c]);
  }
  return [...mapa.values()]
    .map((criterios) => {
      const primero = criterios[0];
      const ordenados = [...criterios].sort((a, b) => ORDEN_NIVEL[b.nivel] - ORDEN_NIVEL[a.nivel]);
      return {
        desde: primero.vigenteDesde,
        hasta: primero.vigenteHasta,
        vigente: criterios.some((c) => c.vigente),
        modificadoPor: primero.modificadoPor,
        motivo: primero.motivo,
        criterios: ordenados,
      };
    })
    .sort((a, b) => new Date(b.desde).getTime() - new Date(a.desde).getTime());
}
