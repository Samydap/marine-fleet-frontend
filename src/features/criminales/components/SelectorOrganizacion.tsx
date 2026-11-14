import { useEffect, useState } from 'react';
import { CampoSelect, type CampoSelectProps } from '@shared/ui/Campo';
import {
  CATEGORIAS_CRIMINAL,
  etiquetaCategoria,
  etiquetaTipoAgrupacion,
} from '@shared/utils/criminal';
import { organizacionesApi } from '../data-access/organizaciones-api';
import type { Organizacion } from '../models/criminal';

type Props = Omit<CampoSelectProps, 'children' | 'opciones'> & {
  /** Se llama con la organizacion elegida (o null) ademas del onChange nativo. */
  readonly onOrganizacion?: (org: Organizacion | null) => void;
  /** Ids a excluir (afiliaciones que ya tiene). */
  readonly excluir?: readonly string[];
};

/** Hasta 100 organizaciones activas: el limite que acepta el backend por pagina. */
const LIMITE = 100;

/**
 * Tripulaciones, organizaciones y bandas activas, agrupadas por tipo de
 * criminal (Pirata, Revolucionario, Independiente) para que la categoria se
 * vea al elegir.
 */
export function SelectorOrganizacion({
  onOrganizacion,
  excluir = [],
  onChange,
  ...props
}: Props): React.ReactElement {
  const [organizaciones, setOrganizaciones] = useState<Organizacion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vigente = true;
    void organizacionesApi
      .listar({ activa: true, limit: LIMITE, page: 1 })
      .then((p) => vigente && setOrganizaciones(p.data))
      .catch(() => undefined)
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, []);

  const disponibles = organizaciones.filter((o) => !excluir.includes(o.id));

  return (
    <CampoSelect
      {...props}
      disabled={props.disabled || cargando}
      onChange={(e) => {
        onChange?.(e);
        onOrganizacion?.(organizaciones.find((o) => o.id === e.target.value) ?? null);
      }}
    >
      {CATEGORIAS_CRIMINAL.map((categoria) => {
        const grupo = disponibles.filter((o) => o.categoria === categoria);
        if (grupo.length === 0) return null;
        return (
          <optgroup key={categoria} label={etiquetaCategoria(categoria)}>
            {grupo.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nombre} ({etiquetaTipoAgrupacion(o.tipoAgrupacion).toLowerCase()})
              </option>
            ))}
          </optgroup>
        );
      })}
    </CampoSelect>
  );
}
