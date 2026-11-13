import { Link, useLocation } from 'react-router-dom';
import { InsigniasAviso } from './InsigniasAviso';
import { rutaInicio } from '../session/navegacion';
import { useUsuario } from '../session/session.store';

/**
 * 404 dentro del shell: una direccion que no existe. Misma hoja de orden
 * oficial que el acceso denegado (gaviota y 正義 grande), con la ruta pedida a
 * la vista para que se pueda revisar el enlace.
 */
export function PaginaNoEncontrada(): React.ReactElement {
  const { pathname } = useLocation();
  const inicio = rutaInicio(useUsuario());

  return (
    <section
      className="estado estado--pantalla estado--oficial"
      aria-labelledby="no-encontrada-titulo"
    >
      <InsigniasAviso />
      <p className="estado-orden">Error 404</p>
      <h1 id="no-encontrada-titulo" className="estado-titulo">
        Esta página no existe
      </h1>
      <p className="estado-detalle">
        La dirección <code className="estado-ruta">{pathname}</code> no figura en el sistema. Puede
        venir de un enlace viejo o mal copiado.
      </p>
      <div className="estado-acciones">
        <Link className="ui-boton ui-boton--secundario" to={inicio}>
          Ir a mi panel
        </Link>
      </div>
    </section>
  );
}
