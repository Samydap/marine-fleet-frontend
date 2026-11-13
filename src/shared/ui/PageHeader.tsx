import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconoAnterior } from './iconos';

interface Props {
  /** El h1 de la pantalla. Uno por pagina. */
  readonly titulo: string;
  /** Una frase que dice que se hace aqui. Sin copy de marketing. */
  readonly descripcion?: ReactNode;
  /** Linea de datos bajo el titulo: ActualizadoHace, insignias de estado. */
  readonly meta?: ReactNode;
  /** Enlace de regreso en pantallas de detalle: { a: '/operativos', etiqueta: 'Operativos' }. */
  readonly volver?: { readonly a: string; readonly etiqueta: string };
  /** Acciones de la pagina (BotonEnlace principal a la derecha; se apilan en movil). */
  readonly children?: ReactNode;
}

/**
 * Cabecera de pagina. Sin "kicker" (etiqueta en mayusculas encima del titulo):
 * esta prohibido por DISENO.md. El titulo habla solo.
 *
 *   <PageHeader titulo="Operativos" descripcion="Despliegues contra objetivos en curso."
 *     meta={<ActualizadoHace fecha={consultadoEn} prefijo="Consultado" />}>
 *     <BotonEnlace variante="principal" to="nuevo" icono={<IconoMas />}>Nuevo operativo</BotonEnlace>
 *   </PageHeader>
 */
export function PageHeader({
  titulo,
  descripcion,
  meta,
  volver,
  children,
}: Props): React.ReactElement {
  return (
    <header className="page-header">
      {volver && (
        <Link className="page-header-volver" to={volver.a}>
          <IconoAnterior tamano={16} />
          {volver.etiqueta}
        </Link>
      )}
      <div className="page-header-fila">
        <div className="page-header-texto">
          <h1>{titulo}</h1>
          {descripcion && <p className="page-header-descripcion">{descripcion}</p>}
          {meta && <div className="page-header-meta">{meta}</div>}
        </div>
        {children && <div className="page-header-acciones">{children}</div>}
      </div>
    </header>
  );
}
