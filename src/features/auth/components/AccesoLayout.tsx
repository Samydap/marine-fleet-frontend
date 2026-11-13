import type { ReactNode } from 'react';
import '../acceso.css';
import { SelloMarina } from './SelloMarina';

interface Props {
  /** Hay una verificacion en curso: el sello lo indica girando su anillo. */
  readonly ocupado?: boolean;
  readonly children: ReactNode;
}

/**
 * Marco comun del login y del paso de MFA: panel institucional en navy a la
 * izquierda (franja superior en movil) y la superficie de trabajo a la derecha.
 */
export function AccesoLayout({ ocupado = false, children }: Props): React.ReactElement {
  return (
    <div className="acceso">
      <header className="acceso-insignia">
        <SelloMarina className="acceso-sello" girando={ocupado} />
        <div className="acceso-marca">
          <p className="acceso-institucion">Cuartel General de la Marina</p>
          <p className="acceso-sistema">
            Sistema de Gestión de Recompensas y Captura de Criminales
          </p>
        </div>
        <p className="acceso-mares">East Blue · West Blue · North Blue · South Blue · Grand Line</p>
      </header>

      <main className="acceso-panel">
        <div className="acceso-contenido">{children}</div>
        <p className="acceso-pie">
          Uso exclusivo del personal autorizado de la Marina. Los intentos de acceso fallidos quedan
          registrados en la cuenta.
        </p>
      </main>
    </div>
  );
}
