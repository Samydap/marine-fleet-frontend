import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { notificar } from '@core/services/notification.store';
import { Permiso } from '@core/session/permiso.enum';
import {
  EVENTOS,
  type CartelGeneradoDatos,
  type CriminalActualizadoDatos,
} from '@core/sync/eventos';
import { useCambiosSincronizados } from '@core/sync/sincronizacion';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { Alerta, AlertaConflicto } from '@shared/ui/Alerta';
import { BadgeAmenaza } from '@shared/ui/BadgeAmenaza';
import { Boton, BotonEnlace } from '@shared/ui/Boton';
import { EstadoError, Skeleton } from '@shared/ui/Estados';
import { IconoEditar } from '@shared/ui/iconos';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { InsigniaTipoCriminal } from '@shared/ui/InsigniaTipoCriminal';
import { PageHeader } from '@shared/ui/PageHeader';
import { etiquetaEstadoCriminal, tonoEstadoCriminal } from '@shared/utils/criminal';
import { formatearSoloFecha } from '@shared/utils/fecha';
import { DialogoEstado } from '../components/DialogoEstado';
import { FichaIdentidad } from '../components/FichaIdentidad';
import { SeccionAfiliaciones } from '../components/SeccionAfiliaciones';
import { SeccionAntecedentes } from '../components/SeccionAntecedentes';
import { SeccionHistorial } from '../components/SeccionHistorial';
import { useFichaStore } from '../data-access/ficha.store';
import '../criminales.css';

/** Payload con criminalId (los eventos de criminal, recompensa y amenaza lo traen). */
type ConCriminal = Partial<Pick<CriminalActualizadoDatos, 'criminalId'>>;

/**
 * RF-1 ficha del criminal: identificacion y recompensa, afiliaciones,
 * antecedentes, historial de modificaciones, cartel vigente y la baja.
 * Se refresca sola cuando otra base cambia este registro.
 */
