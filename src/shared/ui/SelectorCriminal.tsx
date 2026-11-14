import { useEffect, useId, useState } from 'react';
import { buscarCriminales, type CriminalBreve } from '@core/directorio/directorio-criminales';
import { useValorDiferido } from '@shared/hooks/useValorDiferido';
import { etiquetaEstadoCriminal, tonoEstadoCriminal } from '@shared/utils/criminal';
import { BadgeAmenaza } from './BadgeAmenaza';
import { Boton } from './Boton';
import { CampoTexto } from './Campo';
import { Skeleton } from './Estados';
import { IconoAlerta } from './iconos';
import { InsigniaEstado } from './InsigniaEstado';
import { InsigniaTipoCriminal } from './InsigniaTipoCriminal';
import { MontoBerries } from './MontoBerries';
import { RetratoCriminal } from './RetratoCriminal';
import { TextoRecortado } from './TextoRecortado';

export type { CriminalBreve } from '@core/directorio/directorio-criminales';

interface Props {
  /** Nombre del campo: "Criminal objetivo", "Criminal avistado". */
  readonly etiqueta: string;
  readonly seleccionado: CriminalBreve | null;
  readonly onSeleccionar: (criminal: CriminalBreve | null) => void;
  /** Solo los que siguen en busqueda (los capturados o muertos no pueden ser objetivo). */
  readonly soloActivos?: boolean;
  readonly obligatorio?: boolean;
  readonly error?: string;
  /** Mientras se lee el criminal que llego por la URL (`?criminal=`). */
  readonly cargandoInicial?: boolean;
  /** Lo que se cambia al elegirlo ("Recompensa vigente"), bajo las insignias. */
  readonly montoEtiqueta?: string;
  /** Dorado en el monto vigente (regla del galon: recompensas de alto rango). */
  readonly montoAltoRango?: (monto: number | null) => boolean;
  /** Si es false, el elegido no se puede cambiar (llego fijado por el flujo). */
  readonly cambiable?: boolean;
}

type EstadoBusqueda = 'buscando' | 'listo' | 'error';

/**
 * Elegir un criminal: buscador por nombre o alias contra el archivo criminal
 * y, una vez elegido, su ficha corta (tipo, estado, amenaza y recompensa).
 * Lo encontrado alimenta el directorio de core/, asi que la tabla que luego
 * lo muestre no lo vuelve a pedir.
 *
 *   <SelectorCriminal etiqueta="Criminal objetivo" soloActivos obligatorio
 *     seleccionado={objetivo} onSeleccionar={setObjetivo} error={errores.objetivo} />
 */
