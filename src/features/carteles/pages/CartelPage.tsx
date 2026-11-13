import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '@core/models/api-response';
import { notificar } from '@core/services/notification.store';
import { Permiso } from '@core/session/permiso.enum';
import { EVENTOS, type CartelGeneradoDatos } from '@core/sync/eventos';
import { useCambiosSincronizados } from '@core/sync/sincronizacion';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { Alerta } from '@shared/ui/Alerta';
import { Boton, BotonEnlace } from '@shared/ui/Boton';
import { EstadoError, EstadoVacio, Skeleton } from '@shared/ui/Estados';
import { IconoDescargar, IconoImprimir, IconoRecargar } from '@shared/ui/iconos';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { PageHeader } from '@shared/ui/PageHeader';
import { CartelWanted } from '@shared/ui/CartelWanted';
import { guardarArchivo } from '@shared/utils/archivo';
import { leerInstantanea } from '@shared/utils/cartel';
import { aIso, formatearFecha } from '@shared/utils/fecha';
import { cartelesApi } from '../data-access/carteles-api';
import type { Cartel, FormatoCartel } from '../models/cartel';
import { etiquetaMotivo, nombreArchivo } from '../utils/instantanea';
import '../carteles.css';

const CLASE_IMPRESION = 'imprimiendo-cartel';

/**
 * RF-2 un cartel: la version oficial (instantanea congelada), su historial de
 * versiones, descarga en PDF o imagen (SVG) e impresion. Si otra base cambia
 * al criminal, la version nueva llega sola.
 */
