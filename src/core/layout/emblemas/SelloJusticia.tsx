interface Props {
  /**
   * `blanco` para todos los cargos; `dorado` solo para el Almirante (regla del
   * galon: el dorado es del rango, no decoracion). Quien lo usa decide el tono.
   */
  readonly tono: 'blanco' | 'dorado';
  /** `md` en la cabecera de pagina; `lg` en el acceso y en pantallas de aviso. */
  readonly tamano?: 'md' | 'lg';
  readonly className?: string;
}

/**
 * Sello 正義 (Justicia): los dos kanji a pincel, en columna, dentro de un sello
 * cuadrado con trazo, como el que lleva la capa de los oficiales.
 *
 * Decorativo: el titulo de la pantalla ya nombra lo que hay, asi que el sello
 * no aporta texto al lector de pantalla. Estilos en shared/ui/ui.css (global),
 * porque lo pintan la cabecera, el acceso y la pantalla de acceso denegado.
 */
export function SelloJusticia({ tono, tamano = 'md', className }: Props): React.ReactElement {
  return (
    <span
      className={['sello-justicia', className ?? ''].join(' ').trim()}
      data-tono={tono}
      data-tamano={tamano}
      aria-hidden="true"
    >
      <span className="sello-justicia-kanji" lang="ja">
        正義
      </span>
    </span>
  );
}
