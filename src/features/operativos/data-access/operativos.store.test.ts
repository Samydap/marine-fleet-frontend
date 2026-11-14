import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@core/models/api-response';
import { PAGINA_VACIA } from '@core/models/page-result';
import type { DetalleOperativo } from '../models/operativo';
import { useOperativoDetalleStore } from './operativo-detalle.store';
import { operativosApi } from './operativos-api';
import { DURACION_MARCA_MS, useTableroStore } from './operativos.store';

describe('useTableroStore', () => {
  beforeEach(() => {
    useTableroStore.setState({ operativos: [], recientes: {}, error: null });
  });

  it('un cambio de otra base recarga en silencio y marca la fila', async () => {
    const listar = vi
      .spyOn(operativosApi, 'listar')
      .mockResolvedValue({ data: [], meta: PAGINA_VACIA });
    await useTableroStore.getState().refrescar('op-1');
    expect(listar).toHaveBeenCalledWith(expect.any(Object), true);
    expect(useTableroStore.getState().recientes).toHaveProperty('op-1');
  });

  it('olvida las marcas pasado su tiempo', () => {
    useTableroStore.setState({ recientes: { viejo: 0, nuevo: 10_000 } });
    useTableroStore.getState().olvidarRecientes(DURACION_MARCA_MS + 1);
    expect(Object.keys(useTableroStore.getState().recientes)).toEqual(['nuevo']);
  });

  it('si la carga falla, guarda el error para el estado de la pantalla', async () => {
    const fallo = new ApiError(0, 'SIN_CONEXION', 'Sin conexión');
    vi.spyOn(operativosApi, 'listar').mockRejectedValue(fallo);
    await useTableroStore.getState().cargar();
    expect(useTableroStore.getState().error).toBe(fallo);
    expect(useTableroStore.getState().cargando).toBe(false);
  });
});

describe('useOperativoDetalleStore', () => {
  const detalle = {
    id: 'op-1',
    version: 3,
    bases: [],
    baseLiderId: 'b-1',
    estado: 'PLANIFICADO',
  } as unknown as DetalleOperativo;

  beforeEach(() => {
    useOperativoDetalleStore.setState({ operativo: detalle, conflicto: false, nombres: {} });
    vi.spyOn(operativosApi, 'usuariosDeBase').mockResolvedValue([]);
  });

  it('un 409 marca conflicto y no pisa el operativo', async () => {
    vi.spyOn(operativosApi, 'cambiarEstado').mockRejectedValue(
      new ApiError(409, 'CONFLICTO_CONCURRENCIA', 'Modificado por otro usuario'),
    );
    await expect(useOperativoDetalleStore.getState().iniciar(3)).rejects.toBeInstanceOf(ApiError);
    expect(useOperativoDetalleStore.getState().conflicto).toBe(true);
    expect(useOperativoDetalleStore.getState().operativo?.estado).toBe('PLANIFICADO');
  });

  it('una mutacion correcta mezcla la respuesta sobre el detalle', async () => {
    vi.spyOn(operativosApi, 'cambiarEstado').mockResolvedValue({
      ...detalle,
      estado: 'EN_CURSO',
      version: 4,
    });
    await useOperativoDetalleStore.getState().iniciar(3);
    const op = useOperativoDetalleStore.getState().operativo;
    expect(op?.estado).toBe('EN_CURSO');
    expect(op?.version).toBe(4);
  });
});
