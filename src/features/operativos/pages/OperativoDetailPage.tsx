import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCatalogos } from '@core/catalogos/catalogos';
import { notificar } from '@core/services/notification.store';
import { Permiso } from '@core/session/permiso.enum';
import { useUsuario } from '@core/session/session.store';
import { EVENTOS, type OperativoActualizadoDatos } from '@core/sync/eventos';
import { useCambiosSincronizados } from '@core/sync/sincronizacion';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { AlertaConflicto, esConflictoDeVersion } from '@shared/ui/Alerta';
import { BadgeAmenaza } from '@shared/ui/BadgeAmenaza';
import { Boton, BotonEnlace } from '@shared/ui/Boton';
import { DialogoConfirmacion } from '@shared/ui/Dialogo';
import { EstadoCargando, EstadoError, EstadoVacio } from '@shared/ui/Estados';
import { IconoMas } from '@shared/ui/iconos';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { MontoBerries } from '@shared/ui/MontoBerries';
import { PageHeader } from '@shared/ui/PageHeader';
import { TablaDatos, type ColumnaTabla } from '@shared/ui/TablaDatos';
import { etiquetaEstadoCriminal, tonoEstadoCriminal } from '@shared/utils/criminal';
import { DialogoAsignarBases } from '../components/DialogoAsignarBases';
import { DialogoCierre } from '../components/DialogoCierre';
import { DialogoResponsables } from '../components/DialogoResponsables';
import { MarcaPrioridad } from '@shared/ui/MarcaPrioridad';
import { PanelLateral } from '../components/PanelLateral';
import { useOperativoDetalleStore } from '../data-access/operativo-detalle.store';
import {
  basesOrdenadas,
  esEstadoFinal,
  etiquetaEstadoOperativo,
  etiquetaRolParticipacion,
  puedeAbortar,
  puedeCerrar,
  puedeIniciar,
  tonoEstadoOperativo,
  type ParticipacionBase,
} from '../models/operativo';
import '../operativos.css';

type Dialogo = 'iniciar' | 'abortar' | 'cerrar' | 'bases' | 'responsables' | null;

