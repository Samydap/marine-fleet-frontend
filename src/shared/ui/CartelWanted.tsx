import { useEffect, useState } from 'react';
import { urlArchivo } from '@core/http/api-url.interceptor';
import { formatearBerries } from '@shared/utils/berries';
import { etiquetaCategoria } from '@shared/utils/criminal';
import { formatearSoloFecha } from '@shared/utils/fecha';
import {
  cifraCartel,
  escalaAlias,
  escalaCifra,
  escalaNombre,
  type DatosCartel,
} from '@shared/utils/cartel';
import './cartel.css';

interface Props {
  readonly datos: DatosCartel;
  /** Numero y fecha de la version (el sello de emision del pie). */
  readonly version?: { readonly numero: number; readonly fecha: string } | null;
  /** `miniatura` en la galeria: sin texto legal y con el alias recortado. */
  readonly tamano?: 'completo' | 'miniatura';
  readonly className?: string;
}

const SELLO: Readonly<Record<'CAPTURADO' | 'MUERTO', string>> = {
  CAPTURADO: 'CAPTURADO',
  MUERTO: 'FALLECIDO',
};

/**
 * Cartel WANTED: la unica pieza del sistema con estetica de papel. Papel
 * envejecido, serifa display, foto enmarcada, "DEAD OR ALIVE" y la recompensa
 * en berries. Escala con su contenedor (unidades cqi), asi la misma pieza sirve
 * para la galeria, la vista de version y la impresion.
 *
 * Si el criminal ya no esta activo, lleva el sello de su estado.
 */
export function CartelWanted({
  datos,
  version,
  tamano = 'completo',
  className,
}: Props): React.ReactElement {
  const [fotoFallida, setFotoFallida] = useState(false);
  const foto = urlArchivo(datos.fotoUrl);
  const cifra = cifraCartel(datos.recompensa);
  const sello = datos.estado === 'ACTIVO' ? null : SELLO[datos.estado];
  const miniatura = tamano === 'miniatura';
  const aliasTexto =
    datos.alias.length === 0 ? '' : `«${miniatura ? datos.alias[0] : datos.alias.join('», «')}»`;

  useEffect(() => setFotoFallida(false), [foto]);

  const recompensaHablada =
    datos.recompensa === null ? 'sin recompensa' : formatearBerries(datos.recompensa);

  return (
    <article
      className={['cartel', `cartel--${tamano}`, className].filter(Boolean).join(' ')}
      aria-label={`Cartel de búsqueda de ${datos.nombre}, recompensa ${recompensaHablada}`}
    >
      <div className="cartel-papel">
        <p className="cartel-wanted" lang="en">
          WANTED
        </p>

        <div className="cartel-zona-foto">
          <div className="cartel-marco">
            {foto && !fotoFallida ? (
              <img
                className="cartel-foto"
                src={foto}
                alt={`Foto de ${datos.nombre}`}
                loading={miniatura ? 'lazy' : 'eager'}
                decoding="async"
                onError={() => setFotoFallida(true)}
              />
            ) : (
              <SiluetaSinFoto />
            )}
          </div>
          {sello && (
            <span className="cartel-sello" role="img" aria-label={`Sello: ${sello.toLowerCase()}`}>
              {sello}
            </span>
          )}
        </div>

        <p className="cartel-dead" lang="en">
          <span>DEAD</span> <span className="cartel-dead-or">OR</span> <span>ALIVE</span>
        </p>

        <h2 className={`cartel-nombre cartel-nombre--${escalaNombre(datos.nombre)}`}>
          {datos.nombre}
        </h2>

        {aliasTexto && (
          <p
            className={`cartel-alias cartel-alias--${escalaAlias(aliasTexto)}`}
            // En la miniatura se corta a dos lineas: el texto entero queda en el title.
            title={miniatura ? aliasTexto : undefined}
          >
            {aliasTexto}
          </p>
        )}

        <p
          className={[
            'cartel-recompensa',
            `cartel-recompensa--${escalaCifra(cifra)}`,
            datos.recompensa === null ? 'cartel-recompensa--sin' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {datos.recompensa !== null && (
            <span className="cartel-berry" aria-hidden="true">
              ฿
            </span>
          )}
          <span className="cifra">{cifra}</span>
        </p>

        {!miniatura && (
          <p className="cartel-afiliacion">
            {datos.organizacion
              ? `${etiquetaCategoria(datos.categoriaOrganizacion)} · ${datos.organizacion}`
              : 'Sin afiliación conocida'}
          </p>
        )}

        {!miniatura && datos.textoLegal && <p className="cartel-legal">{datos.textoLegal}</p>}

        <footer className="cartel-pie">
          <span className="cartel-marina">MARINA</span>
          {version && (
            <span className="cartel-emision">
              V{version.numero} · {formatearSoloFecha(version.fecha)}
            </span>
          )}
        </footer>
      </div>
    </article>
  );
}

/** Retrato vacio dibujado (original): busto en sombra sobre el papel. */
function SiluetaSinFoto(): React.ReactElement {
  return (
    <svg
      className="cartel-silueta"
      viewBox="0 0 120 120"
      role="img"
      aria-label="Sin foto en el archivo"
      preserveAspectRatio="xMidYMax slice"
    >
      <circle cx="60" cy="46" r="22" />
      <path d="M14 120c2-26 20-42 46-42s44 16 46 42z" />
    </svg>
  );
}
