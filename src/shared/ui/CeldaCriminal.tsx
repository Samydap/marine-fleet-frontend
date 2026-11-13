import { Link } from 'react-router-dom';
import { useCriminal } from '@core/directorio/directorio-criminales';
import { Skeleton } from './Estados';
import { RetratoCriminal } from './RetratoCriminal';
import { TextoRecortado } from './TextoRecortado';

interface Props {
  readonly criminalId: string;
  /** `md` donde el criminal es lo primero que se lee (bandeja de validacion). */
  readonly tamano?: 'sm' | 'md';
  /** Sin enlace a la ficha (dentro de un boton o de otro enlace). */
  readonly sinEnlace?: boolean;
}

/**
 * Resumen de un criminal en una celda de tabla: retrato, nombre (enlace a su
 * ficha) y alias. Las respuestas de recompensas, incidentes o reportes solo
 * traen el id: el nombre sale del directorio de core/, pedido una vez por
 * sesion. Si no se puede leer, lo dice; nunca muestra el id crudo.
 *
 *   celda: (r) => <CeldaCriminal criminalId={r.criminalId} />
 */
export function CeldaCriminal({
  criminalId,
  tamano = 'sm',
  sinEnlace = false,
}: Props): React.ReactElement {
  const criminal = useCriminal(criminalId);
  const lado = tamano === 'md' ? '48px' : '32px';

  if (criminal === undefined) {
    return (
      <span className="celda-criminal" aria-busy="true">
        <Skeleton forma="bloque" ancho={lado} alto={lado} />
        <Skeleton ancho="9rem" />
        <span className="sr-only">Cargando criminal</span>
      </span>
    );
  }

  if (criminal === null) {
    return (
      <span className="celda-criminal">
        <RetratoCriminal fotoUrl={null} nombre="?" tamano={tamano} marco="cartel" />
        <span className="celda-criminal-texto">
          <span className="celda-criminal-ausente">Criminal no disponible</span>
          <small>Se dio de baja del archivo o tu rol no puede verlo.</small>
        </span>
      </span>
    );
  }

  return (
    <span className="celda-criminal">
      <RetratoCriminal
        fotoUrl={criminal.fotoUrl}
        nombre={criminal.nombre}
        tamano={tamano}
        marco="cartel"
      />
      <span className="celda-criminal-texto">
        {sinEnlace ? (
          <TextoRecortado como="strong" texto={criminal.nombre} />
        ) : (
          <Link to={`/criminales/${encodeURIComponent(criminal.id)}`}>{criminal.nombre}</Link>
        )}
        {criminal.alias.length > 0 && (
          <TextoRecortado como="small" texto={`«${criminal.alias.join('», «')}»`} />
        )}
      </span>
    </span>
  );
}
