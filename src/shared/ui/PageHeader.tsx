import type { ReactNode } from 'react';

interface Props {
  readonly titulo: string;
  readonly descripcion?: string;
  readonly kicker?: string;
  readonly children?: ReactNode;
}

export function PageHeader({ titulo, descripcion, kicker, children }: Props): React.ReactElement {
  return (
    <header className="page-header">
      <div>
        {kicker && <span className="section-kicker">{kicker}</span>}
        <h1>{titulo}</h1>
        {descripcion && <p>{descripcion}</p>}
      </div>
      {children && <div className="page-header-actions">{children}</div>}
    </header>
  );
}
