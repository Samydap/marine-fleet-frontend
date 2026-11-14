import { useState } from 'react';
import { Settings } from 'lucide-react';
import { CARTELES_INICIALES, type CartelBuscado } from '../datos';
import { CartelBusqueda } from './CartelBusqueda';
import { BOTON_BARRA } from './estilos';
import { Marco } from './Marco';

/** Columna central: el tablon de carteles de busqueda, de tres en fondo. */
export function PanelCarteles({ className }: { className?: string }): React.ReactElement {
  const [carteles, setCarteles] = useState<readonly CartelBuscado[]>(CARTELES_INICIALES);
  const [soloBuscados, setSoloBuscados] = useState(false);

  const alternar = (id: string, campo: 'capturado' | 'prioritario'): void => {
    setCarteles((lista) => lista.map((c) => (c.id === id ? { ...c, [campo]: !c[campo] } : c)));
  };

  const buscados = carteles.filter((c) => !c.capturado);
  const visibles = soloBuscados ? buscados : carteles;
  const capturados = carteles.length - buscados.length;

  return (
    <Marco
      titulo="Carteles de se busca"
      subtitulo={`${buscados.length} en busca, ${capturados} capturados`}
      className={className}
      acciones={
        <button
          type="button"
          aria-pressed={soloBuscados}
          aria-label="Ocultar los capturados"
          title="Ocultar los capturados"
          onClick={() => setSoloBuscados(!soloBuscados)}
          className={BOTON_BARRA}
        >
          <Settings size={16} aria-hidden="true" />
        </button>
      }
    >
      {visibles.length === 0 ? (
        <p className="m-0 rounded-lg border border-dashed border-hq-neon/40 p-6 text-center text-sm text-cyan-200">
          No queda ningún pirata en busca. Vuelve a mostrar los capturados con el botón de ajustes.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-2.5 gap-y-3 pt-1 sm:grid-cols-3">
          {visibles.map((cartel) => (
            <CartelBusqueda
              key={cartel.id}
              cartel={cartel}
              onCapturar={(id) => alternar(id, 'capturado')}
              onPriorizar={(id) => alternar(id, 'prioritario')}
            />
          ))}
        </div>
      )}
    </Marco>
  );
}
