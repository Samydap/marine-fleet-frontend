import { useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SelloMarina } from '@core/layout/SelloMarina';
import { Boton } from '@shared/ui/Boton';
import { CampoAreaTexto, CampoTexto } from '@shared/ui/Campo';
import { IconoExito } from '@shared/ui/iconos';
import { valorFechaHoraLocal } from '@shared/utils/fecha';
import { inteligenciaApi } from '../data-access/inteligencia-api';
import { aIsoDesdeLocal } from '../models/avistamiento';
import {
  LIMITES_REPORTE,
  validarReporte,
  type ErroresReporte,
  type NuevoReporteCiudadano,
  type ReporteRecibido,
} from '../models/reporte';
import '../inteligencia.css';

const VACIO: NuevoReporteCiudadano = {
  criminalId: '',
  descripcion: '',
  ubicacion: '',
  fechaHecho: '',
  nombre: '',
  contacto: '',
  anonimo: false,
};

const opcional = (valor: string | undefined): string | undefined => valor?.trim() || undefined;

/**
 * RF-3 Formulario PUBLICO de reporte ciudadano (`/reportar`), fuera del shell y
 * sin sesion: POST /reportes-ciudadanos es @Public con limite de 5 por minuto
 * por IP. No usa nada que exija sesion (ni catalogos ni el archivo criminal).
 *
 * El criminal se identifica por su codigo: llega en `?criminal=<id>` desde el
 * enlace del cartel publicado, o lo escribe quien reporta (ver el bloqueo con
 * backend en el reporte de la feature: falta un buscador publico).
 */
