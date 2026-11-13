import { useEffect, useState, type FormEvent } from 'react';
import { notificar } from '@core/services/notification.store';
import { RolCodigo } from '@core/session/permiso.enum';
import { useEsRol } from '@core/session/session.store';
import { EVENTOS } from '@core/sync/eventos';
import { useCambiosSincronizados } from '@core/sync/sincronizacion';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { Alerta } from '@shared/ui/Alerta';
import { BadgeAmenaza } from '@shared/ui/BadgeAmenaza';
import { Boton } from '@shared/ui/Boton';
import { CampoAreaTexto, CampoTexto } from '@shared/ui/Campo';
import { DialogoConfirmacion } from '@shared/ui/Dialogo';
import { EstadoError, EstadoVacio, Skeleton } from '@shared/ui/Estados';
import { IconoRecargar } from '@shared/ui/iconos';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { PageHeader } from '@shared/ui/PageHeader';
import { TablaDatos, type ColumnaTabla } from '@shared/ui/TablaDatos';
import { formatearBerries } from '@shared/utils/berries';
import { formatearSoloFecha } from '@shared/utils/fecha';
import { SeccionesAmenaza } from '../components/SeccionesAmenaza';
import { amenazaApi } from '../data-access/amenaza-api';
import { useAmenazaStore } from '../data-access/amenaza.store';
import {
  MOTIVO_CRITERIOS_MAXIMO,
  agruparVersiones,
  construirCriterios,
  cortesDeCriterios,
  leerMonto,
  validarCortes,
  type ErroresCriterios,
  type NivelClasificado,
  type ResumenReclasificacion,
  type VersionCriterios,
} from '../models/amenaza';
import '../amenaza.css';

const ORDEN: readonly NivelClasificado[] = ['BAJO', 'MEDIO', 'ALTO'];

interface Rango {
  readonly nivel: NivelClasificado;
  readonly montoMinimo: number;
  readonly montoMaximo: number | null;
}

function textoRango(r: Rango): string {
  if (r.montoMaximo === null) return `Desde ${formatearBerries(r.montoMinimo)}`;
  return `${formatearBerries(r.montoMinimo)} a ${formatearBerries(r.montoMaximo)}`;
}

function textoRangoCorto(r: Rango): string {
  if (r.montoMaximo === null) return `desde ${formatearBerries(r.montoMinimo, true)}`;
  // "Menos de 150 M" en vez de "hasta 150 M": 149.999.999 redondeado engana.
  return `menos de ${formatearBerries(r.montoMaximo + 1, true)}`;
}

function TablaRangos({
  rangos,
  titulo,
}: {
  readonly rangos: readonly Rango[];
  readonly titulo: string;
}): React.ReactElement {
  return (
    <dl className="criterios-rangos" aria-label={titulo}>
      {rangos.map((r) => (
        <div key={r.nivel} className="criterios-rango">
          <dt>
            <BadgeAmenaza nivel={r.nivel} />
          </dt>
          <dd className="cifra">{textoRango(r)}</dd>
        </div>
      ))}
    </dl>
  );
}

function ResumenReclasificado({
  resumen,
}: {
  readonly resumen: ResumenReclasificacion;
}): React.ReactElement {
  const segundos = (resumen.duracionMs / 1000).toLocaleString('es-CO', {
    maximumFractionDigits: 1,
  });
  return (
    <Alerta
      tipo={resumen.errores.length > 0 ? 'aviso' : 'exito'}
      titulo={`${resumen.reclasificados.toLocaleString('es-CO')} de ${resumen.total.toLocaleString('es-CO')} criminales cambiaron de nivel`}
    >
      {resumen.sinCambio.toLocaleString('es-CO')} siguen igual. Tomó {segundos} s.
      {resumen.errores.length > 0 &&
        ` ${resumen.errores.length.toLocaleString('es-CO')} no se pudieron clasificar; vuelve a reclasificar o avisa a soporte.`}
    </Alerta>
  );
}

const COLUMNAS_HISTORIAL: readonly ColumnaTabla<VersionCriterios>[] = [
  {
    clave: 'desde',
    encabezado: 'Vigencia',
    principal: true,
    celda: (v) => (
      <span className="criterios-vigencia">
        <span className="cifra">
          {formatearSoloFecha(v.desde)}
          {v.hasta ? ` – ${formatearSoloFecha(v.hasta)}` : ''}
        </span>
        {v.vigente && <InsigniaEstado etiqueta="Vigente" tono="exito" />}
      </span>
    ),
  },
  ...ORDEN.slice(0, 2).map((nivel): ColumnaTabla<VersionCriterios> => ({
    clave: nivel,
    encabezado: nivel === 'BAJO' ? 'Bajo hasta' : 'Medio hasta',
    numerica: true,
    celda: (v) => {
      const c = v.criterios.find((x) => x.nivel === nivel);
      return c?.montoMaximo != null ? formatearBerries(c.montoMaximo, true) : '—';
    },
  })),
  {
    clave: 'motivo',
    ancha: true,
    encabezado: 'Motivo',
    ocultarEnMovil: true,
    celda: (v) =>
      v.motivo ? (
        <span className="criterios-motivo">{v.motivo}</span>
      ) : (
        <span className="amenaza-sin-dato">Criterios iniciales</span>
      ),
  },
];

