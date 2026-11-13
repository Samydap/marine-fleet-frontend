import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { notificar } from '@core/services/notification.store';
import { Permiso } from '@core/session/permiso.enum';
import { EVENTOS } from '@core/sync/eventos';
import { useCambiosSincronizados } from '@core/sync/sincronizacion';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { Boton } from '@shared/ui/Boton';
import { DialogoConfirmacion } from '@shared/ui/Dialogo';
import { EstadoError, EstadoVacio, Skeleton } from '@shared/ui/Estados';
import { IconoEditar } from '@shared/ui/iconos';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { InsigniaTipoCriminal } from '@shared/ui/InsigniaTipoCriminal';
import { MontoBerries } from '@shared/ui/MontoBerries';
import { PageHeader } from '@shared/ui/PageHeader';
import { TablaDatos, type ColumnaTabla } from '@shared/ui/TablaDatos';
import {
  etiquetaEstadoCriminal,
  etiquetaRolMembresia,
  etiquetaTipoAgrupacion,
  tonoEstadoCriminal,
} from '@shared/utils/criminal';
import { formatearSoloFecha } from '@shared/utils/fecha';
import { DialogoOrganizacion } from '../components/DialogoOrganizacion';
import { useNombreZonaConMar } from '@shared/ui/CampoZona';
import { organizacionesApi } from '../data-access/organizaciones-api';
import type { Miembro, OrganizacionDetalle } from '../models/criminal';
import '../criminales.css';

const ORDEN_ROL = { LIDER: 0, OFICIAL: 1, MIEMBRO: 2 } as const;

const COLUMNAS: readonly ColumnaTabla<Miembro>[] = [
  {
    clave: 'nombre',
    encabezado: 'Miembro',
    principal: true,
    celda: (m) => (
      <Link to={`/criminales/${m.criminalId}`}>{m.nombre ?? 'Registro sin nombre'}</Link>
    ),
  },
  { clave: 'rol', encabezado: 'Rol', celda: (m) => etiquetaRolMembresia(m.rol) },
  {
    clave: 'estado',
    encabezado: 'Estado',
    celda: (m) =>
      m.estado ? (
        <InsigniaEstado
          etiqueta={etiquetaEstadoCriminal(m.estado)}
          tono={tonoEstadoCriminal(m.estado)}
        />
      ) : (
        'Desconocido'
      ),
  },
  {
    clave: 'recompensa',
    encabezado: 'Recompensa',
    numerica: true,
    celda: (m) => <MontoBerries valor={m.recompensaVigenteMonto} abreviado />,
  },
  {
    clave: 'periodo',
    encabezado: 'Periodo',
    ocultarEnMovil: true,
    celda: (m) =>
      m.vigente
        ? m.fechaIngreso
          ? `Desde ${formatearSoloFecha(m.fechaIngreso)}`
          : 'Vigente'
        : `Salió ${m.fechaSalida ? formatearSoloFecha(m.fechaSalida) : '(fecha desconocida)'}`,
  },
];

