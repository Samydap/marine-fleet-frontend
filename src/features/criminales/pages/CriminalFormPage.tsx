import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { notificar } from '@core/services/notification.store';
import { AlertaConflicto, esConflictoDeVersion } from '@shared/ui/Alerta';
import { Boton, BotonEnlace } from '@shared/ui/Boton';
import { CampoAreaTexto, CampoSelect, CampoTexto } from '@shared/ui/Campo';
import { EstadoError, Skeleton } from '@shared/ui/Estados';
import { PageHeader } from '@shared/ui/PageHeader';
import { etiquetaRolMembresia, type RolMembresia } from '@shared/utils/criminal';
import { CampoAlias } from '../components/CampoAlias';
import { CampoFoto, type FotoElegida } from '../components/CampoFoto';
import { SelectorOrganizacion } from '../components/SelectorOrganizacion';
import { CampoZona } from '@shared/ui/CampoZona';
import { criminalesApi } from '../data-access/criminales-api';
import type { CriminalDetalle } from '../models/criminal';
import {
  aActualizarPayload,
  aCrearPayload,
  BORRADOR_VACIO,
  borradorDesde,
  LIMITES,
  validarBorrador,
  type BorradorCriminal,
  type ErroresBorrador,
} from '../utils/borrador-criminal';
import '../criminales.css';

const ROLES: readonly RolMembresia[] = ['LIDER', 'OFICIAL', 'MIEMBRO'];

/**
 * RF-1 registro y edicion de un criminal (CrearCriminalDto /
 * ActualizarCriminalDto + PUT /:id/foto). En edicion viaja la `version`
 * leida: si otra base guardo antes, el backend responde 409 y se ofrece ver
 * la version actual en lugar de sobrescribir.
 */
