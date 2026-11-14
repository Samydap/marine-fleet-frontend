import { Navigate } from 'react-router-dom';
import { AccesoDenegado } from './AccesoDenegado';
import { rutaInicio } from '../session/navegacion';
import { useUsuario } from '../session/session.store';

/**
 * Elemento de la ruta `/`: lleva a cada cargo a su pantalla de llegada
 * (core/session/navegacion.ts, INICIO_POR_ROL).
 */
export function RedirigirInicio(): React.ReactElement {
  const usuario = useUsuario();
  return <Navigate to={rutaInicio(usuario)} replace />;
}

/**
 * Elemento de `/sin-acceso`: solo para un cargo sin ninguna seccion. Si el
 * cargo tiene alguna (se llego por un enlace viejo), va a su pantalla.
 */
export function SinAcceso(): React.ReactElement {
  const usuario = useUsuario();
  const inicio = rutaInicio(usuario);
  return inicio === '/sin-acceso' ? <AccesoDenegado /> : <Navigate to={inicio} replace />;
}