/** RF-1 detalle de una tripulacion u organizacion: lider y miembros conocidos. */
export function OrganizacionDetailPage(): React.ReactElement {
  const { organizacionId = '' } = useParams<{ organizacionId: string }>();
  const puedeEscribir = useHasPermission(Permiso.CRIMINALES_ESCRIBIR);
  const zonaConMar = useNombreZonaConMar();

  const [org, setOrg] = useState<OrganizacionDetalle | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [cargando, setCargando] = useState(true);
  const [historicos, setHistoricos] = useState(false);
  const [consultadoEn, setConsultadoEn] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [confirmar, setConfirmar] = useState(false);

  const cargar = useCallback(
    async (silencioso = false): Promise<void> => {
      setCargando(true);
      try {
        const detalle = await organizacionesApi.obtener(organizacionId, historicos, silencioso);
        setOrg(detalle);
        setError(null);
        setConsultadoEn(new Date().toISOString());
      } catch (e) {
        setError(e);
      } finally {
        setCargando(false);
      }
    },
    [organizacionId, historicos],
  );

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Un miembro cambio de estado o de recompensa en otra base.
  useCambiosSincronizados(
    [EVENTOS.CRIMINAL_ACTUALIZADO, EVENTOS.CRIMINAL_ESTADO_CAMBIADO, EVENTOS.RECOMPENSA_VIGENTE],
    () => void cargar(true),
  );

  const volver = { a: '/criminales/organizaciones', etiqueta: 'Organizaciones' };

  if (!org || org.id !== organizacionId) {
    if (error) {
      return (
        <>
          <PageHeader titulo="Organización" volver={volver} />
          <EstadoError
            variante="pantalla"
            error={error}
            onReintentar={() => void cargar()}
            volver={volver}
          />
        </>
      );
    }
    return (
      <div role="status" aria-busy="true" className="ficha-cargando-cabecera">
        <span className="sr-only">Abriendo la organización…</span>
        <Skeleton ancho="8rem" />
        <Skeleton ancho="20rem" alto={30} />
        <Skeleton forma="bloque" alto={120} />
        <Skeleton forma="bloque" alto={240} />
      </div>
    );
  }

  const miembros = [...org.miembros].sort(
    (a, b) => Number(b.vigente) - Number(a.vigente) || ORDEN_ROL[a.rol] - ORDEN_ROL[b.rol],
  );
  const vigentes = org.miembros.filter((m) => m.vigente);
  const recompensaTotal = vigentes.reduce((s, m) => s + (m.recompensaVigenteMonto ?? 0), 0);
  const zona = zonaConMar(org.zonaInfluenciaId);

  return (
    <>
      <PageHeader
        titulo={org.nombre}
        volver={volver}
        descripcion={org.descripcion ?? undefined}
        meta={
          <>
            <InsigniaTipoCriminal categoria={org.categoria} />
            <InsigniaEstado
              etiqueta={org.activa ? 'Activa' : 'Disuelta'}
              tono={org.activa ? 'aviso' : 'neutro'}
            />
            <span className="ficha-meta-texto">
              {etiquetaTipoAgrupacion(org.tipoAgrupacion)}
              {zona && ` · ${zona}`}
            </span>
            {consultadoEn && <ActualizadoHace fecha={consultadoEn} prefijo="Consultado" />}
          </>
        }
      >
        {puedeEscribir && (
          <>
            {org.activa ? (
              <Boton variante="peligro-sutil" onClick={() => setConfirmar(true)}>
                Marcar disuelta
              </Boton>
            ) : (
              <Boton onClick={() => setConfirmar(true)}>Restablecer como activa</Boton>
            )}
            <Boton
              variante="principal"
              icono={<IconoEditar tamano={18} />}
              onClick={() => setEditando(true)}
            >
              Editar
            </Boton>
          </>
        )}
      </PageHeader>

      <section className="org-mando" aria-label="Mando y recompensa combinada">
        <div className="org-mando-lider">
          <span className="identidad-etiqueta">Líder</span>
          {org.lider ? (
            <>
              <Link className="org-mando-nombre" to={`/criminales/${org.lider.criminalId}`}>
                {org.lider.nombre ?? 'Registro sin nombre'}
              </Link>
              <MontoBerries valor={org.lider.recompensaVigenteMonto} />
            </>
          ) : (
            <span className="org-mando-nombre org-mando-nombre--vacio">Sin líder identificado</span>
          )}
        </div>
        <div className="org-mando-cifra">
          <span className="identidad-etiqueta">Miembros vigentes</span>
          <span className="org-mando-numero cifra">{org.totalMiembrosVigentes}</span>
        </div>
        <div className="org-mando-cifra">
          <span className="identidad-etiqueta">Recompensa combinada</span>
          <MontoBerries valor={vigentes.length ? recompensaTotal : null} tamano="grande" />
        </div>
      </section>

      <div className="org-miembros-cabecera">
        <h2>Miembros conocidos</h2>
        <label className="casilla">
          <input
            type="checkbox"
            checked={historicos}
            onChange={(e) => setHistoricos(e.target.checked)}
          />
          Incluir antiguos miembros
        </label>
      </div>

      <TablaDatos
        titulo={`Miembros de ${org.nombre}`}
        filas={miembros}
        columnas={COLUMNAS}
        claveFila={(m) => m.membresiaId}
        actualizando={cargando}
        claseFila={(m) => (m.vigente && m.estado === 'ACTIVO' ? undefined : 'criminal-fila--baja')}
        vacio={
          <EstadoVacio
            titulo="Sin miembros conocidos"
            detalle="Afilia criminales desde su ficha para verlos aquí."
          />
        }
      />

      <DialogoOrganizacion
        abierto={editando}
        organizacion={org}
        onCerrar={() => setEditando(false)}
        onGuardada={() => {
          setEditando(false);
          void cargar();
        }}
      />

      <DialogoConfirmacion
        abierto={confirmar}
        onCerrar={() => setConfirmar(false)}
        titulo={org.activa ? `¿Marcar ${org.nombre} como disuelta?` : `¿Restablecer ${org.nombre}?`}
        mensaje={
          org.activa
            ? 'Deja de ofrecerse para nuevas afiliaciones. Sus miembros y su historial se conservan.'
            : 'Vuelve a estar disponible para afiliar criminales.'
        }
        textoConfirmar={org.activa ? 'Marcar disuelta' : 'Restablecer'}
        textoConfirmando="Guardando…"
        peligroso={org.activa}
        onConfirmar={async () => {
          await organizacionesApi.actualizar(org.id, { activa: !org.activa });
          notificar.exito(
            org.activa ? 'Organización marcada como disuelta.' : 'Organización restablecida.',
          );
          await cargar();
        }}
      />
    </>
  );
}
