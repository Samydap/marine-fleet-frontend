import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@core/http/api-client';
import { ApiError } from '@core/models/api-response';
import { criminalesApi } from './criminales-api';

describe('criminalesApi.cartelVigente', () => {
  afterEach(() => vi.restoreAllMocks());

  it('lee la instantanea emitida sin aviso flotante', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({
      id: 'k-3',
      numeroVersion: 3,
      motivoGeneracion: 'REGISTRO',
      generadoEn: '2026-10-30T09:00:00Z',
      datos: { nombre: 'Nico Robin', recompensa: '930000000', estado: 'ACTIVO' },
    });

    const vigente = await criminalesApi.cartelVigente('c-7');

    expect(get).toHaveBeenCalledWith('/carteles/criminal/c-7', undefined, {
      silencioso: true,
      sinAviso: true,
    });
    expect(vigente?.resumen).toEqual({
      id: 'k-3',
      numeroVersion: 3,
      motivoGeneracion: 'REGISTRO',
      generadoEn: '2026-10-30T09:00:00Z',
    });
    expect(vigente?.instantanea).toMatchObject({
      criminalId: 'c-7',
      nombre: 'Nico Robin',
      recompensa: 930_000_000,
    });
  });

  it('devuelve null si el criminal aun no tiene cartel (404)', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue(new ApiError(404, 'NO_ENCONTRADO', 'Sin cartel'));
    await expect(criminalesApi.cartelVigente('c-7')).resolves.toBeNull();
  });

  it.each([[undefined], [null], [{}]])(
    'sin instantanea legible (datos: %j) se trata como sin cartel',
    async (datos) => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({
        id: 'k-3',
        numeroVersion: 3,
        motivoGeneracion: 'REGISTRO',
        generadoEn: '2026-10-30T09:00:00Z',
        datos,
      });
      await expect(criminalesApi.cartelVigente('c-7')).resolves.toBeNull();
    },
  );

  it('cualquier otro error se propaga para que la ficha decida', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue(new ApiError(500, 'ERROR', 'Caido'));
    await expect(criminalesApi.cartelVigente('c-7')).rejects.toBeInstanceOf(ApiError);
  });
});
