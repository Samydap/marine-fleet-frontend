export type VistaRecompensas = 'tabla' | 'tablon';

const CLAVE = 'marina.recompensas.vista';

/** Vista elegida la ultima vez en este navegador; 'tabla' si no hay o falla. */
export function leerVista(): VistaRecompensas {
  try {
    return localStorage.getItem(CLAVE) === 'tablon' ? 'tablon' : 'tabla';
  } catch {
    return 'tabla';
  }
}

export function guardarVista(vista: VistaRecompensas): void {
  try {
    localStorage.setItem(CLAVE, vista);
  } catch {
    // Sin almacenamiento (modo privado): la vista dura solo esta visita.
  }
}

const OPCIONES: readonly { valor: VistaRecompensas; etiqueta: string }[] = [
  { valor: 'tabla', etiqueta: 'Tabla' },
  { valor: 'tablon', etiqueta: 'Tablón' },
];

interface Props {
  readonly vista: VistaRecompensas;
  readonly onCambiar: (vista: VistaRecompensas) => void;
}

/** Interruptor Tabla | Tablón del historial de recompensas. */
export function SelectorVista({ vista, onCambiar }: Props): React.ReactElement {
  return (
    <div className="selector-vista" role="group" aria-label="Vista">
      {OPCIONES.map((o) => (
        <button
          key={o.valor}
          type="button"
          className="selector-vista-opcion"
          aria-pressed={vista === o.valor}
          onClick={() => onCambiar(o.valor)}
        >
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}
