import type { ReactNode } from 'react';
import '../acceso.css';
import { EmblemaGaviota } from '@core/layout/emblemas/EmblemaGaviota';
import { SelloJusticia } from '@core/layout/emblemas/SelloJusticia';
import { SiluetaMarineford } from '@core/layout/emblemas/SiluetaMarineford';
import { SelloMarina } from '@core/layout/SelloMarina';

const MARES = ['East Blue', 'West Blue', 'North Blue', 'South Blue', 'Grand Line'] as const;

interface Props {
  /** Hay una verificacion en curso: el sello del pie lo indica girando su anillo. */
  readonly ocupado?: boolean;
  readonly children: ReactNode;
}

/**
 * Marco comun del login y del paso de MFA. Dos zonas:
 *  - Panel institucional (franja superior en movil): la gaviota y el 正義 sobre
 *    el cielo nocturno, la fortaleza de Marineford a contraluz y, al pie, el
 *    sello de la rosa y el ancla sobre el mar.
 *  - Superficie de trabajo: el formulario en una hoja de papel oficial sobre
 *    el lienzo.
 *
 * Todavia no hay sesion, asi que el 正義 va en blanco (el dorado es del rango).
 */
export function AccesoLayout({ ocupado = false, children }: Props): React.ReactElement {
  return (
    <div className="acceso">
      <header className="acceso-insignia">
        <div className="acceso-cabeza">
          <div className="acceso-emblemas">
            <EmblemaGaviota variante="linea" tamano={72} className="acceso-gaviota" />
            <SelloJusticia tono="blanco" tamano="lg" className="acceso-justicia" />
          </div>
          <div className="acceso-marca">
            <p className="acceso-institucion">Cuartel General de la Marina</p>
            <p className="acceso-sistema">
              Sistema de Gestión de Recompensas y Captura de Criminales
            </p>
          </div>
        </div>

        <SiluetaMarineford className="acceso-silueta" />

        <div className="acceso-insignia-pie">
          <SelloMarina className="acceso-sello" girando={ocupado} />
          <p className="acceso-mares">
            {MARES.map((mar, i) => (
              <span key={mar}>
                {i > 0 && ' · '}
                <span className="acceso-mar">{mar}</span>
              </span>
            ))}
          </p>
        </div>
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
