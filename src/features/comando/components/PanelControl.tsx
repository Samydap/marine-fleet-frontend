import { useState } from 'react';
import { Layers, Move, Settings } from 'lucide-react';
import { BOTON_BARRA } from './estilos';
import { MapaTactico } from './MapaTactico';
import { Marco } from './Marco';

/** Panel de control: la carta de la Grand Line con radar, naves y lecturas. */
export function PanelControl({ className }: { className?: string }): React.ReactElement {
  const [barrido, setBarrido] = useState(true);
  const [rutas, setRutas] = useState(true);

  return (
    <Marco
      titulo="Panel de control"
      icono={Move}
      className={className}
      cuerpoClassName="overflow-hidden"
      acciones={
        <>
          <button
            type="button"
            aria-pressed={!rutas}
            aria-label="Ocultar las rutas navales"
            title="Ocultar las rutas navales"
            onClick={() => setRutas(!rutas)}
            className={BOTON_BARRA}
          >
            <Layers size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-pressed={!barrido}
            aria-label="Pausar el barrido del radar"
            title="Pausar el barrido del radar"
            onClick={() => setBarrido(!barrido)}
            className={BOTON_BARRA}
          >
            <Settings size={16} aria-hidden="true" />
          </button>
        </>
      }
    >
      <MapaTactico barrido={barrido} rutas={rutas} />
    </Marco>
  );
}
