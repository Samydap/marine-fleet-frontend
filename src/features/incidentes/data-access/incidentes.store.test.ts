import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PAGINA_VACIA } from '@core/models/page-result';
import type { Incidente } from '../models/incidente';
import { incidentesApi } from './incidentes-api';
import { FILTRO_INICIAL_INCIDENTES, useIncidentesStore } from './incidentes.store';

const incidente = (id: string): Incidente =>
  ({ id, criminales: [], marinos: [] }) as unknown as Incidente;

describe('useIncidentesStore', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useIncidentesStore.setState({
      incidentes: [],
      meta: PAGINA_VACIA,
      cargando: false,
      error: null,
      consultadoEn: null,
      filtro: FILTRO_INICIAL_INCIDENTES,
    });
  });

  it('combina el filtro y guarda la pagina', async () => {
    const listar = vi.spyOn(incidentesApi, 'listar').mockResolvedValue({
      data: [incidente('i-1')],
      meta: { ...PAGINA_VACIA, total: 1, totalPages: 1 },
    });

    await useIncidentesStore.getState().cargar({ baseNavalId: 'b-153', operativoId: 'op-1' });

    expect(listar).toHaveBeenCalledWith(
      expect.objectContaining({ baseNavalId: 'b-153', operativoId: 'op-1', page: 1 }),
    );
    const estado = useIncidentesStore.getState();
    expect(estado.incidentes.map((i) => i.id)).toEqual(['i-1']);
    expect(estado.consultadoEn).not.toBeNull();
    expect(estado.error).toBeNull();
  });

  it('una respuesta vieja no pisa la del filtro nuevo', async () => {
    let resolverVieja: (v: Awaited<ReturnType<typeof incidentesApi.listar>>) => void = () => {};
    vi.spyOn(incidentesApi, 'listar')
      .mockImplementationOnce(() => new Promise((r) => (resolverVieja = r)))
      .mockResolvedValueOnce({ data: [incidente('nueva')], meta: PAGINA_VACIA });

    const vieja = useIncidentesStore.getState().cargar({ criminalId: 'c-luffy' });
    await useIncidentesStore.getState().cargar({ criminalId: 'c-zoro' });
    resolverVieja({ data: [incidente('vieja')], meta: PAGINA_VACIA });
    await vieja;

    expect(useIncidentesStore.getState().incidentes.map((i) => i.id)).toEqual(['nueva']);
    expect(useIncidentesStore.getState().filtro.criminalId).toBe('c-zoro');
  });

  it('si falla conserva lo que habia y guarda el error', async () => {
    useIncidentesStore.setState({ incidentes: [incidente('previo')] });
    const fallo = new Error('sin red');
    vi.spyOn(incidentesApi, 'listar').mockRejectedValue(fallo);

    await useIncidentesStore.getState().cargar();

    expect(useIncidentesStore.getState().incidentes.map((i) => i.id)).toEqual(['previo']);
    expect(useIncidentesStore.getState().error).toBe(fallo);
    expect(useIncidentesStore.getState().cargando).toBe(false);
  });
});