export function CriminalDetailPage(): React.ReactElement {
  const { id = '' } = useParams<{ id: string }>();
  const ficha = useFichaStore();
  const { criminal, error, cartel, instantaneaCartel } = ficha;
  const puedeEscribir = useHasPermission(Permiso.CRIMINALES_ESCRIBIR);

  const [dialogo, setDialogo] = useState<'baja' | 'reactivar' | null>(null);
  const [conflicto, setConflicto] = useState(false);

  const { abrir, recargarCriminal, recargarHistorial, recargarCartel, recargarAntecedentes } =
    ficha;

  useEffect(() => {
    setConflicto(false);
    void abrir(id);
  }, [abrir, id]);

  // Otra base cambio a este criminal (datos, estado, recompensa o amenaza).
  useCambiosSincronizados<ConCriminal>(
    [
      EVENTOS.CRIMINAL_ACTUALIZADO,
      EVENTOS.CRIMINAL_ESTADO_CAMBIADO,
      EVENTOS.RECOMPENSA_VIGENTE,
      EVENTOS.AMENAZA_RECLASIFICADA,
    ],
    (c) => {
      if (c.datos?.criminalId !== id) return;
      void recargarCriminal(true);
      void recargarHistorial();
    },
  );
  useCambiosSincronizados<CartelGeneradoDatos>([EVENTOS.CARTEL_GENERADO], (c) => {
    if (c.datos?.criminalId === id) void recargarCartel();
  });

  const actual = criminal?.id === id ? criminal : null;

  if (!actual) {
    if (error) {
      return (
        <>
          <PageHeader
            titulo="Ficha del criminal"
            volver={{ a: '/criminales', etiqueta: 'Criminales' }}
          />
          <EstadoError
            variante="pantalla"
            error={error}
            onReintentar={() => void abrir(id)}
            volver={{ a: '/criminales', etiqueta: 'Criminales' }}
          />
        </>
      );
    }
    return <FichaCargando />;
  }

  function trasCambio(): void {
    void recargarCriminal();
    void recargarHistorial();
  }

  const estadoCerrado = actual.estado !== 'ACTIVO';

  return (
    <>
      <PageHeader
        titulo={actual.nombre}
        volver={{ a: '/criminales', etiqueta: 'Criminales' }}
        descripcion={
          actual.alias.length > 0 ? (
            <span className="ficha-alias">Alias «{actual.alias.join('», «')}»</span>
          ) : undefined
        }
        meta={
          <>
            <InsigniaTipoCriminal categoria={actual.organizacion?.categoria ?? null} />
            <InsigniaEstado
              etiqueta={etiquetaEstadoCriminal(actual.estado)}
              tono={tonoEstadoCriminal(actual.estado)}
            />
            <BadgeAmenaza nivel={actual.nivelAmenaza} conPrefijo />
            <ActualizadoHace fecha={actual.updatedAt} />
          </>
        }
      >
        {puedeEscribir && (
          <>
            {actual.estado === 'ACTIVO' && (
              <Boton variante="peligro-sutil" onClick={() => setDialogo('baja')}>
                Dar de baja
              </Boton>
            )}
            {actual.estado === 'CAPTURADO' && (
              <>
                <Boton onClick={() => setDialogo('reactivar')}>Reactivar búsqueda</Boton>
                <Boton variante="peligro-sutil" onClick={() => setDialogo('baja')}>
                  Registrar fallecimiento
                </Boton>
              </>
            )}
            <BotonEnlace
              variante="principal"
              to={`/criminales/${actual.id}/editar`}
              icono={<IconoEditar tamano={18} />}
            >
              Editar datos
            </BotonEnlace>
          </>
        )}
      </PageHeader>

      <div aria-live="polite" className="ficha-avisos">
        {conflicto && (
          <AlertaConflicto
            onRecargar={() => {
              setConflicto(false);
              void recargarCriminal();
              void recargarHistorial();
            }}
          />
        )}
        {estadoCerrado && (
          <Alerta
            tipo="info"
            titulo={
              actual.estado === 'CAPTURADO'
                ? `Capturado${actual.fechaBaja ? ` el ${formatearSoloFecha(actual.fechaBaja)}` : ''}`
                : `Fallecido${actual.fechaBaja ? ` el ${formatearSoloFecha(actual.fechaBaja)}` : ''}`
            }
          >
            Ya no es objetivo de captura. El expediente se conserva completo para consulta.
          </Alerta>
        )}
      </div>

      <div className="expediente">
        <FichaIdentidad criminal={actual} cartel={cartel} instantanea={instantaneaCartel} />

        <div className="expediente-cuerpo">
          <SeccionAfiliaciones
            criminal={actual}
            puedeEscribir={puedeEscribir}
            onCambio={trasCambio}
          />
          <SeccionAntecedentes
            criminalId={actual.id}
            nombre={actual.nombre}
            antecedentes={ficha.antecedentes}
            error={ficha.antecedentesError}
            puedeEscribir={puedeEscribir}
            onReintentar={() => void recargarAntecedentes()}
            onRegistrado={() => {
              void recargarAntecedentes();
              void recargarHistorial();
            }}
          />
          <SeccionHistorial
            entradas={ficha.historial}
            meta={ficha.historialMeta}
            cargando={ficha.historialCargando}
            error={ficha.historialError}
            onReintentar={() => void recargarHistorial()}
            onMas={() => void ficha.masHistorial()}
          />
        </div>
      </div>

      {dialogo && (
        <DialogoEstado
          abierto
          modo={dialogo}
          criminal={actual}
          onCerrar={() => setDialogo(null)}
          onConflicto={() => setConflicto(true)}
          onConfirmar={async (estado) => {
            await ficha.cambiarEstado(estado);
            notificar.exito(
              estado === 'ACTIVO'
                ? `${actual.nombre} vuelve a estar en búsqueda.`
                : `${actual.nombre}: baja registrada como ${etiquetaEstadoCriminal(estado).toLowerCase()}.`,
            );
          }}
        />
      )}
    </>
  );
}

/** Esqueleto con la forma de la ficha: columna de identidad + secciones. */
function FichaCargando(): React.ReactElement {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Abriendo la ficha…</span>
      <div className="ficha-cargando-cabecera">
        <Skeleton ancho="8rem" />
        <Skeleton ancho="18rem" alto={30} />
        <Skeleton ancho="24rem" />
      </div>
      <div className="expediente">
        <div className="expediente-identidad">
          <Skeleton forma="bloque" ancho={96} alto={96} />
          <Skeleton ancho="60%" alto={28} />
          <Skeleton ancho="80%" />
          <Skeleton ancho="70%" />
        </div>
        <div className="expediente-cuerpo">
          <div className="expediente-seccion">
            <Skeleton ancho="10rem" alto={22} />
            <Skeleton ancho="70%" />
          </div>
          <div className="expediente-seccion">
            <Skeleton ancho="12rem" alto={22} />
            <Skeleton ancho="85%" />
            <Skeleton ancho="60%" />
          </div>
        </div>
      </div>
    </div>
  );
}
