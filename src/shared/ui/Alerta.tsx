import type { ReactNode } from 'react';
import { ApiError } from '@core/models/api-response';
import { Boton } from './Boton';
import { IconoAlerta, IconoExito, IconoInfo } from './iconos';

export type TipoAlerta = 'error' | 'aviso' | 'exito' | 'info';

interface Props {
  readonly tipo: TipoAlerta;
  /** Que paso, en una linea. */
  readonly titulo: string;
  /** Que hacer. */
  readonly children?: ReactNode;
  /** Acciones en linea (Boton "Recargar"). */
  readonly acciones?: ReactNode;
}

const ICONO = {
  error: IconoAlerta,
  aviso: IconoAlerta,
  exito: IconoExito,
  info: IconoInfo,
} as const;

/**
 * Alerta en linea, dentro de la pagina (formularios, conflictos de version,
 * avisos de estado). Para un aviso pasajero de una accion terminada se usa
 * `notificar.exito(...)` de core/services, no esto.
 *
 * Las de error y aviso se anuncian (role="alert"); para que el lector las lea
 * al aparecer, monta la Alerta dentro de un contenedor que ya exista.
 */
export function Alerta({ tipo, titulo, children, acciones }: Props): React.ReactElement {
  const Icono = ICONO[tipo];
  const urgente = tipo === 'error' || tipo === 'aviso';
  return (
    <div className={`ui-alerta ui-alerta--${tipo}`} role={urgente ? 'alert' : 'status'}>
      <Icono />
      <div className="ui-alerta-cuerpo">
        <p className="ui-alerta-titulo">{titulo}</p>
        {children && <div className="ui-alerta-detalle">{children}</div>}
      </div>
      {acciones && <div className="ui-alerta-acciones">{acciones}</div>}
    </div>
  );
}

/**
 * El caso mas comun de concurrencia: el backend respondio 409 porque otra base
 * edito el registro (version optimista). Ofrece recargar sin perder la pantalla.
 *
 *   {conflicto && <AlertaConflicto onRecargar={() => void recargar()} />}
 */
export function AlertaConflicto({
  onRecargar,
  acciones,
}: {
  readonly onRecargar?: () => void;
  readonly acciones?: ReactNode;
}): React.ReactElement {
  return (
    <Alerta
      tipo="aviso"
      titulo="Otra base modificó este registro mientras lo editabas"
      acciones={
        acciones ??
        (onRecargar && (
          <Boton tamano="compacto" onClick={onRecargar}>
            Ver la versión actual
          </Boton>
        ))
      }
    >
      Tus cambios no se guardaron. Revisa la versión actual y vuelve a aplicarlos.
    </Alerta>
  );
}

/** true si el error es un 409 de concurrencia optimista. */
export function esConflictoDeVersion(error: unknown): boolean {
  return error instanceof ApiError && error.esConflicto;
}
