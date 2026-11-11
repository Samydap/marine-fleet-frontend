import type { ReactNode } from 'react';

interface Props {
  readonly titulo: string;
  readonly detalle?: string;
  readonly icono?: string;
  readonly children?: ReactNode;
}

export function EmptyState({ titulo, detalle, icono = '⌁', children }: Props): React.ReactElement {
  return (
    <div className="empty-state" role="status">
      <div className="empty-icon">{icono}</div>
      <strong>{titulo}</strong>
      {detalle && <p>{detalle}</p>}
      {children}
    </div>
  );
}
