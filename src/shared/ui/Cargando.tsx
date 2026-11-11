interface Props {
  readonly mensaje?: string;
}

/** Fallback de los Suspense de cada ruta lazy. */
export function Cargando({ mensaje = 'Cargando…' }: Props): React.ReactElement {
  return (
    <div className="empty-state">
      <div className="loader" />
      <strong>{mensaje}</strong>
    </div>
  );
}
