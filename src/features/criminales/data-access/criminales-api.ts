import { apiClient } from '@core/http/api-client';
import { ApiError } from '@core/models/api-response';
import type { PageResult } from '@core/models/page-result';
import { leerInstantanea } from '@shared/utils/cartel';
import type {
  ActualizarCriminalPayload,
  AfiliarPayload,
  Afiliacion,
  Antecedente,
  CambiarFotoPayload,
  CartelVigente,
  CartelVigenteResumen,
  Criminal,
  CriminalDetalle,
  CrearCriminalPayload,
  EntradaHistorial,
  EstadoCriminal,
  FiltroCriminales,
  RegistrarAntecedentePayload,
} from '../models/criminal';

const RUTA = '/criminales';
const ruta = (id: string): string => `${RUTA}/${encodeURIComponent(id)}`;

/**
 * Modulo HTTP de criminales (CriminalesController y ExpedienteController).
 *
 * Vive dentro de la feature a proposito: el dueno de Criminales es el unico que
 * lo toca. Las rutas son relativas: apiUrlInterceptor les pone /api/v1.
 */
export const criminalesApi = {
  listar(filtro: FiltroCriminales, silencioso = false): Promise<PageResult<Criminal>> {
    return apiClient.getPage<Criminal>(RUTA, { ...filtro }, { silencioso, sinAviso: true });
  },

  obtener(id: string, silencioso = false): Promise<CriminalDetalle> {
    return apiClient.get<CriminalDetalle>(ruta(id), undefined, { silencioso, sinAviso: true });
  },

  crear(payload: CrearCriminalPayload): Promise<CriminalDetalle> {
    return apiClient.post<CriminalDetalle>(RUTA, payload);
  },

  /** `version` viaja para que el backend detecte ediciones concurrentes (409). */
  actualizar(id: string, payload: ActualizarCriminalPayload): Promise<CriminalDetalle> {
    return apiClient.patch<CriminalDetalle>(ruta(id), payload, { sinAviso: 'conflicto' });
  },

  /** La foto viaja en base64 (data URL aceptada); el cartel se regenera solo. */
  cambiarFoto(id: string, payload: CambiarFotoPayload): Promise<CriminalDetalle> {
    return apiClient.put<CriminalDetalle>(`${ruta(id)}/foto`, payload);
  },

  /** Baja (CAPTURADO / MUERTO) o reactivacion. 409 si otra base lo cambio antes. */
  cambiarEstado(id: string, estado: EstadoCriminal, version: number): Promise<Criminal> {
    return apiClient.patch<Criminal>(
      `${ruta(id)}/estado`,
      { estado, version },
      { sinAviso: 'conflicto' },
    );
  },

  afiliar(id: string, payload: AfiliarPayload): Promise<Afiliacion> {
    return apiClient.post<Afiliacion>(`${ruta(id)}/afiliaciones`, payload);
  },

  desafiliar(id: string, organizacionId: string): Promise<Afiliacion> {
    return apiClient.delete<Afiliacion>(
      `${ruta(id)}/afiliaciones/${encodeURIComponent(organizacionId)}`,
    );
  },

  antecedentes(id: string, silencioso = false): Promise<Antecedente[]> {
    return apiClient.get<Antecedente[]>(`${ruta(id)}/antecedentes`, undefined, {
      silencioso,
      sinAviso: true,
    });
  },

  registrarAntecedente(id: string, payload: RegistrarAntecedentePayload): Promise<Antecedente> {
    return apiClient.post<Antecedente>(`${ruta(id)}/antecedentes`, payload);
  },

  historial(
    id: string,
    page: number,
    limit = 20,
    silencioso = false,
  ): Promise<PageResult<EntradaHistorial>> {
    return apiClient.getPage<EntradaHistorial>(
      `${ruta(id)}/historial`,
      { page, limit },
      { silencioso, sinAviso: true },
    );
  },

  /**
   * Cartel oficial vigente (endpoint de carteles, consumido por contrato: la
   * feature carteles no se importa) con su instantanea emitida. 404 si aun no
   * tiene cartel: se devuelve null. Cualquier otro error se propaga y la ficha
   * pinta el hueco sin aviso flotante.
   */
  async cartelVigente(criminalId: string): Promise<CartelVigente | null> {
    try {
      const cartel = await apiClient.get<CartelVigenteResumen & { datos?: unknown }>(
        `/carteles/criminal/${encodeURIComponent(criminalId)}`,
        undefined,
        { sinAviso: true },
      );
      const datos =
        cartel.datos && typeof cartel.datos === 'object'
          ? (cartel.datos as Record<string, unknown>)
          : {};
      return {
        resumen: {
          id: cartel.id,
          numeroVersion: cartel.numeroVersion,
          motivoGeneracion: cartel.motivoGeneracion,
          generadoEn: cartel.generadoEn,
        },
        instantanea: leerInstantanea(datos, criminalId),
      };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
};
