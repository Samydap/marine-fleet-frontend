import { useEffect, useState } from 'react';
import { Permiso, etiquetaRol } from '@core/session/permiso.enum';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { useValorDiferido } from '@shared/hooks/useValorDiferido';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { BarraFiltros } from '@shared/ui/BarraFiltros';
import { Boton } from '@shared/ui/Boton';
import { CampoSelect, CampoTexto } from '@shared/ui/Campo';
import { Dialogo } from '@shared/ui/Dialogo';
import { EstadoVacio } from '@shared/ui/Estados';
import { IconoBrujula, IconoRecargar } from '@shared/ui/iconos';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { PageHeader } from '@shared/ui/PageHeader';
import { SeccionesAdmin } from '../components/SeccionesAdmin';
import { Paginacion } from '@shared/ui/Paginacion';
import { TablaDatos, type ColumnaTabla } from '@shared/ui/TablaDatos';
import { formatearFecha } from '@shared/utils/fecha';
import { TextoRecortado } from '@shared/ui/TextoRecortado';
import { useBitacoraStore } from '../data-access/admin.store';
import {
  ENTIDADES_AUDITADAS,
  describirAccion,
  diferencias,
  etiquetaEntidad,
  etiquetaTipoAccion,
  type RegistroAuditoria,
} from '../models/auditoria';

