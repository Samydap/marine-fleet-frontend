import { useState, type KeyboardEvent } from 'react';
import { Boton, BotonIcono } from '@shared/ui/Boton';
import { Campo } from '@shared/ui/Campo';
import { IconoCerrar, IconoMas } from '@shared/ui/iconos';
import { LIMITES, normalizarAlias } from '../utils/borrador-criminal';

interface Props {
  readonly valor: readonly string[];
  readonly onChange: (alias: string[]) => void;
  readonly error?: string;
  readonly disabled?: boolean;
}

/**
 * Lista de alias: se escribe uno y se agrega con Enter o con el boton. Cada
 * alias queda como una ficha con su boton de quitar (con nombre accesible).
 */
export function CampoAlias({ valor, onChange, error, disabled }: Props): React.ReactElement {
  const [texto, setTexto] = useState('');
  const lleno = valor.length >= LIMITES.aliasMax;

  function agregar(): void {
    const siguiente = normalizarAlias([...valor, texto]);
    if (siguiente.length !== valor.length) onChange(siguiente);
    setTexto('');
  }

  function alPulsar(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (texto.trim()) agregar();
    }
  }

  return (
    <Campo
      etiqueta="Alias"
      ayuda={`Apodos conocidos. Pulsa Enter para agregar cada uno (hasta ${LIMITES.aliasMax}).`}
      error={error}
      claseContenedor="ui-campo--ancho"
    >
      {({ id, describedBy, invalido }) => (
        <div className="alias-campo">
          {valor.length > 0 && (
            <ul className="alias-lista" aria-label="Alias agregados">
              {valor.map((a) => (
                <li key={a} className="alias-ficha">
                  <span>{a}</span>
                  <BotonIcono
                    etiqueta={`Quitar el alias ${a}`}
                    icono={<IconoCerrar tamano={14} />}
                    tamano="compacto"
                    disabled={disabled}
                    onClick={() => onChange(valor.filter((x) => x !== a))}
                  />
                </li>
              ))}
            </ul>
          )}
          <div className="alias-entrada">
            <input
              id={id}
              className="ui-control"
              value={texto}
              maxLength={LIMITES.aliasLargo}
              placeholder={lleno ? 'Límite de alias alcanzado' : 'Ej.: Sombrero de Paja'}
              disabled={disabled || lleno}
              aria-invalid={invalido || undefined}
              aria-describedby={describedBy}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={alPulsar}
            />
            <Boton
              icono={<IconoMas tamano={18} />}
              disabled={disabled || lleno || !texto.trim()}
              onClick={agregar}
            >
              Agregar
            </Boton>
          </div>
        </div>
      )}
    </Campo>
  );
}
