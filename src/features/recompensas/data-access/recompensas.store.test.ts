import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@core/http/api-client';
import { PAGINA_VACIA } from '@core/models/page-result';
import type { CriminalResumen, Recompensa } from '../models/recompensa';
import { recompensasApi } from './recompensas-api';
import { useRecompensasStore } from './recompensas.store';

const CRIMINAL: CriminalResumen = {
  id: 'c-1',
  nombre: 'Criminal de prueba',
  alias: [],
  fotoUrl: null,
  estado: 'ACTIVO',
  nivelAmenaza: 'MEDIO',
  recompensaVigenteMonto: 200_000_000,
  zonaInfluenciaId: null,
  organizacion: null,
};

function recompensa(id: string, criminalId: string): Recompensa {
  return {
    id,
    criminalId,
    monto: 10,
    moneda: 'BERRY',
    estado: 'PENDIENTE_VALIDACION',
    requiereValidacion: true,
    solicitadaPor: null,
    fechaSolicitud: '2026-11-01T00:00:00Z',
    validadaPor: null,
    fechaValidacion: null,
    vigenteDesde: null,
    vigenteHasta: null,
    motivo: null,
  };
}

describe('useRecompensasStore', () => {
  beforeEach(() => {
    useRecompensasStore.setState({
      pendientes: {
        recompensas: [],
        meta: PAGINA_VACIA,
        cargando: false,
        error: null,
        consultadoEn: null,
      },
    });
  });

  it('carga la bandeja y quita una solicitud resuelta sin recargar', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(CRIMINAL);
    vi.spyOn(recompensasApi, 'pendientes').mockResolvedValue({
      data: [recompensa('r-1', 'c-1'), recompensa('r-2', 'c-1')],
      meta: { ...PAGINA_VACIA, total: 2, totalPages: 1 },
    });

    await useRecompensasStore.getState().cargarPendientes(1);
    useRecompensasStore.getState().quitarPendiente('r-1');

    const { pendientes } = useRecompensasStore.getState();
    expect(pendientes.recompensas.map((r) => r.id)).toEqual(['r-2']);
    expect(pendientes.meta.total).toBe(1);
    expect(pendientes.consultadoEn).not.toBeNull();
  });
});
