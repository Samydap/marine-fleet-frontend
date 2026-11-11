import { NavLink } from 'react-router-dom';
import { Permiso } from '../session/permiso.enum';
import { useSessionStore } from '../session/session.store';
import { tienePermiso } from '../session/permiso.enum';

interface ItemMenu {
  readonly etiqueta: string;
  readonly ruta: string;
  readonly permisos: readonly Permiso[];
  readonly rf: string;
}

/**
 * Menu filtrado por permisos. MENU es el unico lugar donde se declara la
 * navegacion: un dev que agrega una feature agrega una linea aqui.
 */
const MENU: readonly ItemMenu[] = [
  { etiqueta: 'Criminales', ruta: '/criminales', permisos: [Permiso.CRIMINALES_LEER], rf: 'RF-1' },
  { etiqueta: 'Carteles', ruta: '/carteles', permisos: [Permiso.CARTELES_GENERAR], rf: 'RF-2' },
  {
    etiqueta: 'Inteligencia',
    ruta: '/inteligencia',
    permisos: [Permiso.INTELIGENCIA_LEER],
    rf: 'RF-3',
  },
  { etiqueta: 'Operativos', ruta: '/operativos', permisos: [Permiso.OPERATIVOS_LEER], rf: 'RF-4' },
  {
    etiqueta: 'Recompensas',
    ruta: '/recompensas',
    permisos: [Permiso.RECOMPENSAS_SOLICITAR, Permiso.RECOMPENSAS_VALIDAR],
    rf: 'RF-1',
  },
  {
    etiqueta: 'Amenaza',
    ruta: '/amenaza',
    permisos: [Permiso.CRIMINALES_LEER, Permiso.AMENAZA_CONFIGURAR_CRITERIOS],
    rf: 'RF-5',
  },
  { etiqueta: 'Incidentes', ruta: '/incidentes', permisos: [Permiso.INCIDENTES_LEER], rf: 'RF-6' },
  {
    etiqueta: 'Administración',
    ruta: '/admin',
    permisos: [Permiso.USUARIOS_ADMINISTRAR],
    rf: 'RF-7',
  },
];

export function Sidebar(): React.ReactElement {
  const permisos = useSessionStore((s) => s.usuario?.permisos);
  const visibles = MENU.filter((item) => item.permisos.some((p) => tienePermiso(permisos, p)));

  return (
    <nav className="sidebar" aria-label="Navegación principal">
      <ul>
        {visibles.map((item) => (
          <li key={item.ruta}>
            <NavLink to={item.ruta} className={({ isActive }) => (isActive ? 'activo' : '')}>
              {item.etiqueta}
              <small>{item.rf}</small>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