export function CriminalFormPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const editando = Boolean(id);
  const navegar = useNavigate();
  const formulario = useRef<HTMLFormElement>(null);

  const [original, setOriginal] = useState<CriminalDetalle | null>(null);
  const [cargando, setCargando] = useState(editando);
  const [errorCarga, setErrorCarga] = useState<unknown>(null);
  const [borrador, setBorrador] = useState<BorradorCriminal>(BORRADOR_VACIO);
  const [foto, setFoto] = useState<FotoElegida | null>(null);
  const [errores, setErrores] = useState<ErroresBorrador>({});
  const [intentos, setIntentos] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [conflicto, setConflicto] = useState(false);

  const cargar = useCallback(async (): Promise<void> => {
    if (!id) return;
    setCargando(true);
    try {
      const criminal = await criminalesApi.obtener(id);
      setOriginal(criminal);
      setBorrador(borradorDesde(criminal));
      setErrorCarga(null);
      setConflicto(false);
    } catch (e) {
      setErrorCarga(e);
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Tras un envio con errores, el foco va al primer campo a corregir.
  useEffect(() => {
    if (intentos === 0) return;
    formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [intentos]);

  function cambiar<K extends keyof BorradorCriminal>(campo: K, valor: BorradorCriminal[K]): void {
    setBorrador((b) => ({ ...b, [campo]: valor }));
    if (errores[campo as keyof ErroresBorrador]) {
      setErrores((e) => ({ ...e, [campo]: undefined }));
    }
  }

  async function subirFoto(criminalId: string): Promise<boolean> {
    if (!foto) return true;
    try {
      await criminalesApi.cambiarFoto(criminalId, { mime: foto.mime, imagenBase64: foto.dataUrl });
      return true;
    } catch {
      return false;
    }
  }

  async function guardar(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const encontrados = validarBorrador(borrador);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) {
      setIntentos((n) => n + 1);
      return;
    }

    setGuardando(true);
    setConflicto(false);
    try {
      if (!editando) {
        const creado = await criminalesApi.crear(aCrearPayload(borrador));
        const fotoOk = await subirFoto(creado.id);
        notificar.exito(
          fotoOk
            ? `${creado.nombre} quedó registrado. Su cartel se genera en segundo plano.`
            : `${creado.nombre} quedó registrado, pero la foto no se pudo subir. Vuelve a intentarlo desde Editar.`,
        );
        navegar(`/criminales/${creado.id}`);
        return;
      }

      if (!original) return;
      const payload = aActualizarPayload(borrador, original);
      if (!payload && !foto) {
        notificar.info('No hay cambios que guardar.');
        return;
      }
      if (payload) await criminalesApi.actualizar(original.id, payload);
      const fotoOk = await subirFoto(original.id);
      if (!foto) notificar.exito('Cambios guardados.');
      else if (fotoOk)
        notificar.exito(
          `${payload ? 'Cambios guardados y foto actualizada' : 'Foto actualizada'}. El cartel nuevo estará listo en unos segundos.`,
        );
      else
        notificar.error(
          payload
            ? 'Los datos se guardaron, pero la foto no se pudo subir. Vuelve a intentarlo desde Editar.'
            : 'La foto no se pudo subir. Vuelve a intentarlo desde Editar.',
        );
      navegar(`/criminales/${original.id}`);
    } catch (error) {
      // El interceptor ya aviso del error; el 409 ademas se explica en linea.
      if (esConflictoDeVersion(error)) setConflicto(true);
    } finally {
      setGuardando(false);
    }
  }

  const volver = editando && id ? `/criminales/${id}` : '/criminales';
  const titulo = editando ? `Editar ${original?.nombre ?? 'criminal'}` : 'Registrar criminal';

  if (editando && cargando && !original) {
    return (
      <>
        <PageHeader titulo="Editar criminal" volver={{ a: volver, etiqueta: 'Ficha' }} />
        <div className="expediente-form" aria-busy="true">
          <Skeleton ancho="12rem" alto={22} />
          <Skeleton forma="bloque" alto={44} />
          <Skeleton forma="bloque" alto={44} />
          <Skeleton forma="bloque" alto={120} />
        </div>
      </>
    );
  }

  if (editando && errorCarga && !original) {
    return (
      <>
        <PageHeader
          titulo="Editar criminal"
          volver={{ a: '/criminales', etiqueta: 'Criminales' }}
        />
        <EstadoError
          variante="pantalla"
          error={errorCarga}
          onReintentar={() => void cargar()}
          volver={{ a: '/criminales', etiqueta: 'Criminales' }}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        titulo={titulo}
        descripcion={
          editando
            ? 'Los cambios quedan en el historial con tu usuario y la fecha.'
            : 'El nivel de amenaza y el cartel se generan solos al registrarlo.'
        }
        volver={{ a: volver, etiqueta: editando ? 'Ficha' : 'Criminales' }}
      />

      <div aria-live="polite">
        {conflicto && <AlertaConflicto onRecargar={() => void cargar()} />}
      </div>

      <form
        ref={formulario}
        className="expediente-form"
        noValidate
        onSubmit={(e) => void guardar(e)}
      >
        <fieldset className="expediente-form-grupo" disabled={guardando}>
          <legend>Identidad</legend>
          <div className="ui-form-grilla">
            <CampoTexto
              etiqueta="Nombre completo"
              required
              autoComplete="off"
              maxLength={LIMITES.nombreMax}
              value={borrador.nombre}
              error={errores.nombre}
              claseContenedor="ui-campo--ancho"
              onChange={(e) => cambiar('nombre', e.target.value)}
            />
            <CampoAlias
              valor={borrador.alias}
              error={errores.alias}
              onChange={(alias) => cambiar('alias', alias)}
            />
            <CampoTexto
              etiqueta="Edad"
              type="number"
              inputMode="numeric"
              min={0}
              max={LIMITES.edadMax}
              step={1}
              value={borrador.edad}
              error={errores.edad}
              ayuda="Opcional. En años."
              onChange={(e) => cambiar('edad', e.target.value)}
            />
            <CampoZona
              etiqueta="Zona de influencia"
              opcionVacia="Sin zona conocida"
              value={borrador.zonaInfluenciaId}
              ayuda="Dónde opera habitualmente."
              onChange={(e) => cambiar('zonaInfluenciaId', e.target.value)}
            />
          </div>
        </fieldset>

        <fieldset className="expediente-form-grupo" disabled={guardando}>
          <legend>Descripción física y foto</legend>
          <div className="ui-form-grilla">
            <CampoFoto
              fotoActual={original?.fotoUrl ?? null}
              nombre={borrador.nombre}
              elegida={foto}
              onElegir={setFoto}
              disabled={guardando}
            />
            <CampoAreaTexto
              etiqueta="Descripción física"
              maxLength={LIMITES.descripcionMax}
              contador
              rows={5}
              value={borrador.descripcionFisica}
              error={errores.descripcionFisica}
              ayuda="Rasgos que ayuden a reconocerlo: cicatrices, estatura, vestimenta."
              claseContenedor="ui-campo--ancho"
              onChange={(e) => cambiar('descripcionFisica', e.target.value)}
            />
          </div>
        </fieldset>

        {!editando && (
          <fieldset className="expediente-form-grupo" disabled={guardando}>
            <legend>Afiliación</legend>
            <p className="expediente-form-nota">
              La afiliación define si es pirata, revolucionario o de una organización independiente.
              Puedes dejarla vacía y agregarla después desde la ficha.
            </p>
            <div className="ui-form-grilla">
              <SelectorOrganizacion
                etiqueta="Tripulación, organización o banda"
                opcionVacia="Sin afiliación conocida"
                value={borrador.organizacionId}
                onChange={(e) => {
                  cambiar('organizacionId', e.target.value);
                  if (!e.target.value) cambiar('rolEnOrganizacion', '');
                }}
              />
              <CampoSelect
                etiqueta="Rol"
                opcionVacia="Elige el rol"
                value={borrador.rolEnOrganizacion}
                disabled={!borrador.organizacionId}
                error={errores.rolEnOrganizacion}
                opciones={ROLES.map((r) => ({ valor: r, etiqueta: etiquetaRolMembresia(r) }))}
                onChange={(e) => cambiar('rolEnOrganizacion', e.target.value as RolMembresia | '')}
              />
            </div>
          </fieldset>
        )}

        <div className="ui-form-acciones">
          <BotonEnlace to={volver}>Cancelar</BotonEnlace>
          <Boton
            type="submit"
            variante="principal"
            cargando={guardando}
            textoCargando={editando ? 'Guardando…' : 'Registrando…'}
          >
            {editando ? 'Guardar cambios' : 'Registrar criminal'}
          </Boton>
        </div>
      </form>
    </>
  );
}
