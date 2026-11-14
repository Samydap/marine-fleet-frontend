import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalogos } from '@core/catalogos/catalogos';
import { notificar } from '@core/services/notification.store';
import { Boton, BotonEnlace } from '@shared/ui/Boton';
import { CampoAreaTexto, CampoSelect, CampoTexto } from '@shared/ui/Campo';
import { PageHeader } from '@shared/ui/PageHeader';
import { SelectorCriminal, type CriminalBreve } from '@shared/ui/SelectorCriminal';
import { valorFechaHoraLocal } from '@shared/utils/fecha';
import { OpcionesZona } from '@shared/ui/CampoZona';
import { operativosApi } from '../data-access/operativos-api';
import {
  aPayloadOperativo,
  opcionesPrioridad,
  validarOperativo,
  type BorradorOperativo,
  type ErroresOperativo,
  type PrioridadOperativo,
} from '../models/operativo';
import '../operativos.css';

const VACIO: BorradorOperativo = {
  nombre: '',
  objetivoCriminalId: '',
  fechaInicioPlaneada: '',
  objetivo: '',
  descripcion: '',
  prioridad: 'MEDIA',
  zonaInfluenciaId: '',
  baseLiderId: '',
  unidadesLider: '',
  recursosLider: '',
};

/**
 * RF-4 Alta de un operativo contra un criminal. Las bases de apoyo y los
 * responsables se asignan despues, en la ficha (el backend los recibe aparte).
 */
