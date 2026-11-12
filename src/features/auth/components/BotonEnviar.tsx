interface Props {
  readonly enviando: boolean;
  readonly texto: string;
  readonly textoEnviando: string;
}

/** Boton principal del acceso. Mientras envia se deshabilita y nombra la accion en curso. */
export function BotonEnviar({ enviando, texto, textoEnviando }: Props): React.ReactElement {
  return (
    <button className="acceso-enviar" type="submit" disabled={enviando}>
      {enviando && <span className="acceso-indicador" aria-hidden="true" />}
      {enviando ? textoEnviando : texto}
    </button>
  );
}