/**
 * RF-5 · Criterios de clasificacion. Todos los consultan; SOLO el Analista de
 * Datos Criminales los cambia (el backend lo ata al rol con @Roles: ni el
 * permiso ALL del Almirante abre). Cambiarlos reclasifica todo el archivo.
 */
export function CriteriosPage(): React.ReactElement {
  const { criterios, historial, cargarCriterios } = useAmenazaStore();
  const esAnalista = useEsRol(RolCodigo.ANALISTA_DATOS_CRIMINALES);

  const [techoBajo, setTechoBajo] = useState('');
  const [techoMedio, setTechoMedio] = useState('');
  const [motivo, setMotivo] = useState('');
  const [intentado, setIntentado] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [confirmarReclasificar, setConfirmarReclasificar] = useState(false);
  const [resumen, setResumen] = useState<ResumenReclasificacion | null>(null);

  useEffect(() => {
    void cargarCriterios();
  }, [cargarCriterios]);

  useCambiosSincronizados([EVENTOS.CRITERIOS_AMENAZA_ACTUALIZADOS], () => void cargarCriterios());

  const vigentes = [...(criterios.datos ?? [])]
    .filter((c) => c.vigente)
    .sort((a, b) => ORDEN.indexOf(a.nivel) - ORDEN.indexOf(b.nivel));
  const cortes = cortesDeCriterios(vigentes);
  const versiones = agruparVersiones(historial.datos ?? []);
  const vigenteDesde = vigentes[0]?.vigenteDesde ?? null;

  // El formulario arranca con los cortes vigentes.
  useEffect(() => {
    if (!cortes) return;
    setTechoBajo((v) => v || String(cortes.techoBajo));
    setTechoMedio((v) => v || String(cortes.techoMedio));
  }, [cortes?.techoBajo, cortes?.techoMedio]); // eslint-disable-line react-hooks/exhaustive-deps

  const bajo = leerMonto(techoBajo);
  const medio = leerMonto(techoMedio);
  const errores: ErroresCriterios = intentado ? validarCortes(bajo, medio, motivo) : {};
  const erroresCortes = validarCortes(bajo, medio, 'motivo valido');
  const propuesta =
    bajo !== null && medio !== null && !erroresCortes.techoBajo && !erroresCortes.techoMedio
      ? construirCriterios({ techoBajo: bajo, techoMedio: medio })
      : null;
  const sinCambios = cortes !== null && bajo === cortes.techoBajo && medio === cortes.techoMedio;

  function enviar(e: FormEvent): void {
    e.preventDefault();
    setIntentado(true);
    if (Object.keys(validarCortes(bajo, medio, motivo)).length > 0 || sinCambios) return;
    setConfirmar(true);
  }

  async function aplicar(): Promise<void> {
    if (bajo === null || medio === null) return;
    const respuesta = await amenazaApi.reemplazarCriterios({
      criterios: construirCriterios({ techoBajo: bajo, techoMedio: medio }),
      motivo: motivo.trim(),
    });
    setResumen(respuesta.reclasificacion);
    setMotivo('');
    setIntentado(false);
    notificar.exito('Criterios actualizados. El archivo quedó reclasificado.');
    await cargarCriterios();
  }

  async function reclasificar(): Promise<void> {
    setResumen(await amenazaApi.reclasificar());
    notificar.exito('Reclasificación terminada.');
  }

  return (
    <>
      <PageHeader
        titulo="Criterios de clasificación"
        descripcion="Rangos de recompensa que deciden el nivel de amenaza de cada criminal."
        meta={vigenteDesde && <ActualizadoHace fecha={vigenteDesde} prefijo="Cambiados" />}
      >
        {esAnalista && (
          <Boton
            icono={<IconoRecargar tamano={18} />}
            onClick={() => setConfirmarReclasificar(true)}
          >
            Reclasificar a todos
          </Boton>
        )}
      </PageHeader>
      <SeccionesAmenaza />

      {resumen && (
        <div className="criterios-resumen">
          <ResumenReclasificado resumen={resumen} />
        </div>
      )}

      <div className="criterios">
        <section className="amenaza-panel" aria-labelledby="criterios-vigentes">
          <h2 id="criterios-vigentes" className="amenaza-panel-titulo">
            Rangos vigentes
          </h2>
          {criterios.error && !criterios.datos ? (
            <EstadoError
              variante="en-panel"
              error={criterios.error}
              onReintentar={() => void cargarCriterios()}
              reintentando={criterios.cargando}
            />
          ) : !criterios.datos ? (
            <div className="amenaza-esqueleto" aria-busy="true">
              <Skeleton alto={32} />
              <Skeleton alto={32} />
              <Skeleton alto={32} />
              <span className="sr-only">Cargando criterios</span>
            </div>
          ) : vigentes.length === 0 ? (
            <EstadoVacio
              variante="en-panel"
              titulo="No hay criterios configurados"
              detalle="Sin criterios, los criminales quedan sin clasificar. El Analista de Datos Criminales debe definirlos."
            />
          ) : (
            <TablaRangos rangos={vigentes} titulo="Rangos vigentes por nivel" />
          )}
          <p className="amenaza-nota">
            Sin recompensa vigente, el criminal queda <strong>sin clasificar</strong>. Si opera en
            la Grand Line o cerca del Cuartel General, sube un nivel (Bajo a Medio, Medio a Alto).
          </p>
        </section>

        {esAnalista ? (
          <form
            className="amenaza-panel criterios-formulario"
            aria-labelledby="criterios-cambiar"
            onSubmit={enviar}
            noValidate
          >
            <h2 id="criterios-cambiar" className="amenaza-panel-titulo">
              Cambiar los rangos
            </h2>
            <p className="amenaza-nota">
              Los rangos son contiguos: Bajo empieza en 1 berry y Alto no tiene techo. Basta con
              fijar dónde termina cada uno.
            </p>
            <div className="ui-form-grilla">
              <CampoTexto
                etiqueta="Bajo hasta"
                required
                inputMode="numeric"
                autoComplete="off"
                value={techoBajo}
                onChange={(e) => setTechoBajo(e.target.value)}
                error={errores.techoBajo ?? (techoBajo ? erroresCortes.techoBajo : undefined)}
                ayuda={bajo !== null ? formatearBerries(bajo) : 'Monto en berries'}
              />
              <CampoTexto
                etiqueta="Medio hasta"
                required
                inputMode="numeric"
                autoComplete="off"
                value={techoMedio}
                onChange={(e) => setTechoMedio(e.target.value)}
                error={errores.techoMedio ?? (techoMedio ? erroresCortes.techoMedio : undefined)}
                ayuda={medio !== null ? formatearBerries(medio) : 'Monto en berries'}
              />
              <CampoAreaTexto
                etiqueta="Motivo del cambio"
                required
                claseContenedor="ui-campo--ancho"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                maxLength={MOTIVO_CRITERIOS_MAXIMO}
                contador
                rows={3}
                error={errores.motivo}
                ayuda="Queda en el historial de criterios y en la bitácora."
              />
            </div>

            {propuesta && (
              <div className="criterios-propuesta" aria-live="polite">
                <p className="criterios-propuesta-titulo">
                  {sinCambios ? 'Iguales a los vigentes' : 'Así quedarían'}
                </p>
                <ul className="criterios-propuesta-lista">
                  {propuesta.map((r) => (
                    <li key={r.nivel}>
                      <BadgeAmenaza nivel={r.nivel} />{' '}
                      <span className="cifra">{textoRangoCorto(r)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="ui-form-acciones">
              <Boton type="submit" variante="principal" disabled={sinCambios}>
                Aplicar criterios
              </Boton>
            </div>
          </form>
        ) : (
          <div className="criterios-solo-lectura">
            <Alerta tipo="info" titulo="Solo el Analista de Datos Criminales cambia estos rangos">
              Si crees que deben ajustarse, pídeselo con el caso que lo justifica.
            </Alerta>
          </div>
        )}
      </div>

      <section className="criterios-historial ui-hoja" aria-labelledby="criterios-historial">
        <h2 id="criterios-historial" className="amenaza-subtitulo">
          Historial de cambios
        </h2>
        <TablaDatos
          titulo="Versiones de los criterios"
          filas={versiones}
          columnas={COLUMNAS_HISTORIAL}
          claveFila={(v) => `${v.desde}-${v.hasta ?? 'vigente'}`}
          cargando={!historial.datos && historial.cargando}
          actualizando={historial.cargando && Boolean(historial.datos)}
          error={historial.error}
          onReintentar={() => void cargarCriterios()}
          vacio={<EstadoVacio titulo="Los criterios no se han cambiado nunca" />}
        />
      </section>

      <DialogoConfirmacion
        abierto={confirmar}
        onCerrar={() => setConfirmar(false)}
        onConfirmar={aplicar}
        titulo="¿Aplicar los rangos nuevos?"
        mensaje="Se reclasifica a todos los criminales del archivo y las bases verán los niveles nuevos al instante. Los rangos anteriores quedan en el historial."
        textoConfirmar="Aplicar y reclasificar"
        textoConfirmando="Reclasificando…"
      >
        {propuesta && <TablaRangos rangos={propuesta} titulo="Rangos nuevos" />}
      </DialogoConfirmacion>

      <DialogoConfirmacion
        abierto={confirmarReclasificar}
        onCerrar={() => setConfirmarReclasificar(false)}
        onConfirmar={reclasificar}
        titulo="¿Reclasificar a todos los criminales?"
        mensaje="Vuelve a calcular el nivel de cada criminal con los rangos vigentes. Úsalo si una clasificación quedó desfasada."
        textoConfirmar="Reclasificar"
        textoConfirmando="Reclasificando…"
      />
    </>
  );
}
