import { useRef, useState, type ChangeEvent } from 'react';
import { Boton } from '@shared/ui/Boton';
import { Campo } from '@shared/ui/Campo';
import { RetratoCriminal } from '@shared/ui/RetratoCriminal';
import { leerComoDataUrl, validarFoto } from '@shared/utils/archivo';

export interface FotoElegida {
  readonly mime: string;
  readonly dataUrl: string;
  readonly nombreArchivo: string;
}

interface Props {
  /** Foto actual del registro (en edicion). */
  readonly fotoActual: string | null;
  readonly nombre: string;
  readonly elegida: FotoElegida | null;
  readonly onElegir: (foto: FotoElegida | null) => void;
  readonly disabled?: boolean;
}

/**
 * Foto del criminal: vista previa de expediente + "Elegir foto". Se valida en
 * el navegador (tipo y 2 MB) antes de enviarla; el cartel la toma al
 * regenerarse.
 */
export function CampoFoto({
  fotoActual,
  nombre,
  elegida,
  onElegir,
  disabled,
}: Props): React.ReactElement {
  const entrada = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function alElegir(e: ChangeEvent<HTMLInputElement>): Promise<void> {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;
    const problema = validarFoto(archivo);
    setError(problema);
    if (problema) return;
    try {
      const dataUrl = await leerComoDataUrl(archivo);
      onElegir({ mime: archivo.type, dataUrl, nombreArchivo: archivo.name });
    } catch {
      setError('No se pudo leer la imagen. Prueba con otro archivo.');
    }
  }

  return (
    <Campo
      etiqueta="Foto"
      ayuda="JPG, PNG o WEBP de hasta 2 MB. Es la que se imprime en el cartel."
      error={error}
      claseContenedor="ui-campo--ancho"
    >
      {({ id, describedBy }) => (
        <div className="foto-campo">
          <RetratoCriminal
            fotoUrl={elegida?.dataUrl ?? fotoActual}
            nombre={nombre.trim() || 'Nuevo registro'}
            tamano="lg"
          />
          <div className="foto-campo-acciones">
            <input
              ref={entrada}
              id={id}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              aria-describedby={describedBy}
              disabled={disabled}
              onChange={(e) => void alElegir(e)}
            />
            <Boton disabled={disabled} onClick={() => entrada.current?.click()}>
              {fotoActual || elegida ? 'Cambiar foto' : 'Elegir foto'}
            </Boton>
            {elegida && (
              <>
                <span className="foto-campo-nombre" title={elegida.nombreArchivo}>
                  {elegida.nombreArchivo}
                </span>
                <Boton variante="fantasma" disabled={disabled} onClick={() => onElegir(null)}>
                  Descartar
                </Boton>
              </>
            )}
          </div>
        </div>
      )}
    </Campo>
  );
}
