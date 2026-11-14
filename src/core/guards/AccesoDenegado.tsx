import { Link } from 'react-router-dom';
import { InsigniasAviso } from './InsigniasAviso';
import { IconoCandado } from '../layout/iconos-shell';
import { rutaInicio } from '../session/navegacion';
import { etiquetaRol } from '../session/permiso.enum';
import { useUsuario } from '../session/session.store';

interface Props {
  /** Que se intento abrir, en palabras del usuario ("la bitácora de auditoría"). */
  readonly recurso?: string;
}

/** "a" + "el registro" se contrae: "al registro de criminales". */
function conPreposicion(recurso: string): string {
  return /^el\s/i.test(recurso) ? `al ${recurso.slice(3)}` : `a ${recurso}`;
}

/**
 * Estado "sin permiso" (DISENO.md, Estados). Lo pinta RequirePermiso en lugar
 * de la pagina protegida, dentro del shell: el usuario ve que existe, que su
 * cargo no lo cubre y a donde puede ir, en vez de una pantalla en blanco o un
 * salto silencioso a otra ruta. Va en una hoja de orden oficial con la
 * gaviota y el 正義 grande (DISENO.md, "Pantallas con tratamiento especial").
 *
 * shared/ui lo reexporta como EstadoSinPermiso para usarlo dentro de una pagina.
 */
export function AccesoDenegado({ recurso }: Props): React.ReactElement {
  const usuario = useUsuario();
  const inicio = rutaInicio(usuario);

  return (
    <section
      className="estado estado--pantalla estado--oficial"
      aria-labelledby="acceso-denegado-titulo"
    >
      <InsigniasAviso />
      <p className="estado-orden">
        <IconoCandado />
        Acceso restringido
      </p>
      <h1 id="acceso-denegado-titulo" className="estado-titulo">
        Tu cargo no tiene acceso {recurso ? conPreposicion(recurso) : 'a esta sección'}
      </h1>
      <p className="estado-detalle">
        {usuario
          ? `Con el rol de ${etiquetaRol(usuario.rol)} no puedes abrir esta sección. Si la necesitas para tu trabajo, pide el permiso al Especialista en Seguridad.`
          : 'Inicia sesión con una cuenta que tenga el permiso necesario.'}
      </p>
      {inicio !== '/sin-acceso' && (
        <div className="estado-acciones">
          <Link className="ui-boton ui-boton--secundario" to={inicio}>
            Ir a mi panel
          </Link>
        </div>
      )}
    </section>
  );
}
