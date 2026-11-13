import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCatalogos } from '@core/catalogos/catalogos';
import { notificar } from '@core/services/notification.store';
import { Permiso, tienePermiso } from '@core/session/permiso.enum';
import { useUsuario } from '@core/session/session.store';
import { Alerta } from '@shared/ui/Alerta';
import { Boton, BotonEnlace, BotonIcono } from '@shared/ui/Boton';
import { CampoAreaTexto, CampoSelect, CampoTexto } from '@shared/ui/Campo';
import { IconoCerrar, IconoMas } from '@shared/ui/iconos';
import { PageHeader } from '@shared/ui/PageHeader';
import { valorFechaHoraLocal } from '@shared/utils/fecha';
import { OpcionesZona } from '@shared/ui/CampoZona';
import { useDirectorioIncidentes } from '../data-access/directorio.store';
import { incidentesApi } from '../data-access/incidentes-api';
import {
  aPayloadIncidente,
  cambiaEstadoCriminal,
  LIMITES_INCIDENTE,
  opcionesResultado,
  opcionesTipo,
  validarIncidente,
  type ErroresIncidente,
  type FilaCriminal,
  type FilaMarino,
  type FormularioIncidente,
  type ResultadoEnfrentamiento,
  type TipoIncidente,
} from '../models/incidente';
import { SeccionCriminales } from '../components/SeccionCriminales';
import '../incidentes.css';

let consecutivo = 0;
const nuevaClave = (): string => `fila-${++consecutivo}`;

const filaCriminal = (criminalId = ''): FilaCriminal => ({
  clave: nuevaClave(),
  criminalId,
  rolEnIncidente: 'OBJETIVO',
  desenlace: 'DESCONOCIDO',
});

/**
 * RF-6 Registrar un enfrentamiento: fecha, ubicacion, participantes (criminales
 * y marinos), resultado y observaciones, vinculado al operativo de origen.
 *
 * Acepta `?operativo=<id>` y `?criminal=<id>` para llegar prellenado desde el
 * tablero de operativos o la ficha de un criminal.
 */
