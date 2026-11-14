import { useEffect, useId, useState } from 'react';
import { useValorDiferido } from '@shared/hooks/useValorDiferido';
import { CampoTexto } from '@shared/ui/Campo';
import { MontoBerries } from '@shared/ui/MontoBerries';
import { RetratoCriminal } from '@shared/ui/RetratoCriminal';
import { inteligenciaApi } from '../data-access/inteligencia-api';
import { MIN_BUSQUEDA_PUBLICA, type BuscadoPublico } from '../models/reporte';

type Estado =
  | { readonly tipo: 'inactivo' }
  | { readonly tipo: 'buscando' }
  | { readonly tipo: 'error' }
  | { readonly tipo: 'listo'; readonly resultados: readonly BuscadoPublico[] };

interface Props {
  readonly onElegir: (buscado: BuscadoPublico) => void;
  readonly error?: string;
}

/**
 * Buscador publico de /reportar (GET /buscados, sin sesion): quien reporta
 * escribe el nombre o un alias y elige al criminal entre los resultados, con
 * la foto y la recompensa del cartel para reconocerlo.
 */
export function BuscadorBuscados({ onElegir, error }: Props): React.ReactElement {
  const [texto, setTexto] = useState('');
  const [reintento, setReintento] = useState(0);
  const q = useValorDiferido(texto.trim(), 300);
  const [estado, setEstado] = useState<Estado>({ tipo: 'inactivo' });
  const idResultados = useId();

  useEffect(() => {
    if (q.length < MIN_BUSQUEDA_PUBLICA) {
      setEstado({ tipo: 'inactivo' });
      return;
    }
    let vigente = true;
    setEstado({ tipo: 'buscando' });
    inteligenciaApi.buscarBuscados(q).then(
      (resultados) => vigente && setEstado({ tipo: 'listo', resultados }),
      () => vigente && setEstado({ tipo: 'error' }),
    );
    // Si el texto cambia antes de que responda, esa respuesta ya no cuenta.
    return () => {
      vigente = false;
    };
  }, [q, reintento]);

  return (
    <div className="buscador-buscados">
      <CampoTexto
        etiqueta="Nombre o alias"
        type="search"
        name="criminalId"
        autoComplete="off"
        spellCheck={false}
        maxLength={80}
        placeholder="Ej.: Zoro, Cazador de Piratas"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        aria-controls={idResultados}
        error={error}
        ayuda="Escribe al menos 2 letras del nombre o de un alias que aparezca en el cartel."
      />

      <div id={idResultados} className="buscador-buscados-resultados" aria-live="polite">
        {estado.tipo === 'buscando' && <p className="buscador-buscados-nota">Buscando…</p>}
        {estado.tipo === 'error' && (
          <p className="buscador-buscados-nota">
            No se pudo consultar la lista de buscados.{' '}
            <button
              type="button"
              className="buscador-buscados-reintentar"
              onClick={() => setReintento((n) => n + 1)}
            >
              Reintentar
            </button>
          </p>
        )}
        {estado.tipo === 'listo' && estado.resultados.length === 0 && (
          <p className="buscador-buscados-nota">
            Nadie con ese nombre está entre los buscados. Prueba con un alias o con el código del
            cartel.
          </p>
        )}
        {estado.tipo === 'listo' && estado.resultados.length > 0 && (
          <ul className="buscador-buscados-lista" aria-label="Criminales buscados encontrados">
            {estado.resultados.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  className="buscador-buscados-opcion"
                  onClick={() => onElegir(b)}
                >
                  <FichaBuscado buscado={b} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Foto, nombre, alias y recompensa: lo que se ve en el cartel. */
export function FichaBuscado({
  buscado,
}: {
  readonly buscado: BuscadoPublico;
}): React.ReactElement {
  const detalle = [buscado.alias[0] && `«${buscado.alias[0]}»`, buscado.organizacion]
    .filter(Boolean)
    .join(' · ');
  return (
    <span className="ficha-buscado">
      <RetratoCriminal fotoUrl={buscado.fotoUrl} nombre={buscado.nombre} tamano="sm" />
      <span className="ficha-buscado-texto">
        <strong>{buscado.nombre}</strong>
        {detalle && <small>{detalle}</small>}
      </span>
      {buscado.recompensaVigenteMonto !== null && (
        <MontoBerries valor={buscado.recompensaVigenteMonto} abreviado />
      )}
    </span>
  );
}
