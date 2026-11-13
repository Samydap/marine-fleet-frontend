import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Boton, BotonIcono } from './Boton';
import { IconoCerrar } from './iconos';

interface PropsDialogo {
  readonly abierto: boolean;
  /** Esc, la X, "Cancelar" o el clic fuera. El padre pone `abierto` en false. */
  readonly onCerrar: () => void;
  readonly titulo: string;
  /** Una frase bajo el titulo. Queda como descripcion accesible. */
  readonly descripcion?: ReactNode;
  readonly children?: ReactNode;
  /** Botones del pie, el principal al final (a la derecha). */
  readonly acciones?: ReactNode;
  /** `amplio` para formularios de varias columnas. */
  readonly ancho?: 'normal' | 'amplio';
  /**
   * Mientras se guarda: Esc y el clic fuera no cierran (se perderia la
   * respuesta del servidor) y la X se deshabilita.
   */
  readonly bloqueado?: boolean;
}

const ENFOCABLE =
  'input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])';

/**
 * Donde entra el foco al abrir: lo marcado con `data-autofocus` (o el atributo
 * `autofocus`), si no el primer control del cuerpo, si no el primer boton del
 * pie (en una confirmacion, "Cancelar"). Nunca la X.
 */
function focoInicial(dialogo: HTMLDialogElement): HTMLElement | null {
  return (
    dialogo.querySelector<HTMLElement>('[data-autofocus], [autofocus]') ??
    dialogo.querySelector<HTMLElement>(`.ui-dialogo-cuerpo :is(${ENFOCABLE})`) ??
    dialogo.querySelector<HTMLElement>(`.ui-dialogo-acciones :is(${ENFOCABLE})`)
  );
}

function devolverFoco(origen: HTMLElement | null): void {
  if (origen?.isConnected) origen.focus();
}

/**
 * Dialogo modal sobre <dialog> nativo: foco atrapado, Esc y fondo inerte los
 * pone el navegador. Al abrir, el foco entra en el contenido (ver focoInicial;
 * marca un control con `data-autofocus` para elegirlo). Al cerrar, o si el
 * padre lo desmonta abierto, el foco vuelve al elemento que lo abrio.
 *
 * Usalo solo cuando la tarea NECESITA interrumpir: confirmar algo
 * irreversible, un formulario corto sin pantalla propia. Lo demas va en linea.
 *
 *   <Dialogo abierto={abierto} onCerrar={() => setAbierto(false)} titulo="Asignar bases"
 *     acciones={<><Boton onClick={cerrar}>Cancelar</Boton>
 *       <Boton variante="principal" type="submit" form="form-bases">Asignar</Boton></>}>
 *     <form id="form-bases" onSubmit={asignar}>…</form>
 *   </Dialogo>
 */
export function Dialogo({
  abierto,
  onCerrar,
  titulo,
  descripcion,
  children,
  acciones,
  ancho = 'normal',
  bloqueado = false,
}: PropsDialogo): React.ReactElement {
  const ref = useRef<HTMLDialogElement>(null);
  const origen = useRef<HTMLElement | null>(null);
  const abiertoRef = useRef(false);
  const base = `dialogo-${useId().replace(/:/g, '')}`;

  // Si el dialogo se desmonta abierto (el padre lo pinta con `{abierto && …}`)
  // el efecto de abajo no llega a cerrarlo: el foco se devuelve aqui.
  useEffect(
    () => () => {
      if (abiertoRef.current) devolverFoco(origen.current);
    },
    [],
  );

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;

    if (abierto && !dialogo.open) {
      origen.current = document.activeElement as HTMLElement | null;
      if (typeof dialogo.showModal === 'function') dialogo.showModal();
      else dialogo.setAttribute('open', '');
      abiertoRef.current = true;
      focoInicial(dialogo)?.focus();
    } else if (!abierto && dialogo.open) {
      if (typeof dialogo.close === 'function') dialogo.close();
      else dialogo.removeAttribute('open');
      abiertoRef.current = false;
      devolverFoco(origen.current);
    }
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      className={`ui-dialogo ui-dialogo--${ancho}`}
      aria-labelledby={`${base}-titulo`}
      aria-describedby={descripcion ? `${base}-descripcion` : undefined}
      onCancel={(e) => {
        // Esc: lo decide el padre (y no mientras se guarda).
        e.preventDefault();
        if (!bloqueado) onCerrar();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !bloqueado) onCerrar();
      }}
    >
      {abierto && (
        <div className="ui-dialogo-panel">
          <h2 id={`${base}-titulo`} className="ui-dialogo-titulo">
            {titulo}
          </h2>
          {descripcion && (
            <p id={`${base}-descripcion`} className="ui-dialogo-descripcion">
              {descripcion}
            </p>
          )}
          {children && <div className="ui-dialogo-cuerpo">{children}</div>}
          {acciones && <div className="ui-dialogo-acciones">{acciones}</div>}
          {/* La X va al final del orden de tabulacion (el CSS la sube a la
              esquina): el foco entra por el contenido, no por "Cerrar". */}
          <BotonIcono
            className="ui-dialogo-cerrar"
            etiqueta="Cerrar"
            icono={<IconoCerrar tamano={18} />}
            tamano="compacto"
            disabled={bloqueado}
            onClick={onCerrar}
          />
        </div>
      )}
    </dialog>
  );
}