export function IncidenteFormPage(): React.ReactElement {
  const navigate = useNavigate();
  const [parametros] = useSearchParams();
  const usuario = useUsuario();
  const { bases } = useCatalogos();
  const {
    operativos,
    operativosPorId,
    estadoOperativos,
    cargar: cargarDirectorio,
  } = useDirectorioIncidentes();

  const esGlobal = tienePermiso(usuario?.permisos, Permiso.TODO);
  const basePropia = esGlobal ? null : (usuario?.baseNavalId ?? null);

  const [form, setForm] = useState<FormularioIncidente>(() => ({
    tipo: 'ENFRENTAMIENTO',
    fechaHora: valorFechaHoraLocal(),
    ubicacion: '',
    descripcion: '',
    zonaInfluenciaId: '',
    baseNavalId: basePropia ?? usuario?.baseNavalId ?? '',
    operativoId: parametros.get('operativo') ?? '',
    resultado: 'EN_CURSO',
    observaciones: '',
    bajasMarina: '',
    bajasEnemigas: '',
    criminales: [filaCriminal(parametros.get('criminal') ?? '')],
    marinos: [],
  }));
  const [errores, setErrores] = useState<ErroresIncidente>({});
  const [guardando, setGuardando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    void cargarDirectorio();
  }, [cargarDirectorio]);

  // Llegando con ?operativo=, su objetivo entra como primer criminal cuando cargan los operativos.
  const objetivoDelEnlace = operativosPorId[form.operativoId]?.objetivoCriminalId ?? null;
  useEffect(() => {
    if (!objetivoDelEnlace) return;
    setForm((f) =>
      f.criminales.length === 1 && !f.criminales[0].criminalId
        ? { ...f, criminales: [{ ...f.criminales[0], criminalId: objetivoDelEnlace }] }
        : f,
    );
  }, [objetivoDelEnlace]);

  const final = form.resultado !== 'EN_CURSO';
  const conBaja = final && form.criminales.some((c) => cambiaEstadoCriminal(c.desenlace));

  function actualizar(cambio: Partial<FormularioIncidente>): void {
    setForm((f) => ({ ...f, ...cambio }));
    const claves = Object.keys(cambio);
    if (claves.some((k) => errores[k])) {
      setErrores((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !claves.includes(k))));
    }
  }

  /** Al elegir el operativo, su objetivo entra como primer criminal si aun no hay ninguno. */
  function elegirOperativo(operativoId: string): void {
    const objetivo = operativosPorId[operativoId]?.objetivoCriminalId;
    setForm((f) => {
      const vacio = f.criminales.length === 1 && !f.criminales[0].criminalId;
      return {
        ...f,
        operativoId,
        criminales:
          objetivo && vacio ? [{ ...f.criminales[0], criminalId: objetivo }] : f.criminales,
      };
    });
  }

  function cambiarCriminal(indice: number, cambio: Partial<FilaCriminal>): void {
    setForm((f) => ({
      ...f,
      criminales: f.criminales.map((c, i) => (i === indice ? { ...c, ...cambio } : c)),
    }));
    if (errores[`criminal-${indice}`] || errores.criminales) {
      setErrores((e) => ({ ...e, [`criminal-${indice}`]: undefined, criminales: undefined }));
    }
  }

  function cambiarMarino(indice: number, cambio: Partial<FilaMarino>): void {
    setForm((f) => ({
      ...f,
      marinos: f.marinos.map((m, i) => (i === indice ? { ...m, ...cambio } : m)),
    }));
    if (errores[`marino-${indice}`]) setErrores((e) => ({ ...e, [`marino-${indice}`]: undefined }));
  }

  async function registrar(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();
    const encontrados = validarIncidente(form);
    setErrores(encontrados);
    if (Object.values(encontrados).some(Boolean)) {
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }

    setGuardando(true);
    try {
      const incidente = await incidentesApi.registrar(aPayloadIncidente(form));
      notificar.exito(
        incidente.cerrado
          ? 'Enfrentamiento registrado y cerrado.'
          : 'Enfrentamiento registrado. Queda en curso hasta que lo cierres.',
      );
      navigate(`/incidentes/${encodeURIComponent(incidente.id)}`);
    } catch {
      // El interceptor ya aviso; el formulario conserva lo escrito.
      setGuardando(false);
    }
  }

  return (
    <>
      <PageHeader
        titulo="Registrar enfrentamiento"
        descripcion="Lo que pasó, quiénes participaron y cómo terminó. Si sigue en curso, ciérralo después desde su ficha."
        volver={{ a: '/incidentes', etiqueta: 'Incidentes' }}
      />

      <form ref={formRef} className="inc-panel inc-formulario" noValidate onSubmit={registrar}>
        <fieldset className="inc-seccion">
          <legend>El hecho</legend>
          <div className="ui-form-grilla">
            <CampoSelect
              etiqueta="Tipo"
              required
              value={form.tipo}
              opciones={opcionesTipo()}
              onChange={(e) => actualizar({ tipo: e.target.value as TipoIncidente })}
            />
            <CampoTexto
              etiqueta="Fecha y hora"
              type="datetime-local"
              required
              max={valorFechaHoraLocal()}
              value={form.fechaHora}
              onChange={(e) => actualizar({ fechaHora: e.target.value })}
              error={errores.fechaHora}
            />
            <CampoTexto
              etiqueta="Lugar"
              required
              maxLength={LIMITES_INCIDENTE.ubicacionMax}
              placeholder="Puerto de Loguetown, muelle 3"
              value={form.ubicacion}
              onChange={(e) => actualizar({ ubicacion: e.target.value })}
              error={errores.ubicacion}
            />
            <CampoSelect
              etiqueta="Zona"
              opcionVacia="La del primer criminal"
              value={form.zonaInfluenciaId}
              onChange={(e) => actualizar({ zonaInfluenciaId: e.target.value })}
              ayuda="Si no la eliges, se usa la zona del primer criminal de la lista."
            >
              <OpcionesZona />
            </CampoSelect>
            <CampoAreaTexto
              etiqueta="Qué ocurrió"
              required
              claseContenedor="ui-campo--ancho"
              rows={4}
              maxLength={LIMITES_INCIDENTE.descripcionMax}
              contador
              placeholder="Intercambio de disparos durante la inspección del puerto."
              value={form.descripcion}
              onChange={(e) => actualizar({ descripcion: e.target.value })}
              error={errores.descripcion}
            />
          </div>
        </fieldset>

        <fieldset className="inc-seccion">
          <legend>Origen</legend>
          <div className="ui-form-grilla">
            <CampoSelect
              etiqueta="Base naval"
              value={form.baseNavalId}
              disabled={basePropia !== null}
              opcionVacia={esGlobal ? 'Sin base asignada' : undefined}
              opciones={bases.map((b) => ({ valor: b.id, etiqueta: b.nombre }))}
              onChange={(e) => actualizar({ baseNavalId: e.target.value })}
              ayuda={
                basePropia !== null
                  ? 'Registras enfrentamientos de tu propia base.'
                  : 'La base que responde por el enfrentamiento.'
              }
            />
            <CampoSelect
              etiqueta="Operativo de origen"
              value={form.operativoId}
              opcionVacia={
                estadoOperativos === 'cargando' ? 'Cargando operativos…' : 'Sin operativo'
              }
              opciones={operativos.map((o) => ({
                valor: o.id,
                etiqueta: `${o.codigo} · ${o.nombre}`,
              }))}
              onChange={(e) => elegirOperativo(e.target.value)}
              ayuda={
                estadoOperativos === 'error'
                  ? 'No se pudieron cargar los operativos: puedes vincularlo después desde la ficha.'
                  : 'Si surgió de un operativo, vincúlalo para verlo en su tablero.'
              }
            >
              {form.operativoId && !operativosPorId[form.operativoId] && (
                <option value={form.operativoId}>Operativo indicado en el enlace</option>
              )}
            </CampoSelect>
          </div>
        </fieldset>

        <SeccionCriminales
          filas={form.criminales}
          final={final}
          errores={errores}
          onCambiar={cambiarCriminal}
          onQuitar={(i) =>
            setForm((f) => ({ ...f, criminales: f.criminales.filter((_, j) => j !== i) }))
          }
          onAgregar={() =>
            setForm((f) => ({ ...f, criminales: [...f.criminales, filaCriminal()] }))
          }
        />

        <fieldset className="inc-seccion">
          <legend>Marinos que participaron</legend>
          {form.marinos.length === 0 ? (
            <p className="inc-nota">
              Opcional. Anota a los oficiales y marinos al mando en el lugar.
            </p>
          ) : (
            <ol className="inc-filas">
              {form.marinos.map((m, i) => (
                <li key={m.clave} className="inc-fila inc-fila--marino">
                  <CampoTexto
                    etiqueta={`Marino ${i + 1}`}
                    required
                    maxLength={LIMITES_INCIDENTE.marinoNombreMax}
                    placeholder="Nombre"
                    value={m.nombre}
                    onChange={(e) => cambiarMarino(i, { nombre: e.target.value })}
                    error={errores[`marino-${i}`]}
                  />
                  <CampoTexto
                    etiqueta="Rango"
                    maxLength={LIMITES_INCIDENTE.marinoRango}
                    placeholder="Capitán"
                    value={m.rango}
                    onChange={(e) => cambiarMarino(i, { rango: e.target.value })}
                  />
                  <BotonIcono
                    className="inc-fila-quitar"
                    etiqueta={`Quitar al marino ${i + 1} de la lista`}
                    icono={<IconoCerrar tamano={18} />}
                    onClick={() =>
                      setForm((f) => ({ ...f, marinos: f.marinos.filter((_, j) => j !== i) }))
                    }
                  />
                </li>
              ))}
            </ol>
          )}
          <div>
            <Boton
              variante="fantasma"
              icono={<IconoMas tamano={18} />}
              disabled={form.marinos.length >= LIMITES_INCIDENTE.marinosMax}
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  marinos: [...f.marinos, { clave: nuevaClave(), nombre: '', rango: '' }],
                }))
              }
            >
              Añadir marino
            </Boton>
          </div>
        </fieldset>

        <fieldset className="inc-seccion">
          <legend>Resultado</legend>
          <div className="ui-form-grilla inc-grilla-resultado">
            <CampoSelect
              etiqueta="Estado del enfrentamiento"
              value={form.resultado}
              opciones={opcionesResultado()}
              onChange={(e) => actualizar({ resultado: e.target.value as ResultadoEnfrentamiento })}
              ayuda={final ? 'Se registra ya cerrado.' : 'Podrás cerrarlo desde su ficha.'}
            />
            <CampoTexto
              etiqueta="Bajas de la Marina"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="0"
              value={form.bajasMarina}
              onChange={(e) => actualizar({ bajasMarina: e.target.value })}
              error={errores.bajasMarina}
            />
            <CampoTexto
              etiqueta="Bajas enemigas"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="0"
              value={form.bajasEnemigas}
              onChange={(e) => actualizar({ bajasEnemigas: e.target.value })}
              error={errores.bajasEnemigas}
            />
            <CampoAreaTexto
              etiqueta="Observaciones"
              claseContenedor="ui-campo--ancho"
              rows={3}
              maxLength={LIMITES_INCIDENTE.observaciones}
              contador
              value={form.observaciones}
              onChange={(e) => actualizar({ observaciones: e.target.value })}
            />
          </div>
          {conBaja && (
            <Alerta tipo="aviso" titulo="Esto cambia el archivo criminal">
              Los criminales marcados como capturados o muertos pasarán a ese estado en su ficha y
              dejarán de estar en búsqueda.
            </Alerta>
          )}
        </fieldset>

        <div className="ui-form-acciones">
          <BotonEnlace to="/incidentes">Cancelar</BotonEnlace>
          <Boton
            variante="principal"
            type="submit"
            cargando={guardando}
            textoCargando="Registrando…"
          >
            Registrar enfrentamiento
          </Boton>
        </div>
      </form>
    </>
  );
}
