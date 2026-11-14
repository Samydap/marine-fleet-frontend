import { apiClient, type ArchivoDescargado } from '@core/http/api-client';
import type {
  ActualizacionCriterios,
  AgrupacionTendencia,
  CriterioAmenaza,
  DistribucionAmenaza,
  Estadisticas,
  FormatoExportacion,
  ResumenReclasificacion,
  Tendencias,
} from '../models/amenaza';

/** Contrato: amenaza.controller.ts y reportes.controller.ts del backend. */
export const amenazaApi = {
  /** GET /amenaza/distribucion (CRIMINALES_LEER). */
  distribucion(soloActivos: boolean): Promise<DistribucionAmenaza> {
    return apiClient.get<DistribucionAmenaza>(
      '/amenaza/distribucion',
      { soloActivos },
      { sinAviso: true },
    );
  },

  /** GET /reportes/estadisticas (REPORTES_LEER): por mar y por tipo de criminal. */
  estadisticas(): Promise<Estadisticas> {
    return apiClient.get<Estadisticas>('/reportes/estadisticas', undefined, { sinAviso: true });
  },

  exportarEstadisticas(formato: FormatoExportacion): Promise<ArchivoDescargado> {
    return apiClient.descargar(
      '/reportes/estadisticas/exportar',
      { formato },
      `estadisticas-amenaza.${formato}`,
    );
  },

  /** GET /reportes/tendencias (REPORTES_LEER). */
  tendencias(agrupar: AgrupacionTendencia): Promise<Tendencias> {
    return apiClient.get<Tendencias>('/reportes/tendencias', { agrupar }, { sinAviso: true });
  },

  exportarTendencias(
    agrupar: AgrupacionTendencia,
    formato: FormatoExportacion,
  ): Promise<ArchivoDescargado> {
    return apiClient.descargar(
      '/reportes/tendencias/exportar',
      { agrupar, formato },
      `tendencias-${agrupar}.${formato}`,
    );
  },

  /** GET /amenaza/criterios (CRIMINALES_LEER). */
  criterios(): Promise<CriterioAmenaza[]> {
    return apiClient.get<CriterioAmenaza[]>('/amenaza/criterios', undefined, { sinAviso: true });
  },

  /** GET /amenaza/criterios/historial (CRIMINALES_LEER). */
  historialCriterios(): Promise<CriterioAmenaza[]> {
    return apiClient.get<CriterioAmenaza[]>('/amenaza/criterios/historial', undefined, {
      sinAviso: true,
    });
  },

  /** PUT /amenaza/criterios. Solo el rol Analista de Datos Criminales (@Roles). */
  reemplazarCriterios(
    cuerpo: ActualizacionCriterios,
  ): Promise<{ criterios: CriterioAmenaza[]; reclasificacion: ResumenReclasificacion }> {
    return apiClient.put('/amenaza/criterios', cuerpo);
  },

  /** POST /amenaza/reclasificar. Solo el rol Analista de Datos Criminales. */
  reclasificar(): Promise<ResumenReclasificacion> {
    return apiClient.post<ResumenReclasificacion>('/amenaza/reclasificar');
  },
};