interface PropsConfirmacion {
  readonly abierto: boolean;
  readonly onCerrar: () => void;
  /** Puede ser async: el boton muestra "textoConfirmando" y el dialogo se bloquea. */
  readonly onConfirmar: () => void | Promise<void>;
  /** La pregunta, con el objeto: "¿Abortar el operativo OP-0042?". */
  readonly titulo: string;
  /** La consecuencia: "Las bases asignadas dejarán de verlo como activo." */
  readonly mensaje: ReactNode;
  /** El verbo de la accion, nunca "Aceptar": "Abortar operativo". */
  readonly textoConfirmar: string;
  readonly textoConfirmando?: string;
  /** Atajo de `variante="peligro"`. */
  readonly peligroso?: boolean;
  /**
   * Boton de confirmar. `peligro` (rojo) para lo irreversible: el foco entra
   * en "Cancelar". `autoridad` (galon dorado) SOLO para validaciones de rango.
   */
  readonly variante?: 'principal' | 'peligro' | 'autoridad';
  /** Contenido extra (un CampoAreaTexto con el motivo). */
  readonly children?: ReactNode;
}

/**
 * Confirmacion de una accion irreversible o de peso. Si onConfirmar lanza, el
 * dialogo queda abierto para reintentar (el error ya lo avisa el interceptor).
 *
 *   <DialogoConfirmacion abierto={confirmar} onCerrar={() => setConfirmar(false)}
 *     titulo={`¿Dar de baja a ${c.nombre}?`} mensaje="El cartel se retira de circulación."
 *     textoConfirmar="Dar de baja" peligroso onConfirmar={darDeBaja} />
 */
export function DialogoConfirmacion({
  abierto,
  onCerrar,
  onConfirmar,
  titulo,
  mensaje,
  textoConfirmar,
  textoConfirmando,
  peligroso = false,
  variante,
  children,
}: PropsConfirmacion): React.ReactElement {
  const [enCurso, setEnCurso] = useState(false);
  const tono = variante ?? (peligroso ? 'peligro' : 'principal');
  // Sin campos en el cuerpo, el foco entra en el primer boton del pie
  // ("Cancelar", lo menos arriesgado) salvo que confirmar no tenga peligro.
  const focoEnConfirmar = tono !== 'peligro' && !children;

  async function confirmar(): Promise<void> {
    setEnCurso(true);
    try {
      await onConfirmar();
      onCerrar();
    } catch {
      // Se queda abierto: el aviso del error lo publica el interceptor HTTP.
    } finally {
      setEnCurso(false);
    }
  }

  return (
    <Dialogo
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={titulo}
      descripcion={mensaje}
      bloqueado={enCurso}
      acciones={
        <>
          <Boton onClick={onCerrar} disabled={enCurso}>
            Cancelar
          </Boton>
          <Boton
            variante={tono}
            data-autofocus={focoEnConfirmar || undefined}
            cargando={enCurso}
            textoCargando={textoConfirmando ?? `${textoConfirmar}…`}
            onClick={() => void confirmar()}
          >
            {textoConfirmar}
          </Boton>
        </>
      }
    >
      {children}
    </Dialogo>
  );
}
