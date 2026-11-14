import { Link } from 'react-router-dom';
import { useCatalogos } from '@core/catalogos/catalogos';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { CartelWanted } from '@shared/ui/CartelWanted';
import { Skeleton } from '@shared/ui/Estados';
import { MontoBerries } from '@shared/ui/MontoBerries';
import { RetratoCriminal } from '@shared/ui/RetratoCriminal';
import type { DatosCartel } from '@shared/utils/cartel';
import { formatearSoloFecha } from '@shared/utils/fecha';
import type { EstadoCartel } from '../data-access/ficha.store';
import type { CartelVigenteResumen, CriminalDetalle } from '../models/criminal';
import { useNombreZonaConMar } from '@shared/ui/CampoZona';

const MOTIVO_CARTEL: Readonly<Record<string, string>> = {
  REGISTRO: 'por el registro',
  CAMBIO_FOTO: 'por foto nueva',
  CAMBIO_RECOMPENSA: 'por cambio de recompensa',
  CAMBIO_ESTADO: 'por cambio de estado',
  CAMBIO_AFILIACION: 'por cambio de afiliación',
  CAMBIO_DATOS: 'por cambio de datos',
  MANUAL: 'a mano',
};

interface Props {
  readonly criminal: CriminalDetalle;
  readonly cartel: CartelVigenteResumen | null;
  /** Lo impreso en el cartel vigente; null si no hay cartel emitido o no se pudo leer. */
  readonly instantanea: DatosCartel | null;
  /** Lectura del cartel: solo con 'listo' se puede afirmar que no hay cartel. */
  readonly estadoCartel: EstadoCartel;
}

/**
 * Columna de identificacion de la ficha: el cartel oficial vigente, la
 * recompensa (el dato que manda) y los datos personales. Es la "hoja de
 * filiacion" del expediente.
 *
 * El cartel es la instantanea emitida, nunca uno armado con los datos de hoy:
 * lo que se ve es lo que circula por las bases. Sin cartel, un hueco que lo
 * dice y lleva a emitirlo; la foto del expediente ocupa su lugar.
 */
export function FichaIdentidad({
  criminal,
  cartel,
  instantanea,
  estadoCartel,
}: Props): React.ReactElement {
  const { nombreBase } = useCatalogos();
  const zonaConMar = useNombreZonaConMar();
  const base = criminal.origenBaseNombre ?? nombreBase(criminal.origenBaseId);

  return (
    <aside className="expediente-identidad" aria-label="Identificación">
      <section className="identidad-cartel" aria-label="Cartel de búsqueda">
        {instantanea ? (
          <figure className="identidad-cartel-oficial">
            <CartelWanted
              datos={instantanea}
              version={cartel ? { numero: cartel.numeroVersion, fecha: cartel.generadoEn } : null}
            />
            <figcaption>
              {cartel && (
                <>
                  Versión {cartel.numeroVersion},{' '}
                  {MOTIVO_CARTEL[cartel.motivoGeneracion] ?? 'generada'}.{' '}
                  <ActualizadoHace fecha={cartel.generadoEn} prefijo="Emitida" />
                </>
              )}
              <Link to={`/carteles/${criminal.id}`} className="identidad-enlace">
                Ver cartel y versiones
              </Link>
            </figcaption>
          </figure>
        ) : estadoCartel === 'cargando' ? (
          <Skeleton forma="bloque" className="identidad-cartel-hueso" />
        ) : (
          <div className="identidad-cartel-hueco">
            <p className="identidad-cartel-hueco-titulo">
              {estadoCartel === 'error' ? 'No se pudo leer el cartel' : 'Sin cartel emitido'}
            </p>
            <Link to={`/carteles/${criminal.id}`} className="identidad-enlace">
              {estadoCartel === 'error' ? 'Ver cartel y versiones' : 'Emitir cartel'}
            </Link>
          </div>
        )}
      </section>

      <div className="identidad-cabeza">
        {!instantanea && estadoCartel !== 'cargando' && (
          <RetratoCriminal fotoUrl={criminal.fotoUrl} nombre={criminal.nombre} tamano="xl" />
        )}
        <div className="identidad-recompensa">
          <span className="identidad-etiqueta">Recompensa vigente</span>
          <MontoBerries valor={criminal.recompensaVigenteMonto} tamano="grande" />
        </div>
      </div>

      <dl className="identidad-datos">
        <div>
          <dt>Edad</dt>
          <dd>{criminal.edad === null ? 'Desconocida' : `${criminal.edad} años`}</dd>
        </div>
        <div>
          <dt>Zona de influencia</dt>
          <dd>{zonaConMar(criminal.zonaInfluenciaId) ?? 'Sin zona conocida'}</dd>
        </div>
        <div>
          <dt>En el archivo desde</dt>
          <dd>
            {formatearSoloFecha(criminal.createdAt)}
            {base && <span className="identidad-secundario"> · {base}</span>}
          </dd>
        </div>
        {criminal.fechaBaja && (
          <div>
            <dt>Búsqueda cerrada</dt>
            <dd>{formatearSoloFecha(criminal.fechaBaja)}</dd>
          </div>
        )}
      </dl>

      <div className="identidad-bloque">
        <h2 className="identidad-etiqueta">Descripción física</h2>
        <p className="identidad-descripcion">
          {criminal.descripcionFisica?.trim() || 'Sin descripción registrada.'}
        </p>
      </div>
    </aside>
  );
}
