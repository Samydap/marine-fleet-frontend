import { useEffect, useState, type FormEvent } from 'react';
import { notificar } from '@core/services/notification.store';
import { Boton } from '@shared/ui/Boton';
import { CampoAreaTexto, CampoSelect, CampoTexto } from '@shared/ui/Campo';
import { Dialogo } from '@shared/ui/Dialogo';
import {
  etiquetaTipoAgrupacion,
  opcionesCategoria,
  type TipoAgrupacion,
} from '@shared/utils/criminal';
import { organizacionesApi } from '../data-access/organizaciones-api';
import type { CategoriaOrganizacion, Organizacion } from '../models/criminal';
import { CampoZona } from '@shared/ui/CampoZona';

const TIPOS: readonly TipoAgrupacion[] = ['TRIPULACION', 'ORGANIZACION', 'BANDA'];

interface Props {
  readonly abierto: boolean;
  /** Si viene, se edita; si no, se registra una nueva. */
  readonly organizacion?: Organizacion | null;
  readonly onCerrar: () => void;
  readonly onGuardada: (org: Organizacion) => void;
}

interface Borrador {
  nombre: string;
  tipoAgrupacion: TipoAgrupacion | '';
  categoria: CategoriaOrganizacion | '';
  zonaInfluenciaId: string;
  descripcion: string;
}

function desde(org?: Organizacion | null): Borrador {
  return {
    nombre: org?.nombre ?? '',
    tipoAgrupacion: org?.tipoAgrupacion ?? '',
    categoria: org?.categoria ?? '',
    zonaInfluenciaId: org?.zonaInfluenciaId ?? '',
    descripcion: org?.descripcion ?? '',
  };
}

/** Registrar o editar una tripulacion, organizacion o banda (formulario corto). */
export function DialogoOrganizacion({
  abierto,
  organizacion,
  onCerrar,
  onGuardada,
}: Props): React.ReactElement {
  const [b, setB] = useState<Borrador>(() => desde(organizacion));
  const [errores, setErrores] = useState<Partial<Record<keyof Borrador, string>>>({});
  const [enviando, setEnviando] = useState(false);
  const editando = Boolean(organizacion);

  useEffect(() => {
    if (abierto) {
      setB(desde(organizacion));
      setErrores({});
    }
  }, [abierto, organizacion]);

  async function enviar(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const nombre = b.nombre.trim();
    const encontrados: Partial<Record<keyof Borrador, string>> = {};
    if (nombre.length < 2) encontrados.nombre = 'Escribe el nombre (al menos 2 letras).';
    if (!b.tipoAgrupacion)
      encontrados.tipoAgrupacion = 'Elige si es tripulación, organización o banda.';
    if (!b.categoria) encontrados.categoria = 'Elige el tipo de criminal que agrupa.';
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0 || !b.tipoAgrupacion || !b.categoria) return;

    setEnviando(true);
    try {
      const guardada = organizacion
        ? await organizacionesApi.actualizar(organizacion.id, {
            nombre,
            tipoAgrupacion: b.tipoAgrupacion,
            categoria: b.categoria,
            zonaInfluenciaId: b.zonaInfluenciaId || null,
            descripcion: b.descripcion.trim() || null,
          })
        : await organizacionesApi.crear({
            nombre,
            tipoAgrupacion: b.tipoAgrupacion,
            categoria: b.categoria,
            zonaInfluenciaId: b.zonaInfluenciaId || undefined,
            descripcion: b.descripcion.trim() || undefined,
          });
      notificar.exito(editando ? 'Cambios guardados.' : `${guardada.nombre} quedó registrada.`);
      onGuardada(guardada);
    } catch {
      // Aviso del interceptor; el dialogo conserva lo escrito.
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialogo
      abierto={abierto}
      onCerrar={onCerrar}
      bloqueado={enviando}
      ancho="amplio"
      titulo={
        editando ? `Editar ${organizacion?.nombre ?? 'organización'}` : 'Registrar organización'
      }
      descripcion="Tripulación pirata, célula revolucionaria, cártel o sindicato."
      acciones={
        <>
          <Boton onClick={onCerrar} disabled={enviando}>
            Cancelar
          </Boton>
          <Boton
            type="submit"
            form="form-organizacion"
            variante="principal"
            cargando={enviando}
            textoCargando="Guardando…"
          >
            {editando ? 'Guardar cambios' : 'Registrar'}
          </Boton>
        </>
      }
    >
      <form
        id="form-organizacion"
        className="ui-form-grilla"
        noValidate
        onSubmit={(e) => void enviar(e)}
      >
        <CampoTexto
          etiqueta="Nombre"
          required
          maxLength={100}
          value={b.nombre}
          error={errores.nombre}
          claseContenedor="ui-campo--ancho"
          onChange={(e) => setB({ ...b, nombre: e.target.value })}
        />
        <CampoSelect
          etiqueta="Tipo de criminal"
          required
          opcionVacia="Elige uno"
          value={b.categoria}
          error={errores.categoria}
          opciones={opcionesCategoria()}
          onChange={(e) => setB({ ...b, categoria: e.target.value as CategoriaOrganizacion | '' })}
        />
        <CampoSelect
          etiqueta="Forma de agrupación"
          required
          opcionVacia="Elige una"
          value={b.tipoAgrupacion}
          error={errores.tipoAgrupacion}
          opciones={TIPOS.map((t) => ({ valor: t, etiqueta: etiquetaTipoAgrupacion(t) }))}
          onChange={(e) => setB({ ...b, tipoAgrupacion: e.target.value as TipoAgrupacion | '' })}
        />
        <CampoZona
          etiqueta="Zona de influencia"
          opcionVacia="Sin zona conocida"
          value={b.zonaInfluenciaId}
          claseContenedor="ui-campo--ancho"
          onChange={(e) => setB({ ...b, zonaInfluenciaId: e.target.value })}
        />
        <CampoAreaTexto
          etiqueta="Descripción"
          maxLength={2000}
          contador
          rows={4}
          value={b.descripcion}
          claseContenedor="ui-campo--ancho"
          onChange={(e) => setB({ ...b, descripcion: e.target.value })}
        />
      </form>
    </Dialogo>
  );
}
