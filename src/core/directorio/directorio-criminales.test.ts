import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../http/api-client';
import {
  olvidarCriminal,
  resolverCriminales,
  useDirectorioStore,
  limpiarDirectorioCriminales,
  type CriminalBreve,
} from './directorio-criminales';

const CRIMINAL: CriminalBreve = {
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

describe('directorio de criminales', () => {
  beforeEach(() => limpiarDirectorioCriminales());
  afterEach(() => vi.restoreAllMocks());

  it('pide cada criminal una sola vez y recuerda los que no existen como null', async () => {
    const leer = vi.spyOn(apiClient, 'get').mockImplementation(async (ruta: string) => {
      if (ruta.endsWith('/c-1')) return CRIMINAL;
      throw new Error('404');
    });

    await resolverCriminales(['c-1', 'c-1', 'c-borrado']);
    await resolverCriminales(['c-1']);

    expect(leer).toHaveBeenCalledTimes(2);
    expect(useDirectorioStore.getState().porId).toEqual({ 'c-1': CRIMINAL, 'c-borrado': null });
  });

  it('las lecturas van en silencio: el fallo lo cuenta quien lo pinta', async () => {
    const leer = vi.spyOn(apiClient, 'get').mockResolvedValue(CRIMINAL);
    await resolverCriminales(['c-1']);
    expect(leer).toHaveBeenCalledWith('/criminales/c-1', undefined, { silencioso: true });
  });

  it('olvidar un criminal hace que se vuelva a pedir', async () => {
    const leer = vi.spyOn(apiClient, 'get').mockResolvedValue(CRIMINAL);
    await resolverCriminales(['c-1']);
    olvidarCriminal('c-1');
    await resolverCriminales(['c-1']);
    expect(leer).toHaveBeenCalledTimes(2);
  });
});