/** RF-4 Ficha del operativo: objetivo, bases, responsables, estado y cierre. */
export function OperativoDetailPage(): React.ReactElement {
  const { id = '' } = useParams();
  const s = useOperativoDetalleStore();
  const { operativo: op, cargando, error, conflicto, nombres, cargar } = s;
  const { nombreBase, nombreZona } = useCatalogos();
  const yo = useUsuario();
  const puedeCoordinar = useHasPermission(Permiso.OPERATIVOS_COORDINAR);
  const puedeRegistrarIncidente = useHasPermission(Permiso.INCIDENTES_ESCRIBIR);
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  // Version leida al abrir un dialogo de estado: si otra base cambia el
  // operativo mientras tanto, el backend responde 409 y no se pisa nada.
  const [versionLeida, setVersionLeida] = useState(0);

  useEffect(() => {
    void cargar(id);
  }, [cargar, id]);

  useCambiosSincronizados<OperativoActualizadoDatos>([EVENTOS.OPERATIVO_ACTUALIZADO], (c) => {
    if (c.datos?.operativoId !== id) return;
    void cargar(id, true);
    if (c.datos.usuarioId && c.datos.usuarioId !== yo?.id) {
      notificar.info(`Otra base actualizó ${c.datos.codigo}.`);
    }
  });

  function abrir(d: Exclude<Dialogo, null>): void {
    if (op) setVersionLeida(op.version);
    setDialogo(d);
  }

  /** Ante un 409 el dialogo se cierra para que se vea la AlertaConflicto. */
  async function conConflicto(accion: () => Promise<void>): Promise<void> {
    try {
      await accion();
    } catch (e) {
      if (esConflictoDeVersion(e)) setDialogo(null);
      throw e;
    }
  }

  if (!op) {
    if (error) {
      return (
        <>
          <PageHeader titulo="Operativo" volver={{ a: '/operativos', etiqueta: 'Operativos' }} />
          <EstadoError
            variante="pantalla"
            error={error}
            onReintentar={() => void cargar(id)}
            volver={{ a: '/operativos', etiqueta: 'Operativos' }}
          />
        </>
      );
    }
    return <EstadoCargando mensaje="Cargando el operativo…" filas={4} />;
  }

  const bases = basesOrdenadas(op);
  const editable = puedeCoordinar && !esEstadoFinal(op.estado);

  const COLUMNAS: ColumnaTabla<ParticipacionBase>[] = [
    {
      clave: 'base',
      encabezado: 'Base naval',
      principal: true,
      celda: (b) => (
        <span className="base-celda">
          <strong>{nombreBase(b.baseNavalId) ?? b.baseNavalId}</strong>
          <small>{etiquetaRolParticipacion(b.rolParticipacion)}</small>
        </span>
      ),
    },
    {
      clave: 'unidades',
      encabezado: 'Unidades',
      numerica: true,
      ancho: '7rem',
      celda: (b) => b.unidadesAsignadas,
    },
    { clave: 'recursos', encabezado: 'Recursos', celda: (b) => b.recursos ?? '—' },
    {
      clave: 'confirmada',
      encabezado: 'Confirmación',
      ancho: '9rem',
      celda: (b) => (
        <InsigniaEstado
          etiqueta={b.confirmada ? 'Confirmada' : 'Pendiente'}
          tono={b.confirmada ? 'exito' : 'info'}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        titulo={op.nombre}
        volver={{ a: '/operativos', etiqueta: 'Operativos' }}
        descripcion={
          <>
            <span className="cifra">{op.codigo}</span>
            {nombreZona(op.zonaInfluenciaId) ? ` · ${nombreZona(op.zonaInfluenciaId)}` : ''}
          </>
        }
        meta={
          <>
            <InsigniaEstado
              etiqueta={etiquetaEstadoOperativo(op.estado)}
              tono={tonoEstadoOperativo(op.estado)}
              enCurso={op.estado === 'EN_CURSO'}
            />
            <MarcaPrioridad prioridad={op.prioridad} />
            <ActualizadoHace fecha={op.updatedAt} prefijo="Cambió" />
          </>
        }
      >
        {puedeCoordinar && puedeAbortar(op.estado) && (
          <Boton variante="peligro-sutil" onClick={() => abrir('abortar')}>
            Abortar
          </Boton>
        )}
        {puedeCoordinar && puedeIniciar(op.estado) && (
          <Boton variante="principal" onClick={() => abrir('iniciar')}>
            Iniciar operativo
          </Boton>
        )}
        {puedeRegistrarIncidente && op.estado === 'EN_CURSO' && (
          // Por URL, sin importar la feature incidentes: llega con el operativo vinculado.
          <BotonEnlace to={`/incidentes/nuevo?operativo=${encodeURIComponent(op.id)}`}>
            Registrar enfrentamiento
          </BotonEnlace>
        )}
        {puedeCoordinar && puedeCerrar(op.estado) && (
          <Boton variante="principal" onClick={() => abrir('cerrar')}>
            Completar operativo
          </Boton>
        )}
      </PageHeader>

      <div className="aviso-ficha" aria-live="polite">
        {conflicto && (
          <AlertaConflicto
            onRecargar={() => {
              s.descartarConflicto();
              void cargar(id);
            }}
          />
        )}
      </div>

      <div className={cargando ? 'ficha ficha--actualizando' : 'ficha'}>
        <div className="ficha-principal">
          <section className="ficha-seccion" aria-labelledby="sec-objetivo">
            <h2 id="sec-objetivo" className="ficha-seccion-titulo">
              Objetivo
            </h2>
            <div className="ficha-superficie">
              {op.criminal ? (
                <div className="objetivo-ficha">
                  <Link className="objetivo-ficha-nombre" to={`/criminales/${op.criminal.id}`}>
                    {op.criminal.nombre}
                  </Link>
                  <span className="objetivo-datos">
                    <InsigniaEstado
                      etiqueta={etiquetaEstadoCriminal(op.criminal.estado)}
                      tono={tonoEstadoCriminal(op.criminal.estado)}
                    />
                    <BadgeAmenaza nivel={op.criminal.nivelAmenaza} />
                    <MontoBerries valor={op.criminal.recompensaVigenteMonto} />
                  </span>
                </div>
              ) : (
                <p className="ficha-nota">El criminal objetivo ya no está en el archivo.</p>
              )}
              <dl className="ficha-texto">
                <dt>Objetivo táctico</dt>
                <dd>{op.objetivo ?? 'Sin describir.'}</dd>
                {op.descripcion && (
                  <>
                    <dt>Notas para las bases</dt>
                    <dd>{op.descripcion}</dd>
                  </>
                )}
              </dl>
            </div>
          </section>

          <section className="ficha-seccion" aria-labelledby="sec-bases">
            <div className="ficha-seccion-cabecera">
              <h2 id="sec-bases" className="ficha-seccion-titulo">
                Bases asignadas <span className="cifra">{bases.length}</span>
              </h2>
              {editable && (
                <Boton
                  tamano="compacto"
                  icono={<IconoMas tamano={16} />}
                  onClick={() => abrir('bases')}
                >
                  Asignar bases
                </Boton>
              )}
            </div>
            <TablaDatos
              titulo="Bases asignadas al operativo"
              filas={bases}
              columnas={COLUMNAS}
              claveFila={(b) => b.baseNavalId}
            />
          </section>

          <section className="ficha-seccion" aria-labelledby="sec-responsables">
            <div className="ficha-seccion-cabecera">
              <h2 id="sec-responsables" className="ficha-seccion-titulo">
                Responsables <span className="cifra">{op.responsables.length}</span>
              </h2>
              {editable && (
                <Boton
                  tamano="compacto"
                  icono={<IconoMas tamano={16} />}
                  onClick={() => abrir('responsables')}
                >
                  Asignar responsables
                </Boton>
              )}
            </div>
            {op.responsables.length === 0 ? (
              <EstadoVacio
                titulo="Sin responsables asignados"
                detalle={
                  editable
                    ? 'Asigna al menos un marine al mando del despliegue.'
                    : 'El coordinador aún no ha asignado marines al mando.'
                }
              />
            ) : (
              <ul className="responsables ficha-superficie">
                {op.responsables.map((r) => (
                  <li key={r.usuarioId}>
                    <strong>{nombres[r.usuarioId] ?? `Marine ${r.usuarioId}`}</strong>
                    <span>{r.funcion}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <PanelLateral
          operativo={op}
          puedeCoordinar={puedeCoordinar}
          onCambiarPrioridad={async (p, v) => {
            await s.cambiarPrioridad(p, v);
            notificar.exito('Prioridad actualizada. Las bases asignadas ya fueron avisadas.');
          }}
        />
      </div>

      <DialogoConfirmacion
        abierto={dialogo === 'iniciar'}
        onCerrar={() => setDialogo(null)}
        titulo={`¿Iniciar el operativo ${op.codigo}?`}
        mensaje={`Pasa a «En curso» y se avisa a ${bases.length === 1 ? 'la base asignada' : `las ${bases.length} bases asignadas`}.`}
        textoConfirmar="Iniciar operativo"
        textoConfirmando="Iniciando…"
        onConfirmar={() => conConflicto(() => s.iniciar(versionLeida))}
      />
      <DialogoConfirmacion
        abierto={dialogo === 'abortar'}
        onCerrar={() => setDialogo(null)}
        titulo={`¿Abortar el operativo ${op.codigo}?`}
        mensaje="Es definitivo: las bases asignadas dejarán de verlo como activo y no podrá reanudarse."
        textoConfirmar="Abortar operativo"
        textoConfirmando="Abortando…"
        peligroso
        onConfirmar={() => conConflicto(() => s.abortar(versionLeida))}
      />
      <DialogoCierre
        abierto={dialogo === 'cerrar'}
        onCerrar={() => setDialogo(null)}
        codigo={op.codigo}
        version={versionLeida}
        onCerrarOperativo={s.cerrar}
      />
      <DialogoAsignarBases
        abierto={dialogo === 'bases'}
        onCerrar={() => setDialogo(null)}
        operativo={op}
        onAsignar={s.asignarBases}
      />
      <DialogoResponsables
        abierto={dialogo === 'responsables'}
        onCerrar={() => setDialogo(null)}
        operativo={op}
        onAsignar={s.asignarResponsables}
      />
    </>
  );
}