export function SelectorCriminal({
  etiqueta,
  seleccionado,
  onSeleccionar,
  soloActivos = false,
  obligatorio = false,
  error,
  cargandoInicial = false,
  montoEtiqueta = 'Recompensa vigente',
  montoAltoRango,
  cambiable = true,
}: Props): React.ReactElement {
  const [texto, setTexto] = useState('');
  const q = useValorDiferido(texto.trim(), 350);
  const [resultados, setResultados] = useState<readonly CriminalBreve[]>([]);
  const [estado, setEstado] = useState<EstadoBusqueda>('buscando');
  const base = `selector-criminal-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    if (seleccionado || cargandoInicial) return;
    let vigente = true;
    setEstado('buscando');
    buscarCriminales(q, { soloActivos })
      .then((lista) => {
        if (!vigente) return;
        setResultados(lista);
        setEstado('listo');
      })
      .catch(() => {
        if (vigente) setEstado('error');
      });
    return () => {
      vigente = false;
    };
  }, [q, seleccionado, soloActivos, cargandoInicial]);

  if (cargandoInicial) {
    return (
      <div className="selector-criminal-elegido" aria-busy="true">
        <Skeleton forma="bloque" ancho={48} alto={48} />
        <div className="selector-criminal-datos">
          <Skeleton ancho="12rem" />
          <Skeleton ancho="8rem" />
        </div>
        <span className="sr-only">Cargando criminal</span>
      </div>
    );
  }

  if (seleccionado) {
    const monto = seleccionado.recompensaVigenteMonto;
    return (
      <div className="ui-campo ui-campo--ancho">
        <span className="ui-campo-etiqueta" id={`${base}-etiqueta`}>
          {etiqueta}
        </span>
        <div
          className="selector-criminal-elegido"
          role="group"
          aria-labelledby={`${base}-etiqueta`}
        >
          <RetratoCriminal
            fotoUrl={seleccionado.fotoUrl}
            nombre={seleccionado.nombre}
            tamano="md"
          />
          <div className="selector-criminal-datos">
            <p className="selector-criminal-nombre">{seleccionado.nombre}</p>
            {seleccionado.alias.length > 0 && (
              <TextoRecortado
                como="small"
                className="selector-criminal-alias"
                texto={`«${seleccionado.alias.join('», «')}»`}
              />
            )}
            <div className="selector-criminal-insignias">
              <InsigniaTipoCriminal categoria={seleccionado.organizacion?.categoria ?? null} />
              <InsigniaEstado
                etiqueta={etiquetaEstadoCriminal(seleccionado.estado)}
                tono={tonoEstadoCriminal(seleccionado.estado)}
              />
              <BadgeAmenaza nivel={seleccionado.nivelAmenaza} conPrefijo />
            </div>
            <p className="selector-criminal-vigente">
              {montoEtiqueta}:{' '}
              <MontoBerries valor={monto} altoRango={montoAltoRango?.(monto) ?? false} />
            </p>
            {error && (
              <p className="ui-campo-error" role="alert">
                <IconoAlerta tamano={16} />
                {error}
              </p>
            )}
          </div>
          {cambiable && (
            <Boton tamano="compacto" variante="fantasma" onClick={() => onSeleccionar(null)}>
              Cambiar
            </Boton>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="selector-criminal ui-campo--ancho">
      <CampoTexto
        etiqueta={etiqueta}
        type="search"
        required={obligatorio}
        autoComplete="off"
        placeholder="Buscar por nombre o alias"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        aria-controls={`${base}-resultados`}
        ayuda={soloActivos ? 'Solo aparecen los que siguen en búsqueda.' : 'Elige uno de la lista.'}
        error={error}
      />
      <div
        id={`${base}-resultados`}
        className="selector-criminal-resultados"
        aria-live="polite"
        aria-busy={estado === 'buscando' || undefined}
      >
        {estado === 'buscando' && resultados.length === 0 ? (
          <div className="selector-criminal-cargando">
            <Skeleton ancho="70%" />
            <Skeleton ancho="55%" />
            <span className="sr-only">Buscando en el archivo criminal</span>
          </div>
        ) : estado === 'error' ? (
          <p className="selector-criminal-nota">
            No se pudo consultar el archivo criminal. Vuelve a escribir para reintentar.
          </p>
        ) : resultados.length === 0 ? (
          <p className="selector-criminal-nota">
            {q ? `Ningún criminal coincide con «${q}».` : 'El archivo criminal está vacío.'}
            {soloActivos && ' Los capturados o fallecidos no aparecen.'}
          </p>
        ) : (
          <ul
            className={`selector-criminal-lista${estado === 'buscando' ? ' selector-criminal-lista--actualizando' : ''}`}
            aria-label="Criminales encontrados"
          >
            {resultados.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="selector-criminal-opcion"
                  onClick={() => {
                    onSeleccionar(c);
                    setTexto('');
                  }}
                >
                  <RetratoCriminal fotoUrl={c.fotoUrl} nombre={c.nombre} tamano="sm" />
                  <span className="selector-criminal-opcion-texto">
                    <TextoRecortado como="strong" texto={c.nombre} />
                    <TextoRecortado
                      como="small"
                      texto={[
                        etiquetaEstadoCriminal(c.estado),
                        c.alias.length > 0 ? `«${c.alias.join('», «')}»` : '',
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    />
                  </span>
                  <span className="selector-criminal-opcion-datos">
                    <InsigniaTipoCriminal
                      categoria={c.organizacion?.categoria ?? null}
                      variante="icono"
                    />
                    <BadgeAmenaza nivel={c.nivelAmenaza} />
                    <MontoBerries valor={c.recompensaVigenteMonto} abreviado />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
