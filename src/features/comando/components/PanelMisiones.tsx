import { useState } from 'react';
import { Settings } from 'lucide-react';
import { MISIONES_INICIALES, type Mision } from '../datos';
import { BOTON_BARRA } from './estilos';
import { Marco } from './Marco';
import { TarjetaMision } from './TarjetaMision';

/** Columna derecha: las misiones en curso de la flota. */
export function PanelMisiones({ className }: { className?: string }): React.ReactElement {
  const [misiones, setMisiones] = useState<readonly Mision[]>(MISIONES_INICIALES);

  const avanzar = (id: string): void => {
    setMisiones((lista) =>
      lista.map((m) => (m.id === id ? { ...m, progreso: Math.min(m.progreso + 1, m.total) } : m)),
    );
  };

  return (
    <Marco
      titulo="Misiones y operativos"
      subtitulo="Operativos en la Grand Line"
      className={className}
      acciones={
        <button
          type="button"
          aria-label="Reiniciar el avance de las misiones"
          title="Reiniciar el avance de las misiones"
          onClick={() => setMisiones(MISIONES_INICIALES)}
          className={BOTON_BARRA}
        >
          <Settings size={16} aria-hidden="true" />
        </button>
      }
    >
      <div className="grid min-h-full auto-rows-fr gap-2.5 pt-1">
        {misiones.map((mision) => (
          <TarjetaMision key={mision.id} mision={mision} onAvanzar={avanzar} />
        ))}
      </div>
    </Marco>
  );
}
