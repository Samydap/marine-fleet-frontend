import { BarraSuperior } from '../components/BarraSuperior';
import { BusterCall } from '../components/BusterCall';
import { DenDenMushi } from '../components/DenDenMushi';
import { PanelCarteles } from '../components/PanelCarteles';
import { PanelControl } from '../components/PanelControl';
import { PanelMapas } from '../components/PanelMapas';
import { PanelMisiones } from '../components/PanelMisiones';

/**
 * Centro de Comando "Marine Fleet & Bounty HQ".
 *
 * Tablero a pantalla completa en tres columnas:
 *   - izquierda: panel de control (carta naval) y, debajo, Den Den Mushi y mapas;
 *   - centro: carteles de busqueda;
 *   - derecha: misiones y, debajo, la Buster Call.
 * En escritorio ocupa el alto de la ventana y los paneles largos se desplazan
 * por dentro; por debajo de `xl` las columnas se apilan.
 *
 * Esta hecho con Tailwind (ver src/tailwind.css). Los datos son de muestra
 * (../datos.ts) y las imagenes se toman de src/assets/comando/.
 */
export function CentroComandoPage(): React.ReactElement {
  return (
    <div className="relative flex min-h-screen flex-col bg-hq-abismo text-cyan-50 xl:h-screen xl:overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,210,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,210,255,0.06)_1px,transparent_1px)] bg-[size:36px_36px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,64,175,0.4),transparent_62%)]"
      />

      <BarraSuperior />

      <main className="relative grid min-h-0 flex-1 gap-3 p-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1.25fr)_minmax(300px,1fr)]">
        <div className="grid min-h-0 gap-3 xl:grid-rows-[minmax(0,1fr)_auto]">
          <PanelControl />
          <div className="grid gap-3 sm:grid-cols-[1.25fr_1fr]">
            <DenDenMushi />
            <PanelMapas />
          </div>
        </div>

        <PanelCarteles />

        <div className="grid min-h-0 gap-3 xl:grid-rows-[minmax(0,1fr)_auto]">
          <PanelMisiones />
          <BusterCall />
        </div>
      </main>
    </div>
  );
}
