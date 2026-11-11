import { sessionService } from '../session/session.service';
import { useUsuario } from '../session/session.store';

/** Barra superior. Conserva la identidad visual de la v1 (.topbar, .brand). */
export function Header(): React.ReactElement {
  const usuario = useUsuario();

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">M</span>
        <span>
          <strong>MARINA</strong>
          <small>GESTIÓN DE RECOMPENSAS · GRAND LINE</small>
        </span>
      </div>

      {usuario && (
        <div className="sesion">
          <span className="sesion-nombre">{usuario.nombreCompleto}</span>
          <span className="sesion-rol">{usuario.rol}</span>
          <button
            type="button"
            className="secondary-button"
            onClick={() => sessionService.logout()}
          >
            Salir
          </button>
        </div>
      )}
    </header>
  );
}