function DetalleRegistro({
  registro,
  onCerrar,
  nombreUsuario,
}: {
  readonly registro: RegistroAuditoria | null;
  readonly onCerrar: () => void;
  readonly nombreUsuario: (registro: RegistroAuditoria) => string;
}): React.ReactElement {
  const cambios = registro ? diferencias(registro.valorAnterior, registro.valorNuevo) : [];
  return (
    <Dialogo
      abierto={registro !== null}
      onCerrar={onCerrar}
      ancho="amplio"
      titulo={registro ? describirAccion(registro.accion) : ''}
      descripcion={
        registro &&
        `${nombreUsuario(registro)} · ${formatearFecha(registro.fecha)}${
          registro.ip ? ` · IP ${registro.ip}` : ''
        }`
      }
      acciones={<Boton onClick={onCerrar}>Cerrar</Boton>}
    >
      {registro && (
        <>
          <dl className="bitacora-datos">
            <dt>Registro</dt>
            <dd>
              {etiquetaEntidad(registro.entidad)}
              {registro.entidadId && <code> {registro.entidadId}</code>}
            </dd>
            <dt>Petición</dt>
            <dd>
              <code>
                {registro.metodo ?? '—'} {registro.ruta ?? ''}
              </code>
            </dd>
            <dt>Resultado</dt>
            <dd>{registro.exitoso ? 'Completada' : 'Rechazada o fallida'}</dd>
          </dl>
          {cambios.length === 0 ? (
            <p className="bitacora-nota">Esta acción no dejó cambios de datos registrados.</p>
          ) : (
            <table className="bitacora-cambios">
              <caption className="sr-only">Campos modificados</caption>
              <thead>
                <tr>
                  <th scope="col">Campo</th>
                  <th scope="col">Antes</th>
                  <th scope="col">Después</th>
                </tr>
              </thead>
              <tbody>
                {cambios.map((c) => (
                  <tr key={c.campo}>
                    <th scope="row">{c.campo}</th>
                    <td>{c.anterior}</td>
                    <td>{c.nuevo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </Dialogo>
  );
}

/** RF-7 Bitacora de auditoria: quien hizo que, cuando y sobre que registro. Solo lectura. */
export function BitacoraPage(): React.ReactElement {
  const s = useBitacoraStore();
  const { filas, meta, cargando, error, consultadoEn, filtro, nombres, cargar } = s;
  const leeUsuarios = useHasPermission(Permiso.USUARIOS_ADMINISTRAR);
  const [texto, setTexto] = useState(filtro.entidadId ?? '');
  const entidadId = useValorDiferido(texto.trim(), 350);
  const [abierto, setAbierto] = useState<RegistroAuditoria | null>(null);

  useEffect(() => {
    void cargar({ entidadId: entidadId || undefined, page: 1 });
  }, [cargar, entidadId]);

  const { cargarNombres } = s;
  useEffect(() => {
    if (leeUsuarios) void cargarNombres();
  }, [leeUsuarios, cargarNombres]);

  // La bitacora trae `usuarioNombre`; el directorio queda para registros sin el.
  const nombreUsuario = (r: RegistroAuditoria): string =>
    r.usuarioId
      ? (r.usuarioNombre ?? nombres[r.usuarioId] ?? r.usuarioId)
      : 'Sistema o visitante anónimo';

  const columnas: ColumnaTabla<RegistroAuditoria>[] = [
    {
      clave: 'accion',
      encabezado: 'Acción',
      principal: true,
      celda: (r) => (
        <span className="bitacora-accion">
          <button type="button" className="bitacora-enlace" onClick={() => setAbierto(r)}>
            {describirAccion(r.accion)}
          </button>
          <small>{etiquetaTipoAccion(r.tipoAccion)}</small>
        </span>
      ),
    },
    {
      clave: 'registro',
      encabezado: 'Registro',
      celda: (r) => (
        <span className="bitacora-accion">
          {etiquetaEntidad(r.entidad)}
          {r.entidadId && <small className="bitacora-id">{r.entidadId}</small>}
        </span>
      ),
    },
    {
      clave: 'usuario',
      encabezado: 'Usuario',
      celda: (r) => (
        <span className="bitacora-accion">
          <TextoRecortado texto={nombreUsuario(r)} />
          {r.rol && <small>{etiquetaRol(r.rol)}</small>}
        </span>
      ),
    },
    {
      clave: 'fecha',
      encabezado: 'Fecha',
      ancho: '11rem',
      celda: (r) => <time dateTime={r.fecha}>{formatearFecha(r.fecha)}</time>,
    },
    {
      clave: 'resultado',
      encabezado: 'Resultado',
      ancho: '8rem',
      celda: (r) => (
        <InsigniaEstado
          etiqueta={r.exitoso ? 'Exitosa' : 'Fallida'}
          tono={r.exitoso ? 'neutro' : 'peligro'}
        />
      ),
    },
    {
      clave: 'ip',
      encabezado: 'IP',
      ocultarEnMovil: true,
      ancho: '8rem',
      celda: (r) => <span className="cifra">{r.ip ?? '—'}</span>,
    },
  ];

  const activos = [
    filtro.entidad,
    filtro.usuarioId,
    filtro.exitoso === undefined ? undefined : 'x',
    filtro.desde,
    filtro.hasta,
  ].filter(Boolean).length;
  const hayFiltros = activos > 0 || Boolean(entidadId);

  function limpiar(): void {
    setTexto('');
    void cargar({
      entidad: undefined,
      entidadId: undefined,
      usuarioId: undefined,
      exitoso: undefined,
      desde: undefined,
      hasta: undefined,
      page: 1,
    });
  }

  return (
    <>
      <PageHeader
        titulo="Bitácora de auditoría"
        descripcion="Cada acción registrada en el sistema: quién, qué, cuándo y desde dónde."
        meta={consultadoEn && <ActualizadoHace fecha={consultadoEn} prefijo="Consultada" />}
      >
        <Boton
          icono={<IconoRecargar tamano={18} />}
          cargando={cargando}
          textoCargando="Consultando…"
          onClick={() => void cargar()}
        >
          Actualizar
        </Boton>
      </PageHeader>
      <SeccionesAdmin />

      <BarraFiltros
        busqueda={texto}
        onBusquedaChange={setTexto}
        etiquetaBusqueda="Buscar por identificador del registro (p. ej. c-luffy)"
        filtrosActivos={activos}
        onLimpiar={limpiar}
      >
        <CampoSelect
          etiqueta="Registro"
          opcionVacia="Todos"
          value={filtro.entidad ?? ''}
          opciones={ENTIDADES_AUDITADAS}
          onChange={(e) => void cargar({ entidad: e.target.value || undefined, page: 1 })}
        />
        {Object.keys(nombres).length > 0 && (
          <CampoSelect
            etiqueta="Usuario"
            opcionVacia="Todos"
            value={filtro.usuarioId ?? ''}
            opciones={Object.entries(nombres)
              .sort(([, a], [, b]) => a.localeCompare(b))
              .map(([valor, etiqueta]) => ({ valor, etiqueta }))}
            onChange={(e) => void cargar({ usuarioId: e.target.value || undefined, page: 1 })}
          />
        )}
        <CampoSelect
          etiqueta="Resultado"
          opcionVacia="Todos"
          value={filtro.exitoso === undefined ? '' : String(filtro.exitoso)}
          opciones={[
            { valor: 'true', etiqueta: 'Exitosas' },
            { valor: 'false', etiqueta: 'Fallidas' },
          ]}
          onChange={(e) =>
            void cargar({
              exitoso: e.target.value === '' ? undefined : e.target.value === 'true',
              page: 1,
            })
          }
        />
        <CampoTexto
          etiqueta="Desde"
          type="date"
          value={filtro.desde ?? ''}
          onChange={(e) => void cargar({ desde: e.target.value || undefined, page: 1 })}
        />
        <CampoTexto
          etiqueta="Hasta"
          type="date"
          value={filtro.hasta?.slice(0, 10) ?? ''}
          onChange={(e) =>
            // Hasta el final del dia: el backend compara fecha <= hasta.
            void cargar({
              hasta: e.target.value ? `${e.target.value}T23:59:59` : undefined,
              page: 1,
            })
          }
        />
      </BarraFiltros>

      <TablaDatos
        titulo="Registros de la bitácora"
        filas={filas}
        columnas={columnas}
        claveFila={(r) => r.id}
        cargando={cargando && filas.length === 0}
        actualizando={cargando && filas.length > 0}
        error={error}
        onReintentar={() => void cargar()}
        claseFila={(r) => (r.exitoso ? undefined : 'bitacora-fila--fallida')}
        vacio={
          hayFiltros ? (
            <EstadoVacio
              icono={<IconoBrujula tamano={28} />}
              titulo="Ningún registro coincide con los filtros"
              detalle="Amplía el rango de fechas o quita algún filtro."
            />
          ) : (
            <EstadoVacio
              titulo="La bitácora aún no tiene registros"
              detalle="Cada acción de los usuarios quedará anotada aquí."
            />
          )
        }
      />

      <Paginacion
        meta={meta}
        sustantivo="registros"
        deshabilitada={cargando}
        onCambiarPagina={(p) => void s.irAPagina(p)}
      />

      <DetalleRegistro
        registro={abierto}
        onCerrar={() => setAbierto(null)}
        nombreUsuario={nombreUsuario}
      />
    </>
  );
}
