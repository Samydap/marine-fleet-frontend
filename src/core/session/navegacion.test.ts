import { describe, expect, it } from 'vitest';
import { navegacionVisible, permisosDeFeature, rutaInicio } from './navegacion';
import { Permiso, RolCodigo } from './permiso.enum';

/**
 * Matriz de PERMISOS_POR_ROL del backend (shared/domain/rbac/permiso.enum.ts),
 * copiada aqui para que la prueba falle si la navegacion deja de cuadrar con
 * los permisos reales de cada cargo.
 */
const MATRIZ: Record<RolCodigo, Permiso[]> = {
  [RolCodigo.ALMIRANTE]: [Permiso.TODO],
  [RolCodigo.DIRECTOR_INTELIGENCIA]: [
    Permiso.CRIMINALES_LEER,
    Permiso.CRIMINALES_ESCRIBIR,
    Permiso.INTELIGENCIA_LEER,
    Permiso.INTELIGENCIA_ESCRIBIR,
    Permiso.INTELIGENCIA_REVISAR_REPORTES,
    Permiso.OPERATIVOS_LEER,
    Permiso.INCIDENTES_LEER,
    Permiso.CARTELES_GENERAR,
    Permiso.REPORTES_LEER,
  ],
  [RolCodigo.ANALISTA_DATOS_CRIMINALES]: [
    Permiso.CRIMINALES_LEER,
    Permiso.CRIMINALES_ESCRIBIR,
    Permiso.RECOMPENSAS_SOLICITAR,
    Permiso.CARTELES_GENERAR,
    Permiso.INTELIGENCIA_LEER,
    Permiso.INCIDENTES_LEER,
    Permiso.OPERATIVOS_LEER,
    Permiso.AMENAZA_CONFIGURAR_CRITERIOS,
    Permiso.REPORTES_LEER,
  ],
  [RolCodigo.COORDINADOR_OPERACIONES]: [
    Permiso.CRIMINALES_LEER,
    Permiso.INTELIGENCIA_LEER,
    Permiso.OPERATIVOS_LEER,
    Permiso.OPERATIVOS_COORDINAR,
    Permiso.INCIDENTES_LEER,
    Permiso.INCIDENTES_ESCRIBIR,
    Permiso.CATALOGOS_ADMINISTRAR,
    Permiso.REPORTES_LEER,
  ],
  [RolCodigo.DESARROLLADOR_BACKEND]: [
    Permiso.CRIMINALES_LEER,
    Permiso.INTELIGENCIA_LEER,
    Permiso.OPERATIVOS_LEER,
    Permiso.INCIDENTES_LEER,
    Permiso.SISTEMA_CONFIGURAR,
  ],
  [RolCodigo.ESPECIALISTA_SEGURIDAD]: [
    Permiso.USUARIOS_ADMINISTRAR,
    Permiso.AUDITORIA_LEER,
    Permiso.SISTEMA_CONFIGURAR,
    Permiso.CRIMINALES_LEER,
  ],
  [RolCodigo.CAPITAN]: [
    Permiso.CRIMINALES_LEER,
    Permiso.CRIMINALES_ESCRIBIR,
    Permiso.RECOMPENSAS_SOLICITAR,
    Permiso.INTELIGENCIA_LEER,
    Permiso.INTELIGENCIA_ESCRIBIR,
    Permiso.OPERATIVOS_LEER,
    Permiso.INCIDENTES_LEER,
    Permiso.INCIDENTES_ESCRIBIR,
  ],
};

const usuario = (rol: RolCodigo): { rol: RolCodigo; permisos: Permiso[] } => ({
  rol,
  permisos: MATRIZ[rol],
});

describe('rutaInicio', () => {
  it.each([
    [RolCodigo.ALMIRANTE, '/recompensas/validacion'],
    [RolCodigo.DIRECTOR_INTELIGENCIA, '/inteligencia'],
    [RolCodigo.ANALISTA_DATOS_CRIMINALES, '/amenaza'],
    [RolCodigo.COORDINADOR_OPERACIONES, '/operativos'],
    [RolCodigo.CAPITAN, '/operativos'],
    [RolCodigo.ESPECIALISTA_SEGURIDAD, '/admin/bitacora'],
    [RolCodigo.DESARROLLADOR_BACKEND, '/criminales'],
  ])('lleva a %s a su pantalla de llegada (%s)', (rol, ruta) => {
    expect(rutaInicio(usuario(rol))).toBe(ruta);
  });

  it('si el cargo perdio el permiso de su llegada, va a la primera seccion visible', () => {
    expect(
      rutaInicio({ rol: RolCodigo.COORDINADOR_OPERACIONES, permisos: [Permiso.INCIDENTES_LEER] }),
    ).toBe('/incidentes');
  });

  it('sin ninguna seccion visible va a /sin-acceso, y sin usuario al login', () => {
    expect(rutaInicio({ rol: RolCodigo.CAPITAN, permisos: [] })).toBe('/sin-acceso');
    expect(rutaInicio(null)).toBe('/auth/login');
  });
});

describe('navegacionVisible', () => {
  it('el Almirante ve todas las secciones', () => {
    expect(navegacionVisible([Permiso.TODO])).toHaveLength(8);
  });

  it('el Especialista en Seguridad ve administracion pero no recompensas', () => {
    const claves = navegacionVisible(MATRIZ[RolCodigo.ESPECIALISTA_SEGURIDAD]).map((e) => e.clave);
    expect(claves).toContain('admin');
    expect(claves).not.toContain('recompensas');
  });

  it('el Capitan no ve amenaza ni administracion', () => {
    const claves = navegacionVisible(MATRIZ[RolCodigo.CAPITAN]).map((e) => e.clave);
    expect(claves).toEqual(
      expect.arrayContaining(['criminales', 'operativos', 'incidentes', 'recompensas']),
    );
    expect(claves).not.toContain('amenaza');
    expect(claves).not.toContain('admin');
  });

  it('permisosDeFeature devuelve los permisos del guard raiz', () => {
    expect(permisosDeFeature('operativos')).toEqual([Permiso.OPERATIVOS_LEER]);
  });
});
