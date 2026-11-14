import { useEffect, useId, useState, type FormEvent } from 'react';
import { useCriminal } from '@core/directorio/directorio-criminales';
import { notificar } from '@core/services/notification.store';
import { Boton } from '@shared/ui/Boton';
import { CampoAreaTexto, CampoSelect, CampoTexto } from '@shared/ui/Campo';
import { Dialogo, DialogoConfirmacion } from '@shared/ui/Dialogo';
import { SelectorCriminal } from '@shared/ui/SelectorCriminal';
import { valorFechaHoraLocal } from '@shared/utils/fecha';
import { inteligenciaApi } from '../data-access/inteligencia-api';
import {
  aIsoDesdeLocal,
  aValorFechaHora,
  LIMITES_AVISTAMIENTO,
  validarAvistamiento,
  type Avistamiento,
  type AvistamientoPayload,
  type ErroresAvistamiento,
} from '../models/avistamiento';
import { OpcionesZona } from '@shared/ui/CampoZona';

interface Props {
  readonly abierto: boolean;
  /** null: registrar uno nuevo. Con valor: corregir ese avistamiento. */
  readonly avistamiento: Avistamiento | null;
  readonly onCerrar: () => void;
  readonly onGuardado: (avistamiento: Avistamiento, creado: boolean) => void;
  readonly onEliminado: (id: string) => void;
}

function inicial(a: Avistamiento | null): AvistamientoPayload {
  return a
    ? {
        criminalId: a.criminalId,
        fechaHora: aValorFechaHora(a.fechaHora),
        ubicacion: a.ubicacion,
        testigo: a.testigo ?? '',
        zonaInfluenciaId: a.zonaInfluenciaId ?? '',
        observaciones: a.observaciones ?? '',
      }
    : {
        criminalId: '',
        fechaHora: valorFechaHoraLocal(),
        ubicacion: '',
        testigo: '',
        zonaInfluenciaId: '',
        observaciones: '',
      };
}

const opcional = (valor: string | undefined): string | undefined => valor?.trim() || undefined;

/**
 * Registrar o corregir un avistamiento. Es un formulario corto que no necesita
 * pantalla propia: se abre sobre el archivo y, al guardar, la fila nueva queda
 * resaltada en la tabla.
 */
