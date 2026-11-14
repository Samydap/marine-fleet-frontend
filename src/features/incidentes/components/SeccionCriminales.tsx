import { useCriminal } from '@core/directorio/directorio-criminales';
import { Alerta } from '@shared/ui/Alerta';
import { Boton, BotonIcono } from '@shared/ui/Boton';
import { CampoSelect } from '@shared/ui/Campo';
import { SelectorCriminal } from '@shared/ui/SelectorCriminal';
import { IconoCerrar, IconoMas } from '@shared/ui/iconos';
import {
  LIMITES_INCIDENTE,
  opcionesDesenlace,
  opcionesRol,
  type DesenlaceParticipante,
  type ErroresIncidente,
  type FilaCriminal,
  type RolEnIncidente,
} from '../models/incidente';

interface Props {
  readonly filas: readonly FilaCriminal[];
  /** Con resultado final se pide el desenlace de cada uno. */
  readonly final: boolean;
  readonly errores: ErroresIncidente;
  readonly onCambiar: (indice: number, cambio: Partial<FilaCriminal>) => void;
  readonly onQuitar: (indice: number) => void;
  readonly onAgregar: () => void;
}

/** El criminal de una fila: buscador, o su ficha corta si ya esta elegido (o llego por enlace). */
function CriminalDeFila({
  indice,
  criminalId,
  error,
  onElegir,
}: {
  readonly indice: number;
  readonly criminalId: string;
  readonly error?: string;
  readonly onElegir: (id: string) => void;
}): React.ReactElement {
  const criminal = useCriminal(criminalId || null);
  return (
    <SelectorCriminal
      etiqueta={`Criminal ${indice + 1}`}
      obligatorio
      seleccionado={criminal ?? null}
      cargandoInicial={Boolean(criminalId) && criminal === undefined}
      onSeleccionar={(c) => onElegir(c?.id ?? '')}
      error={error}
    />
  );
}

/** Filas de criminales involucrados del formulario de registro. */
export function SeccionCriminales({
  filas,
  final,
  errores,
  onCambiar,
  onQuitar,
  onAgregar,
}: Props): React.ReactElement {
  return (
    <fieldset className="inc-seccion">
      <legend>Criminales involucrados</legend>
      {errores.criminales && (
        <Alerta tipo="error" titulo="Falta al menos un criminal">
          {errores.criminales}
        </Alerta>
      )}
      <ol className="inc-filas">
        {filas.map((c, i) => (
          <li
            key={c.clave}
            className={final ? 'inc-fila inc-fila--criminal-final' : 'inc-fila inc-fila--criminal'}
          >
            <CriminalDeFila
              indice={i}
              criminalId={c.criminalId}
              error={errores[`criminal-${i}`]}
              onElegir={(id) => onCambiar(i, { criminalId: id })}
            />
            <CampoSelect
              etiqueta="Rol"
              value={c.rolEnIncidente}
              opciones={opcionesRol()}
              onChange={(e) => onCambiar(i, { rolEnIncidente: e.target.value as RolEnIncidente })}
            />
            {final && (
              <CampoSelect
                etiqueta="Desenlace"
                value={c.desenlace}
                opciones={opcionesDesenlace()}
                onChange={(e) =>
                  onCambiar(i, { desenlace: e.target.value as DesenlaceParticipante })
                }
              />
            )}
            <BotonIcono
              className="inc-fila-quitar"
              etiqueta={`Quitar el criminal ${i + 1} de la lista`}
              icono={<IconoCerrar tamano={18} />}
              disabled={filas.length === 1}
              onClick={() => onQuitar(i)}
            />
          </li>
        ))}
      </ol>
      <div>
        <Boton
          variante="fantasma"
          icono={<IconoMas tamano={18} />}
          disabled={filas.length >= LIMITES_INCIDENTE.criminalesMax}
          onClick={() => onAgregar()}
        >
          Añadir criminal
        </Boton>
      </div>
    </fieldset>
  );
}
