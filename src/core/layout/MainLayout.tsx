import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { limpiarCatalogos, useCatalogos } from '../catalogos/catalogos';
import { limpiarDirectorioCriminales } from '../directorio/directorio-criminales';
import { useLoadingStore } from '../services/loading.store';
import { rutaInicio } from '../session/navegacion';
import { etiquetaRol } from '../session/permiso.enum';
import { sessionService } from '../session/session.service';
import { useUsuario } from '../session/session.store';
import { detenerSincronizacion, iniciarSincronizacion } from '../sync/sincronizacion';
import { Avisos } from './Avisos';
import { BienvenidaAbordo } from './BienvenidaAbordo';
import { tomarBienvenida } from './bienvenida';
import { EmblemaGaviota } from './emblemas/EmblemaGaviota';
import { IconoCerrar, IconoMenu, IconoSalir } from './iconos-shell';
import { IndicadorSincronizacion } from './IndicadorSincronizacion';
import { LienzoMarina } from './LienzoMarina';
import { Navegacion } from './Navegacion';
import './layout.css';

/**
 * Shell de la aplicacion. Es el padre de TODAS las features, asi que cada una
 * se monta en el <Outlet /> sin preocuparse por la navegacion, el indicador de
 * carga, el canal de sincronizacion ni los avisos.
 *
 * El contenido va sobre el lienzo "Marineford" (`LienzoMarina`, capas fijas
 * detras del <main>); los datos van en papel oficial dentro de cada pantalla.
 *
 * Escritorio (>= 900px): barra lateral navy fija de 232px.
 * Movil: franja superior navy con el boton de menu; el menu se abre en un
 * <dialog> modal (foco atrapado, Esc y fondo inerte los da el navegador).
 */
export function MainLayout(): React.ReactElement {
  const cargando = useLoadingStore((s) => s.enVuelo > 0);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();
  const usuario = useUsuario();
  const reducir = useReducedMotion() ?? false;
  // Recien llegado del login: bienvenida a bordo y la pantalla entra despues.
  const [conBienvenida] = useState(tomarBienvenida);
  const [bienvenida, setBienvenida] = useState(conBienvenida);

  useEffect(() => {
    iniciarSincronizacion();
    return () => {
      detenerSincronizacion();
      limpiarCatalogos();
      limpiarDirectorioCriminales();
    };
  }, []);

  // Cambiar de pantalla cierra el menu movil.
  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  return (
    <div className="shell">
      {cargando && <div className="barra-carga" role="progressbar" aria-label="Cargando datos" />}

      <a className="saltar-contenido" href="#contenido">
        Saltar al contenido
      </a>

      <aside className="lateral" aria-label="Menú del sistema">
        <Marca />
        <Navegacion />
        <PieLateral />
      </aside>

      <header className="franja">
        <button
          type="button"
          className="franja-menu"
          aria-label="Abrir menú"
          aria-expanded={menuAbierto}
          aria-controls="cajon-menu"
          onClick={() => setMenuAbierto(true)}
        >
          <IconoMenu />
        </button>
        <Marca compacta />
        <IndicadorSincronizacion />
      </header>

      <CajonMenu abierto={menuAbierto} alCerrar={() => setMenuAbierto(false)} />

      <LienzoMarina />

      <main id="contenido" className="contenido" tabIndex={-1}>
        <motion.div
          className="contenido-ancho"
          initial={conBienvenida && !reducir ? { opacity: 0, y: 16 } : false}
          animate={bienvenida && !reducir ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>

      <AnimatePresence>
        {bienvenida && usuario && (
          <BienvenidaAbordo
            nombre={usuario.nombreCompleto}
            rango={etiquetaRol(usuario.rol)}
            alTerminar={() => setBienvenida(false)}
          />
        )}
      </AnimatePresence>

      <Avisos />
    </div>
  );
}

function Marca({ compacta = false }: { readonly compacta?: boolean }): React.ReactElement {
  const usuario = useUsuario();
  return (
    <Link className={compacta ? 'marca marca--compacta' : 'marca'} to={rutaInicio(usuario)}>
      <EmblemaGaviota className="marca-sello" />
      <span className="marca-texto">
        <strong>Marina</strong>
        <span>Cuartel General</span>
      </span>
    </Link>
  );
}

function PieLateral(): React.ReactElement | null {
  const usuario = useUsuario();
  const { nombreBase } = useCatalogos();
  if (!usuario) return null;

  const base = usuario.baseNavalId
    ? (nombreBase(usuario.baseNavalId) ?? 'Base asignada')
    : 'Mando global';

  return (
    <div className="lateral-pie">
      <IndicadorSincronizacion />
      <div className="usuario">
        <p className="usuario-nombre" title={usuario.email}>
          {usuario.nombreCompleto}
        </p>
        <p className="usuario-cargo">
          {etiquetaRol(usuario.rol)}
          <span aria-hidden="true"> · </span>
          <span className="sr-only">, </span>
          {base}
        </p>
      </div>
      <button type="button" className="salir" onClick={() => sessionService.logout()}>
        <IconoSalir />
        Cerrar sesión
      </button>
    </div>
  );
}

function CajonMenu({
  abierto,
  alCerrar,
}: {
  readonly abierto: boolean;
  readonly alCerrar: () => void;
}): React.ReactElement {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) {
      if (typeof dialogo.showModal === 'function') dialogo.showModal();
      else dialogo.setAttribute('open', '');
    } else if (!abierto && dialogo.open) {
      if (typeof dialogo.close === 'function') dialogo.close();
      else dialogo.removeAttribute('open');
    }
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      id="cajon-menu"
      className="cajon"
      aria-label="Menú del sistema"
      onClose={alCerrar}
      onClick={(e) => {
        // Clic en el velo (fuera del panel) cierra.
        if (e.target === e.currentTarget) alCerrar();
      }}
    >
      <div className="cajon-panel">
        <div className="cajon-cabecera">
          <Marca compacta />
          <button
            type="button"
            className="cajon-cerrar"
            aria-label="Cerrar menú"
            onClick={alCerrar}
          >
            <IconoCerrar />
          </button>
        </div>
        <Navegacion alNavegar={alCerrar} />
        <PieLateral />
      </div>
    </dialog>
  );
}