export function OperativoFormPage(): React.ReactElement {
  const navigate = useNavigate();
  const { zonas, bases } = useCatalogos();
  const [b, setB] = useState<BorradorOperativo>(() => ({
    ...VACIO,
    fechaInicioPlaneada: valorFechaHoraLocal(new Date(Date.now() + 24 * 3600_000)),
  }));
  const [criminal, setCriminal] = useState<CriminalBreve | null>(null);
  const [errores, setErrores] = useState<ErroresOperativo>({});
  const [guardando, setGuardando] = useState(false);

  const cambiar =
    <K extends keyof BorradorOperativo>(k: K) =>
    (valor: BorradorOperativo[K]): void =>
      setB((prev) => ({ ...prev, [k]: valor }));

  function elegirCriminal(c: CriminalBreve | null): void {
    setCriminal(c);
    setB((prev) => ({
      ...prev,
      objetivoCriminalId: c?.id ?? '',
      // La zona del criminal es el punto de partida; se puede cambiar.
      zonaInfluenciaId: c?.zonaInfluenciaId ?? prev.zonaInfluenciaId,
    }));
    setErrores((e) => ({ ...e, objetivoCriminalId: undefined }));
  }

  async function enviar(e: FormEvent): Promise<void> {
    e.preventDefault();
    const encontrados = validarOperativo(b);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) {
      const primero = Object.keys(encontrados)[0];
      document.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus();
      return;
    }
    setGuardando(true);
    try {
      const creado = await operativosApi.crear(aPayloadOperativo(b));
      notificar.exito(`Operativo ${creado.codigo} planificado. Asigna ahora sus bases de apoyo.`);
      navigate(`/operativos/${creado.id}`, { replace: true });
    } catch {
      // El interceptor ya publico el motivo; el formulario conserva lo escrito.
      setGuardando(false);
    }
  }

  const basesDeZona = b.zonaInfluenciaId
    ? bases.filter((x) => x.zonaInfluenciaId === b.zonaInfluenciaId)
    : [];
  const otrasBases = bases.filter((x) => x.zonaInfluenciaId !== b.zonaInfluenciaId);
  const nombreZonaDe = (id: string): string => zonas.find((z) => z.id === id)?.nombre ?? '';

  return (
    <>
      <PageHeader
        titulo="Nuevo operativo"
        descripcion="Planifica una captura: contra quién, cuándo empieza y con qué prioridad."
        volver={{ a: '/operativos', etiqueta: 'Operativos' }}
      />

      <form className="operativo-form" noValidate onSubmit={(e) => void enviar(e)}>
        <section className="operativo-form-seccion" aria-labelledby="sec-objetivo">
          <h2 id="sec-objetivo">Objetivo</h2>
          <div className="ui-form-grilla">
            <SelectorCriminal
              etiqueta="Criminal objetivo"
              soloActivos
              obligatorio
              seleccionado={criminal}
              onSeleccionar={elegirCriminal}
              error={errores.objetivoCriminalId}
            />
            <CampoTexto
              etiqueta="Nombre del operativo"
              name="nombre"
              required
              maxLength={150}
              claseContenedor="ui-campo--ancho"
              placeholder="Captura en el puerto de Loguetown"
              value={b.nombre}
              error={errores.nombre}
              onChange={(e) => cambiar('nombre')(e.target.value)}
            />
            <CampoAreaTexto
              etiqueta="Objetivo táctico"
              name="objetivo"
              maxLength={2000}
              rows={3}
              contador
              claseContenedor="ui-campo--ancho"
              ayuda="Qué debe conseguir el despliegue. Lo verán todas las bases asignadas."
              value={b.objetivo}
              onChange={(e) => cambiar('objetivo')(e.target.value)}
            />
          </div>
        </section>

        <section className="operativo-form-seccion" aria-labelledby="sec-plan">
          <h2 id="sec-plan">Plan</h2>
          <div className="ui-form-grilla">
            <CampoTexto
              etiqueta="Inicio previsto"
              name="fechaInicioPlaneada"
              type="datetime-local"
              required
              value={b.fechaInicioPlaneada}
              error={errores.fechaInicioPlaneada}
              onChange={(e) => cambiar('fechaInicioPlaneada')(e.target.value)}
            />
            <CampoSelect
              etiqueta="Prioridad"
              name="prioridad"
              value={b.prioridad}
              opciones={opcionesPrioridad()}
              ayuda="Las bases asignadas reciben aviso si cambia."
              onChange={(e) => cambiar('prioridad')(e.target.value as PrioridadOperativo)}
            />
            <CampoSelect
              etiqueta="Zona de operación"
              name="zonaInfluenciaId"
              opcionVacia="La zona del criminal"
              value={b.zonaInfluenciaId}
              onChange={(e) =>
                setB((prev) => ({ ...prev, zonaInfluenciaId: e.target.value, baseLiderId: '' }))
              }
            >
              <OpcionesZona />
            </CampoSelect>
            <CampoSelect
              etiqueta="Base líder"
              name="baseLiderId"
              opcionVacia="La que proponga el mando según la zona"
              value={b.baseLiderId}
              onChange={(e) => cambiar('baseLiderId')(e.target.value)}
            >
              {basesDeZona.length > 0 && (
                <optgroup label={`En ${nombreZonaDe(b.zonaInfluenciaId)}`}>
                  {basesDeZona.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.nombre}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label={basesDeZona.length > 0 ? 'Otras zonas' : 'Bases navales'}>
                {otrasBases.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.nombre}
                  </option>
                ))}
              </optgroup>
            </CampoSelect>
            <CampoTexto
              etiqueta="Unidades de la base líder"
              name="unidadesLider"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={b.unidadesLider}
              error={errores.unidadesLider}
              onChange={(e) => cambiar('unidadesLider')(e.target.value)}
            />
            <CampoTexto
              etiqueta="Recursos de la base líder"
              name="recursosLider"
              maxLength={2000}
              placeholder="2 buques de guerra, 1 unidad de francotiradores"
              value={b.recursosLider}
              onChange={(e) => cambiar('recursosLider')(e.target.value)}
            />
            <CampoAreaTexto
              etiqueta="Notas para las bases"
              name="descripcion"
              maxLength={4000}
              rows={3}
              contador
              claseContenedor="ui-campo--ancho"
              value={b.descripcion}
              onChange={(e) => cambiar('descripcion')(e.target.value)}
            />
          </div>
        </section>

        <div className="ui-form-acciones">
          <BotonEnlace to="/operativos">Cancelar</BotonEnlace>
          <Boton
            type="submit"
            variante="principal"
            cargando={guardando}
            textoCargando="Planificando…"
          >
            Planificar operativo
          </Boton>
        </div>
      </form>
    </>
  );
}
