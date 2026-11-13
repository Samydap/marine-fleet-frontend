import { useState } from 'react';
import { urlArchivo } from '@core/http/api-url.interceptor';

interface Props {
  /** `fotoUrl` del criminal (servida por /api/v1/archivos/fotos/..., publica). */
  readonly fotoUrl: string | null | undefined;
  readonly nombre: string;
  /** sm 32px (tablas), md 48px (listas y cabeceras), lg 96px, xl 160px (columna de la ficha). */
  readonly tamano?: 'sm' | 'md' | 'lg' | 'xl';
}

function iniciales(nombre: string): string {
  const partes = nombre
    .replace(/[^\p{L}\s]/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (partes.length === 0) return '?';
  const primera = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? '') : '';
  return (primera + ultima).toUpperCase();
}

/**
 * Foto de un criminal fuera del cartel: recorte cuadrado con borde fino, como
 * la foto de un expediente. Sin foto (o si no carga), las iniciales sobre
 * fondo neutro. El nombre siempre va en el texto vecino; aqui es el `alt`.
 *
 *   <RetratoCriminal fotoUrl={c.fotoUrl} nombre={c.nombre} tamano="sm" />
 */
export function RetratoCriminal({ fotoUrl, nombre, tamano = 'md' }: Props): React.ReactElement {
  const [fallo, setFallo] = useState(false);
  const clase = `retrato retrato--${tamano}`;
  const src = urlArchivo(fotoUrl);

  if (!src || fallo) {
    return (
      <span className={`${clase} retrato--sin-foto`} role="img" aria-label={`${nombre}, sin foto`}>
        <span aria-hidden="true">{iniciales(nombre)}</span>
      </span>
    );
  }

  return (
    <img
      className={clase}
      src={src}
      alt={`Foto de ${nombre}`}
      loading="lazy"
      decoding="async"
      onError={() => setFallo(true)}
    />
  );
}
