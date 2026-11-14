import { useId, useState } from 'react';
import type { ArchivoDescargado } from '@core/http/api-client';
import { notificar } from '@core/services/notification.store';
import { guardarArchivo } from '../utils/archivo';
import { Boton } from './Boton';
import { IconoDescargar } from './iconos';

export type FormatoExportacion = 'pdf' | 'csv';

interface Props {
  readonly exportar: (formato: FormatoExportacion) => Promise<ArchivoDescargado>;
  /**
   * Por que no se puede exportar ahora ("No hay datos que exportar", "La
   * consulta fallo: reintenta antes de exportar"). Con texto, los botones se
   * deshabilitan y lo explican (title y descripcion accesible).
   */
  readonly motivoDeshabilitado?: string | null;
}

/**
 * El motivo para no exportar, o null si se puede. Una consulta fallida o una
 * pantalla vacia no se exportan: el archivo diria algo que la pantalla no.
 */
export function motivoSinExportar({
  error,
  cargado,
  vacio,
}: {
  readonly error?: unknown;
  readonly cargado: boolean;
  readonly vacio?: boolean;
}): string | null {
  if (error) return 'La consulta falló. Reintenta antes de exportar.';
  if (!cargado) return 'Espera a que terminen de cargar los datos.';
  if (vacio) return 'No hay datos que exportar en esta consulta.';
  return null;
}

/**
 * "Exportar PDF" y "Exportar CSV": el backend arma el archivo, aqui solo se
 * guarda. Nunca se exporta una pantalla vacia o una consulta que fallo.
 *
 *   <BotonesExportar exportar={(f) => api.exportar(f)}
 *     motivoDeshabilitado={!datos ? 'No hay datos que exportar.' : null} />
 */
export function BotonesExportar({ exportar, motivoDeshabilitado }: Props): React.ReactElement {
  const [enCurso, setEnCurso] = useState<FormatoExportacion | null>(null);
  const idMotivo = `exportar-motivo-${useId().replace(/:/g, '')}`;
  const deshabilitado = Boolean(motivoDeshabilitado);

  async function descargar(formato: FormatoExportacion): Promise<void> {
    setEnCurso(formato);
    try {
      const archivo = await exportar(formato);
      guardarArchivo(archivo.blob, archivo.nombre);
      notificar.exito(`Archivo descargado: ${archivo.nombre}`);
    } catch {
      // El interceptor ya publico el error.
    } finally {
      setEnCurso(null);
    }
  }

  return (
    <>
      {(['pdf', 'csv'] as const).map((formato) => (
        <Boton
          key={formato}
          icono={<IconoDescargar tamano={18} />}
          cargando={enCurso === formato}
          textoCargando="Exportando…"
          disabled={deshabilitado || (enCurso !== null && enCurso !== formato)}
          title={motivoDeshabilitado ?? undefined}
          aria-describedby={deshabilitado ? idMotivo : undefined}
          onClick={() => void descargar(formato)}
        >
          Exportar {formato.toUpperCase()}
        </Boton>
      ))}
      {deshabilitado && (
        <span id={idMotivo} className="sr-only">
          {motivoDeshabilitado}
        </span>
      )}
    </>
  );
}