export function CartelPage(): React.ReactElement {
  const { criminalId = '' } = useParams<{ criminalId: string }>();
  const puedeGenerar = useHasPermission(Permiso.CARTELES_GENERAR);

  const [versiones, setVersiones] = useState<Cartel[]>([]);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [descargando, setDescargando] = useState<FormatoCartel | null>(null);
  const [generando, setGenerando] = useState(false);

  const cargar = useCallback(
    async (silencioso = false): Promise<Cartel[]> => {
      setCargando(true);
      try {
        const lista = await cartelesApi.versiones(criminalId, silencioso);
        const ordenada = [...lista].sort((a, b) => b.numeroVersion - a.numeroVersion);
        setVersiones(ordenada);
        setError(null);
        return ordenada;
      } catch (e) {
        // Sin versiones el backend puede responder 404: es el estado vacio, no un error.
        if (e instanceof ApiError && e.status === 404) {
          setVersiones([]);
          setError(null);
        } else {
          setError(e);
        }
        return [];
      } finally {
        setCargando(false);
      }
    },
    [criminalId],
  );

  useEffect(() => {
    setSeleccion(null);
    void cargar();
  }, [cargar]);

  useCambiosSincronizados<CartelGeneradoDatos>([EVENTOS.CARTEL_GENERADO], (c) => {
    if (c.datos?.criminalId !== criminalId) return;
    // Quien miraba la vigente (seleccion null) pasa sola a la nueva; quien
    // revisaba una version antigua se queda en ella.
    void cargar(true).then(() => {
      notificar.info(`Se emitió la versión ${c.datos.numeroVersion} de este cartel.`);
    });
  });

  const vigente = versiones.find((v) => v.vigente) ?? versiones[0] ?? null;
  const actual = versiones.find((v) => v.id === seleccion) ?? vigente;

  async function descargar(formato: FormatoCartel): Promise<void> {
    if (!actual) return;
    setDescargando(formato);
    try {
      const datos = leerInstantanea(actual.datos, criminalId);
      const extension = formato === 'pdf' ? 'pdf' : 'svg';
      const { blob, nombre } = await cartelesApi.descargar(
        actual.id,
        formato,
        nombreArchivo(datos.nombre, actual.numeroVersion, extension),
      );
      guardarArchivo(blob, nombre);
    } catch {
      // Aviso publicado por el interceptor.
    } finally {
      setDescargando(null);
    }
  }

  function imprimir(): void {
    const quitar = (): void => {
      document.body.classList.remove(CLASE_IMPRESION);
      window.removeEventListener('afterprint', quitar);
    };
    document.body.classList.add(CLASE_IMPRESION);
    window.addEventListener('afterprint', quitar);
    window.print();
  }

  async function generar(): Promise<void> {
    setGenerando(true);
    try {
      const nuevo = await cartelesApi.generar(criminalId);
      notificar.exito(`Versión ${nuevo.numeroVersion} emitida.`);
      setSeleccion(null);
      await cargar(true);
    } catch {
      // Aviso publicado por el interceptor.
    } finally {
      setGenerando(false);
    }
  }

  const volver = { a: '/carteles', etiqueta: 'Carteles' };

  if (cargando && versiones.length === 0 && !error) {
    return (
      <div className="cartel-vista" role="status" aria-busy="true">
        <span className="sr-only">Abriendo el cartel…</span>
        <Skeleton forma="bloque" className="cartel-hueso" />
        <div className="cartel-lateral ui-hoja">
          <Skeleton ancho="60%" alto={22} />
          <Skeleton forma="bloque" alto={44} />
          <Skeleton forma="bloque" alto={44} />
        </div>
      </div>
    );
  }

  if (error && versiones.length === 0) {
    return (
      <>
        <PageHeader titulo="Cartel de búsqueda" volver={volver} />
        <EstadoError
          variante="pantalla"
          error={error}
          onReintentar={() => void cargar()}
          volver={volver}
        />
      </>
    );
  }

  if (!actual) {
    return (
      <>
        <PageHeader titulo="Cartel de búsqueda" volver={volver} />
        <EstadoVacio
          variante="pantalla"
          titulo="Este criminal aún no tiene cartel"
          detalle="El cartel se emite solo al registrar al criminal. Si no aparece, puede emitirse a mano."
        >
          {puedeGenerar && (
            <Boton
              variante="principal"
              cargando={generando}
              textoCargando="Emitiendo…"
              onClick={() => void generar()}
            >
              Emitir cartel
            </Boton>
          )}
          <Link to={`/criminales/${criminalId}`}>Ver la ficha del criminal</Link>
        </EstadoVacio>
      </>
    );
  }

  const datos = leerInstantanea(actual.datos, criminalId);
  const esVigente = actual.id === vigente?.id;

  return (
    <>
      <PageHeader
        titulo={`Cartel de ${datos.nombre}`}
        volver={volver}
        meta={
          <>
            <InsigniaEstado
              etiqueta={
                esVigente
                  ? `Versión ${actual.numeroVersion} vigente`
                  : `Versión ${actual.numeroVersion} archivada`
              }
              tono={esVigente ? 'exito' : 'neutro'}
            />
            <ActualizadoHace fecha={actual.generadoEn} prefijo="Emitida" />
          </>
        }
      >
        {/* El mismo formulario publico al que lleva el enlace del cartel impreso. */}
        <BotonEnlace
          variante="fantasma"
          to={`/reportar?criminal=${encodeURIComponent(criminalId)}`}
        >
          Reportar avistamiento
        </BotonEnlace>
        <Boton icono={<IconoImprimir tamano={18} />} onClick={imprimir}>
          Imprimir
        </Boton>
        <Boton
          icono={<IconoDescargar tamano={18} />}
          cargando={descargando === 'svg'}
          textoCargando="Descargando…"
          disabled={descargando !== null}
          onClick={() => void descargar('svg')}
        >
          Imagen
        </Boton>
        <Boton
          variante="principal"
          icono={<IconoDescargar tamano={18} />}
          cargando={descargando === 'pdf'}
          textoCargando="Descargando…"
          disabled={descargando !== null}
          onClick={() => void descargar('pdf')}
        >
          Descargar PDF
        </Boton>
      </PageHeader>

      <div className="cartel-vista">
        <div className="cartel-escenario">
          <CartelWanted
            datos={datos}
            version={{ numero: actual.numeroVersion, fecha: actual.generadoEn }}
            className="cartel-imprimible"
          />
        </div>

        <aside className="cartel-lateral ui-hoja" aria-label="Versiones del cartel">
          <div aria-live="polite">
            {!esVigente && (
              <Alerta
                tipo="aviso"
                titulo={`Estás viendo la versión ${actual.numeroVersion}, ya reemplazada`}
                acciones={
                  <Boton tamano="compacto" onClick={() => setSeleccion(null)}>
                    Ver la vigente
                  </Boton>
                }
              >
                Lo impreso con esta versión ya no coincide con el archivo.
              </Alerta>
            )}
          </div>

          <div className="cartel-lateral-cabecera">
            <h2>Versiones</h2>
            <Link to={`/criminales/${criminalId}`}>Ficha del criminal</Link>
          </div>

          <ol className="versiones">
            {versiones.map((v) => {
              const elegida = v.id === actual.id;
              return (
                <li key={v.id}>
                  <button
                    type="button"
                    className={elegida ? 'version version--elegida' : 'version'}
                    aria-pressed={elegida}
                    onClick={() => setSeleccion(v.vigente ? null : v.id)}
                  >
                    <span className="version-numero cifra">V{v.numeroVersion}</span>
                    <span className="version-texto">
                      <strong>{etiquetaMotivo(v.motivoGeneracion)}</strong>
                      <time dateTime={aIso(v.generadoEn)}>{formatearFecha(v.generadoEn)}</time>
                    </span>
                    {v.vigente && <InsigniaEstado etiqueta="Vigente" tono="exito" />}
                  </button>
                </li>
              );
            })}
          </ol>

          {puedeGenerar && (
            <div className="cartel-lateral-pie">
              <Boton
                variante="fantasma"
                icono={<IconoRecargar tamano={18} />}
                cargando={generando}
                textoCargando="Emitiendo…"
                onClick={() => void generar()}
              >
                Emitir versión nueva
              </Boton>
              <p>
                Solo hace falta si el cartel impreso se perdió o se dañó: los cambios del criminal
                ya emiten versión nueva solos.
              </p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