export function ReporteCiudadanoPage(): React.ReactElement {
  const [parametros] = useSearchParams();
  const codigoEnlace = parametros.get('criminal')?.trim() ?? '';
  const [datos, setDatos] = useState<NuevoReporteCiudadano>({
    ...VACIO,
    criminalId: codigoEnlace,
  });
  const [editarCodigo, setEditarCodigo] = useState(codigoEnlace === '');
  const [errores, setErrores] = useState<ErroresReporte>({});
  const [enviando, setEnviando] = useState(false);
  const [recibido, setRecibido] = useState<ReporteRecibido | null>(null);
  const tituloExito = useRef<HTMLHeadingElement>(null);

  function cambiar<K extends keyof NuevoReporteCiudadano>(
    campo: K,
    valor: NuevoReporteCiudadano[K],
  ): void {
    setDatos((d) => ({ ...d, [campo]: valor }));
    if (campo in errores) setErrores((e) => ({ ...e, [campo]: undefined }));
  }

  async function enviar(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();
    const encontrados = validarReporte(datos);
    setErrores(encontrados);
    if (Object.values(encontrados).some(Boolean)) {
      if (encontrados.criminalId) setEditarCodigo(true);
      const primero = (['criminalId', 'descripcion', 'ubicacion'] as const).find(
        (c) => encontrados[c],
      );
      document.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus();
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await inteligenciaApi.enviarReporteCiudadano({
        criminalId: datos.criminalId.trim(),
        descripcion: datos.descripcion.trim(),
        ubicacion: datos.ubicacion.trim(),
        fechaHecho: datos.fechaHecho ? aIsoDesdeLocal(datos.fechaHecho) : undefined,
        nombre: datos.anonimo ? undefined : opcional(datos.nombre),
        contacto: datos.anonimo ? undefined : opcional(datos.contacto),
        anonimo: datos.anonimo,
      });
      setRecibido(respuesta);
      requestAnimationFrame(() => tituloExito.current?.focus());
    } catch {
      // El interceptor avisa el motivo (incluido el limite por minuto); lo escrito se conserva.
    } finally {
      setEnviando(false);
    }
  }

  function otroReporte(): void {
    setDatos({ ...VACIO, criminalId: codigoEnlace });
    setEditarCodigo(codigoEnlace === '');
    setErrores({});
    setRecibido(null);
  }

  return (
    <div className="denuncia">
      <header className="denuncia-franja">
        <SelloMarina simple className="denuncia-sello" />
        <p className="denuncia-marca">
          <strong>Marina</strong>
          <span>Línea de reportes ciudadanos</span>
        </p>
      </header>

      <main className="denuncia-contenido">
        {recibido ? (
          <section className="denuncia-panel denuncia-recibido" aria-labelledby="denuncia-exito">
            <span className="denuncia-recibido-icono">
              <IconoExito tamano={28} />
            </span>
            <h1 id="denuncia-exito" ref={tituloExito} tabIndex={-1}>
              Reporte recibido
            </h1>
            <p>{recibido.mensaje}</p>
            <p className="denuncia-folio">
              Número de reporte <span className="cifra">{recibido.id}</span>
            </p>
            <p className="denuncia-nota">
              Un oficial del centro de inteligencia lo revisará antes de actuar. No vas a recibir
              una respuesta automática.
            </p>
            <Boton onClick={otroReporte}>Enviar otro reporte</Boton>
          </section>
        ) : (
          <>
            <div className="denuncia-intro">
              <h1>Reportar a un criminal buscado</h1>
              <p>
                Si viste a alguien de un cartel WANTED de la Marina, avísanos. Un oficial revisará
                tu reporte antes de actuar. Puedes hacerlo sin dar tu nombre.
              </p>
            </div>

            <form className="denuncia-panel" noValidate onSubmit={enviar}>
              <fieldset className="denuncia-seccion">
                <legend>¿A quién viste?</legend>
                {editarCodigo ? (
                  <CampoTexto
                    etiqueta="Código del criminal"
                    className="denuncia-codigo-campo"
                    name="criminalId"
                    required
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={LIMITES_REPORTE.criminalId}
                    value={datos.criminalId}
                    onChange={(e) => cambiar('criminalId', e.target.value)}
                    error={errores.criminalId}
                    ayuda="Está impreso al pie del cartel, junto al código para escanear. Si no lo tienes, pídelo en la base naval más cercana."
                  />
                ) : (
                  <div className="denuncia-codigo">
                    <p>
                      Reportas sobre el criminal del cartel que escaneaste. No hace falta que
                      escribas su nombre.
                    </p>
                    <Boton
                      variante="fantasma"
                      tamano="compacto"
                      onClick={() => setEditarCodigo(true)}
                    >
                      Es otro cartel
                    </Boton>
                  </div>
                )}
              </fieldset>

              <fieldset className="denuncia-seccion">
                <legend>¿Qué viste?</legend>
                <CampoAreaTexto
                  etiqueta="Cuéntanos lo que viste"
                  name="descripcion"
                  required
                  rows={5}
                  minLength={LIMITES_REPORTE.descripcionMin}
                  maxLength={LIMITES_REPORTE.descripcionMax}
                  contador
                  placeholder="Qué hacía, con quién estaba, cómo iba vestido, hacia dónde se fue."
                  value={datos.descripcion}
                  onChange={(e) => cambiar('descripcion', e.target.value)}
                  error={errores.descripcion}
                />
                <div className="ui-form-grilla">
                  <CampoTexto
                    etiqueta="¿Dónde?"
                    name="ubicacion"
                    required
                    maxLength={LIMITES_REPORTE.ubicacionMax}
                    placeholder="Mercado del puerto de Loguetown"
                    value={datos.ubicacion}
                    onChange={(e) => cambiar('ubicacion', e.target.value)}
                    error={errores.ubicacion}
                  />
                  <CampoTexto
                    etiqueta="¿Cuándo?"
                    type="datetime-local"
                    max={valorFechaHoraLocal()}
                    value={datos.fechaHecho ?? ''}
                    onChange={(e) => cambiar('fechaHecho', e.target.value)}
                    ayuda="Opcional. Aproximado está bien."
                  />
                </div>
              </fieldset>

              <fieldset className="denuncia-seccion">
                <legend>¿Quién reporta?</legend>
                <label className="denuncia-anonimo">
                  <input
                    type="checkbox"
                    checked={datos.anonimo}
                    onChange={(e) => cambiar('anonimo', e.target.checked)}
                  />
                  <span>
                    <strong>Reportar de forma anónima</strong>
                    <small>La Marina no guardará tu nombre ni tu forma de contacto.</small>
                  </span>
                </label>
                {!datos.anonimo && (
                  <div className="ui-form-grilla">
                    <CampoTexto
                      etiqueta="Tu nombre"
                      autoComplete="name"
                      maxLength={LIMITES_REPORTE.nombre}
                      value={datos.nombre ?? ''}
                      onChange={(e) => cambiar('nombre', e.target.value)}
                      ayuda="Opcional."
                    />
                    <CampoTexto
                      etiqueta="Cómo contactarte"
                      maxLength={LIMITES_REPORTE.contacto}
                      placeholder="Den den mushi o dirección"
                      value={datos.contacto ?? ''}
                      onChange={(e) => cambiar('contacto', e.target.value)}
                      ayuda="Opcional. Solo si inteligencia necesita preguntarte algo."
                    />
                  </div>
                )}
              </fieldset>

              <div className="denuncia-acciones">
                <p>Revisa los datos: una vez enviado, el reporte no se puede corregir.</p>
                <Boton
                  variante="principal"
                  type="submit"
                  cargando={enviando}
                  textoCargando="Enviando…"
                >
                  Enviar reporte
                </Boton>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
