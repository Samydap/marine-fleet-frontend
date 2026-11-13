import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCatalogos } from '@core/catalogos/catalogos';
import type { RolCodigo } from '@core/session/permiso.enum';
import { ETIQUETA_ROL, etiquetaRol } from '@core/session/permiso.enum';
import { useValorDiferido } from '@shared/hooks/useValorDiferido';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { BarraFiltros } from '@shared/ui/BarraFiltros';
import { BotonEnlace } from '@shared/ui/Boton';
import { CampoSelect } from '@shared/ui/Campo';
import { EstadoVacio } from '@shared/ui/Estados';
import { IconoBrujula, IconoMas } from '@shared/ui/iconos';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { PageHeader } from '@shared/ui/PageHeader';
import { SeccionesAdmin } from '../components/SeccionesAdmin';
import { Paginacion } from '@shared/ui/Paginacion';
import { TablaDatos, type ColumnaTabla } from '@shared/ui/TablaDatos';
import { tiempoRelativo } from '@shared/utils/fecha';
import { TextoRecortado } from '@shared/ui/TextoRecortado';
import { useUsuariosStore } from '../data-access/admin.store';
import {
  etiquetaEstadoUsuario,
  opcionesEstadoUsuario,
  tonoEstadoUsuario,
  type EstadoUsuario,
  type Usuario,
} from '../models/usuario';

const OPCIONES_ROL = (Object.keys(ETIQUETA_ROL) as RolCodigo[]).map((valor) => ({
  valor,
  etiqueta: ETIQUETA_ROL[valor],
}));

/** RF-7 Cuentas del sistema, cada una asociada a su base naval (o global). */
export function UsuariosPage(): React.ReactElement {
  const { filas, meta, cargando, error, consultadoEn, filtro, cargar, irAPagina } =
    useUsuariosStore();
  const { mares, zonasDeMar, bases, nombreBase } = useCatalogos();
  const [texto, setTexto] = useState(filtro.q ?? '');
  const q = useValorDiferido(texto.trim(), 350);

  useEffect(() => {
    void cargar({ q: q || undefined, page: 1 });
  }, [cargar, q]);

  const columnas: ColumnaTabla<Usuario>[] = [
    {
      clave: 'nombre',
      encabezado: 'Marine',
      principal: true,
      celda: (u) => (
        <span className="usuario-celda">
          <Link to={u.id}>{u.nombreCompleto}</Link>
          <TextoRecortado como="small" texto={u.email} />
        </span>
      ),
    },
    {
      clave: 'rol',
      encabezado: 'Cargo',
      celda: (u) => u.rolNombre ?? (u.rol ? etiquetaRol(u.rol) : 'Sin cargo'),
    },
    {
      clave: 'base',
      encabezado: 'Base naval',
      celda: (u) =>
        u.baseNavalId ? (
          (nombreBase(u.baseNavalId) ?? u.baseNavalId)
        ) : (
          <span className="texto-apagado">Cuartel General (global)</span>
        ),
    },
    {
      clave: 'estado',
      encabezado: 'Estado',
      celda: (u) => (
        <span className="usuario-estado">
          <InsigniaEstado
            etiqueta={etiquetaEstadoUsuario(u.estado)}
            tono={tonoEstadoUsuario(u.estado)}
          />
          {u.intentosFallidos > 0 && u.estado !== 'BLOQUEADO' && (
            <small>
              {u.intentosFallidos}{' '}
              {u.intentosFallidos === 1 ? 'intento fallido' : 'intentos fallidos'}
            </small>
          )}
        </span>
      ),
    },
    {
      clave: 'acceso',
      encabezado: 'Último acceso',
      ocultarEnMovil: true,
      celda: (u) =>
        u.ultimoAcceso ? (
          <time dateTime={u.ultimoAcceso} title={u.ultimoAcceso}>
            {tiempoRelativo(u.ultimoAcceso)}
          </time>
        ) : (
          <span className="texto-apagado">Nunca ha entrado</span>
        ),
    },
  ];

  const activos = [filtro.rol, filtro.baseNavalId, filtro.estado].filter(Boolean).length;
  const hayFiltros = activos > 0 || Boolean(q);

  function limpiar(): void {
    setTexto('');
    void cargar({
      q: undefined,
      rol: undefined,
      baseNavalId: undefined,
      estado: undefined,
      page: 1,
    });
  }

  return (
    <>
      <PageHeader
        titulo="Usuarios"
        descripcion="Cuentas de acceso de cada base naval: cargo, base asignada y estado."
        meta={consultadoEn && <ActualizadoHace fecha={consultadoEn} prefijo="Consultado" />}
      >
        <BotonEnlace variante="principal" to="nuevo" icono={<IconoMas tamano={18} />}>
          Dar de alta
        </BotonEnlace>
      </PageHeader>
      <SeccionesAdmin />

      <BarraFiltros
        busqueda={texto}
        onBusquedaChange={setTexto}
        etiquetaBusqueda="Buscar por nombre o correo"
        filtrosActivos={activos}
        onLimpiar={limpiar}
      >
        <CampoSelect
          etiqueta="Base naval"
          opcionVacia="Todas las bases"
          value={filtro.baseNavalId ?? ''}
          onChange={(e) => void cargar({ baseNavalId: e.target.value || undefined, page: 1 })}
        >
          {mares.map((mar) => {
            const zonas = new Set(zonasDeMar(mar.id).map((z) => z.id));
            const delMar = bases.filter((b) => zonas.has(b.zonaInfluenciaId));
            if (delMar.length === 0) return null;
            return (
              <optgroup key={mar.id} label={mar.nombre}>
                {delMar.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </CampoSelect>
        <CampoSelect
          etiqueta="Cargo"
          opcionVacia="Todos"
          value={filtro.rol ?? ''}
          opciones={OPCIONES_ROL}
          onChange={(e) =>
            void cargar({ rol: (e.target.value || undefined) as RolCodigo, page: 1 })
          }
        />
        <CampoSelect
          etiqueta="Estado"
          opcionVacia="Todos"
          value={filtro.estado ?? ''}
          opciones={opcionesEstadoUsuario()}
          onChange={(e) =>
            void cargar({ estado: (e.target.value || undefined) as EstadoUsuario, page: 1 })
          }
        />
      </BarraFiltros>

      <TablaDatos
        titulo="Usuarios del sistema"
        filas={filas}
        columnas={columnas}
        claveFila={(u) => u.id}
        cargando={cargando && filas.length === 0}
        actualizando={cargando && filas.length > 0}
        error={error}
        onReintentar={() => void cargar()}
        claseFila={(u) => (u.estado === 'ACTIVO' ? undefined : 'usuario-fila--inactivo')}
        vacio={
          hayFiltros ? (
            <EstadoVacio
              icono={<IconoBrujula tamano={28} />}
              titulo="Ninguna cuenta coincide con los filtros"
              detalle="Prueba con otro nombre o correo, o quita algún filtro."
            />
          ) : (
            <EstadoVacio titulo="Aún no hay cuentas registradas">
              <BotonEnlace variante="secundario" to="nuevo">
                Dar de alta la primera
              </BotonEnlace>
            </EstadoVacio>
          )
        }
      />

      <Paginacion
        meta={meta}
        sustantivo="usuarios"
        deshabilitada={cargando}
        onCambiarPagina={(p) => void irAPagina(p)}
      />
    </>
  );
}
