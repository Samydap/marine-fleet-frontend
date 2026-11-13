import { Link } from 'react-router-dom';
import { useCatalogos } from '@core/catalogos/catalogos';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { MontoBerries } from '@shared/ui/MontoBerries';
import { RetratoCriminal } from '@shared/ui/RetratoCriminal';
import { formatearSoloFecha } from '@shared/utils/fecha';
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
}

/**
 * Columna de identificacion de la ficha: foto, recompensa (el dato que manda)
 * y los datos personales. Es la "hoja de filiacion" del expediente.
 */
export function FichaIdentidad({ criminal, cartel }: Props): React.ReactElement {
  const { nombreBase } = useCatalogos();
  const zonaConMar = useNombreZonaConMar();
  const base = nombreBase(criminal.origenBaseId);

  return (
    <aside className="expediente-identidad" aria-label="Identificación">
      <div className="identidad-cabeza">
        <RetratoCriminal fotoUrl={criminal.fotoUrl} nombre={criminal.nombre} tamano="xl" />
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
            <dt>Fecha de baja</dt>
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

      <div className="identidad-bloque identidad-cartel">
        <h2 className="identidad-etiqueta">Cartel de búsqueda</h2>
        {cartel ? (
          <p>
            Versión {cartel.numeroVersion}, {MOTIVO_CARTEL[cartel.motivoGeneracion] ?? 'generada'}.{' '}
            <ActualizadoHace fecha={cartel.generadoEn} prefijo="Emitida" />
          </p>
        ) : (
          <p>Aún no tiene cartel emitido.</p>
        )}
        <Link to={`/carteles/${criminal.id}`} className="identidad-enlace">
          {cartel ? 'Ver cartel y versiones' : 'Ir a carteles'}
        </Link>
      </div>
    </aside>
  );
}