export function DialogoAvistamiento({
  abierto,
  avistamiento,
  onCerrar,
  onGuardado,
  onEliminado,
}: Props): React.ReactElement {
  const idFormulario = `form-avistamiento-${useId().replace(/:/g, '')}`;
  const [datos, setDatos] = useState<AvistamientoPayload>(() => inicial(avistamiento));
  const [errores, setErrores] = useState<ErroresAvistamiento>({});
  const [guardando, setGuardando] = useState(false);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);

  useEffect(() => {
    if (abierto) {
      setDatos(inicial(avistamiento));
      setErrores({});
    }
  }, [abierto, avistamiento]);

  const editando = avistamiento !== null;
  const criminalElegido = useCriminal(datos.criminalId || null);

  function cambiar<K extends keyof AvistamientoPayload>(
    campo: K,
    valor: AvistamientoPayload[K],
  ): void {
    setDatos((d) => ({ ...d, [campo]: valor }));
    if (campo in errores) setErrores((e) => ({ ...e, [campo]: undefined }));
  }

  async function guardar(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();
    const encontrados = validarAvistamiento(datos);
    setErrores(encontrados);
    if (Object.values(encontrados).some(Boolean)) return;

    const payload: AvistamientoPayload = {
      criminalId: datos.criminalId,
      fechaHora: aIsoDesdeLocal(datos.fechaHora),
      ubicacion: datos.ubicacion.trim(),
      testigo: opcional(datos.testigo),
      zonaInfluenciaId: opcional(datos.zonaInfluenciaId),
      observaciones: opcional(datos.observaciones),
    };

    setGuardando(true);
    try {
      const guardado = editando
        ? await inteligenciaApi.actualizarAvistamiento(avistamiento.id, payload)
        : await inteligenciaApi.crearAvistamiento(payload);
      notificar.exito(
        editando
          ? 'Avistamiento corregido.'
          : 'Avistamiento registrado. Queda por verificar en el centro de inteligencia.',
      );
      onGuardado(guardado, !editando);
    } catch {
      // El interceptor ya aviso el motivo; el formulario conserva lo escrito.
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(): Promise<void> {
    if (!avistamiento) return;
    await inteligenciaApi.eliminarAvistamiento(avistamiento.id);
    notificar.exito('Avistamiento eliminado del archivo.');
    setConfirmarBorrado(false);
    onEliminado(avistamiento.id);
  }

  return (
    <>
      <Dialogo
        abierto={abierto && !confirmarBorrado}
        onCerrar={onCerrar}
        bloqueado={guardando}
        ancho="amplio"
        titulo={editando ? 'Corregir avistamiento' : 'Registrar avistamiento'}
        descripcion={
          editando
            ? 'Solo se corrigen avistamientos sin verificar. Una vez verificado, es inteligencia oficial.'
            : 'Entra como "por verificar" hasta que el centro de inteligencia lo confirme.'
        }
        acciones={
          <>
            {editando && (
              <Boton
                variante="fantasma"
                className="intel-dialogo-eliminar"
                onClick={() => setConfirmarBorrado(true)}
                disabled={guardando}
              >
                Eliminar avistamiento
              </Boton>
            )}
            <Boton onClick={onCerrar} disabled={guardando}>
              Cancelar
            </Boton>
            <Boton
              variante="principal"
              type="submit"
              form={idFormulario}
              cargando={guardando}
              textoCargando="Guardando…"
            >
              {editando ? 'Guardar corrección' : 'Registrar avistamiento'}
            </Boton>
          </>
        }
      >
        <form id={idFormulario} className="ui-form-grilla" noValidate onSubmit={guardar}>
          <SelectorCriminal
            etiqueta="Criminal avistado"
            obligatorio
            seleccionado={criminalElegido ?? null}
            cargandoInicial={Boolean(datos.criminalId) && criminalElegido === undefined}
            onSeleccionar={(c) => cambiar('criminalId', c?.id ?? '')}
            error={errores.criminalId}
          />
          <CampoTexto
            etiqueta="Fecha y hora"
            type="datetime-local"
            required
            max={valorFechaHoraLocal()}
            value={datos.fechaHora}
            onChange={(e) => cambiar('fechaHora', e.target.value)}
            error={errores.fechaHora}
          />
          <CampoSelect
            etiqueta="Zona"
            opcionVacia="Sin zona precisa"
            value={datos.zonaInfluenciaId ?? ''}
            onChange={(e) => cambiar('zonaInfluenciaId', e.target.value)}
          >
            <OpcionesZona />
          </CampoSelect>
          <CampoTexto
            etiqueta="Lugar"
            required
            claseContenedor="ui-campo--ancho"
            maxLength={LIMITES_AVISTAMIENTO.ubicacionMax}
            placeholder="Puerto de Loguetown, muelle 3"
            value={datos.ubicacion}
            onChange={(e) => cambiar('ubicacion', e.target.value)}
            error={errores.ubicacion}
          />
          <CampoTexto
            etiqueta="Testigo"
            claseContenedor="ui-campo--ancho"
            maxLength={LIMITES_AVISTAMIENTO.testigo}
            placeholder="Patrulla de la Base 153"
            ayuda="Quién lo vio: una patrulla, un oficial o un informante."
            value={datos.testigo ?? ''}
            onChange={(e) => cambiar('testigo', e.target.value)}
          />
          <CampoAreaTexto
            etiqueta="Observaciones"
            claseContenedor="ui-campo--ancho"
            rows={3}
            maxLength={LIMITES_AVISTAMIENTO.observaciones}
            contador
            value={datos.observaciones ?? ''}
            onChange={(e) => cambiar('observaciones', e.target.value)}
          />
        </form>
      </Dialogo>

      <DialogoConfirmacion
        abierto={confirmarBorrado}
        onCerrar={() => setConfirmarBorrado(false)}
        onConfirmar={eliminar}
        peligroso
        titulo="¿Eliminar este avistamiento?"
        mensaje="Úsalo solo si se cargó por error. Si el avistamiento resultó falso, descártalo para que quede el rastro."
        textoConfirmar="Eliminar avistamiento"
        textoConfirmando="Eliminando…"
      />
    </>
  );
}
