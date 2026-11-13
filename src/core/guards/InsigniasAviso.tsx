import { EmblemaGaviota } from '../layout/emblemas/EmblemaGaviota';
import { SelloJusticia } from '../layout/emblemas/SelloJusticia';
import { RolCodigo } from '../session/permiso.enum';
import { useEsRol } from '../session/session.store';

/**
 * Encabezado de las pantallas de aviso (acceso denegado y 404): la gaviota y el
 * 正義 grande, estampados en la hoja como en una orden oficial. Sobre el papel
 * el 正義 va en tinta navy; en dorado solo para el Almirante.
 */
export function InsigniasAviso(): React.ReactElement {
  const esAlmirante = useEsRol(RolCodigo.ALMIRANTE);
  return (
    <div className="estado-insignias">
      <EmblemaGaviota variante="linea" tamano={56} className="estado-gaviota" />
      <SelloJusticia
        tono={esAlmirante ? 'dorado' : 'blanco'}
        tamano="lg"
        className="estado-justicia"
      />
    </div>
  );
}
