import { NavLink } from 'react-router-dom';
import {
  ETIQUETA_GRUPO,
  navegacionVisible,
  type EntradaNavegacion,
  type GrupoNavegacion,
} from '../session/navegacion';
import { useSessionStore } from '../session/session.store';
import { IconoFeature } from './iconos-shell';

const ORDEN_GRUPOS: readonly GrupoNavegacion[] = ['archivo', 'inteligencia', 'flota', 'mando'];

interface Props {
  /** Se llama al elegir un destino (el cajon movil se cierra). */
  readonly alNavegar?: () => void;
}

/**
 * Menu filtrado por permisos, agrupado como se organiza el trabajo en el
 * cuartel: archivo criminal, inteligencia, flota y mando. La tabla de entradas
 * esta en core/session/navegacion.ts; aqui solo se pinta.
 */
export function Navegacion({ alNavegar }: Props): React.ReactElement {
  const permisos = useSessionStore((s) => s.usuario?.permisos);
  const visibles = navegacionVisible(permisos);

  const grupos = ORDEN_GRUPOS.map((grupo) => ({
    grupo,
    entradas: visibles.filter((e) => e.grupo === grupo),
  })).filter((g) => g.entradas.length > 0);

  return (
    <nav className="nav" aria-label="Navegación principal">
      {grupos.map(({ grupo, entradas }) => (
        <div key={grupo} className="nav-grupo">
          <p className="nav-grupo-titulo" id={`nav-${grupo}`}>
            {ETIQUETA_GRUPO[grupo]}
          </p>
          <ul aria-labelledby={`nav-${grupo}`}>
            {entradas.map((entrada) => (
              <ItemNavegacion key={entrada.clave} entrada={entrada} alNavegar={alNavegar} />
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function ItemNavegacion({
  entrada,
  alNavegar,
}: {
  readonly entrada: EntradaNavegacion;
  readonly alNavegar?: () => void;
}): React.ReactElement {
  return (
    <li>
      <NavLink
        to={entrada.ruta}
        className={({ isActive }) => (isActive ? 'nav-enlace nav-enlace--activo' : 'nav-enlace')}
        onClick={alNavegar}
      >
        <IconoFeature clave={entrada.clave} />
        <span>{entrada.etiqueta}</span>
      </NavLink>
    </li>
  );
}
