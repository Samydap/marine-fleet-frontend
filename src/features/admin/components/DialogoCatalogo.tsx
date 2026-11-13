import { useEffect, useState, type FormEvent } from 'react';
import {
  recargarCatalogos,
  useCatalogos,
  type BaseNaval,
  type Mar,
  type TipoMar,
  type ZonaInfluencia,
} from '@core/catalogos/catalogos';
import { notificar } from '@core/services/notification.store';
import { Alerta, AlertaConflicto, esConflictoDeVersion } from '@shared/ui/Alerta';
import { Boton } from '@shared/ui/Boton';
import { CampoAreaTexto, CampoSelect, CampoTexto } from '@shared/ui/Campo';
import { Dialogo } from '@shared/ui/Dialogo';
import { catalogosAdminApi, type DetalleBase } from '../data-access/admin-api';
import {
  etiquetaTipoMar,
  validarCatalogo,
  type BorradorCatalogo,
  type ErroresCatalogo,
} from '../models/catalogo';

/** Que se edita: un registro existente o el alta dentro de su padre. */
export type ObjetivoCatalogo =
  | { tipo: 'mar'; mar?: Mar }
  | { tipo: 'zona'; marId: string; zona?: ZonaInfluencia }
  | { tipo: 'base'; zonaId: string; base?: BaseNaval };

interface Props {
  readonly objetivo: ObjetivoCatalogo | null;
  readonly onCerrar: () => void;
}

const SUSTANTIVO = { mar: 'mar', zona: 'zona de influencia', base: 'base naval' } as const;

function borradorDe(o: ObjetivoCatalogo): BorradorCatalogo {
  switch (o.tipo) {
    case 'mar':
      return {
        nombre: o.mar?.nombre ?? '',
        tipoMar: o.mar?.tipo ?? 'CUATRO_MARES',
        activo: o.mar?.activo ?? true,
      };
    case 'zona':
      return {
        nombre: o.zona?.nombre ?? '',
        padreId: o.zona?.marId ?? o.marId,
        descripcion: o.zona?.descripcion ?? '',
        activo: o.zona?.activo ?? true,
      };
    default:
      return {
        nombre: o.base?.nombre ?? '',
        padreId: o.base?.zonaInfluenciaId ?? o.zonaId,
        ubicacion: o.base?.ubicacion ?? '',
        comandante: o.base?.comandanteNombre ?? '',
        activo: (o.base?.estado ?? 'ACTIVA') === 'ACTIVA',
      };
  }
}

async function guardar(o: ObjetivoCatalogo, b: BorradorCatalogo): Promise<void> {
  const nombre = b.nombre.trim();
  if (o.tipo === 'mar') {
    const p = { nombre, tipo: b.tipoMar as TipoMar };
    await (o.mar
      ? catalogosAdminApi.actualizarMar(o.mar.id, { ...p, activo: b.activo })
      : catalogosAdminApi.crearMar(p));
  } else if (o.tipo === 'zona') {
    const p = { nombre, marId: b.padreId, descripcion: b.descripcion?.trim() || undefined };
    await (o.zona
      ? catalogosAdminApi.actualizarZona(o.zona.id, { ...p, activo: b.activo })
      : catalogosAdminApi.crearZona(p));
  } else {
    const p = {
      nombre,
      zonaInfluenciaId: b.padreId,
      ubicacion: (b.ubicacion ?? '').trim(),
      comandanteNombre: (b.comandante ?? '').trim(),
    };
    await (o.base
      ? catalogosAdminApi.actualizarBase(o.base.id, {
          ...p,
          estado: b.activo ? 'ACTIVA' : 'INACTIVA',
          version: o.base.version,
        })
      : catalogosAdminApi.crearBase(p));
  }
}

/** Alta y edicion de un mar, una zona o una base. Al guardar, recarga el catalogo compartido. */
export function DialogoCatalogo({ objetivo, onCerrar }: Props): React.ReactElement {
  const { mares, zonasDeMar } = useCatalogos();
  const [b, setB] = useState<BorradorCatalogo>({ nombre: '', activo: true });
  const [errores, setErrores] = useState<ErroresCatalogo>({});
  const [guardando, setGuardando] = useState(false);
  const [conflicto, setConflicto] = useState(false);
  const [detalle, setDetalle] = useState<DetalleBase | null>(null);

  useEffect(() => {
    if (!objetivo) return;
    setB(borradorDe(objetivo));
    setErrores({});
    setConflicto(false);
    setDetalle(null);
    if (objetivo.tipo === 'base' && objetivo.base) {
      catalogosAdminApi
        .detalleBase(objetivo.base.id)
        .then(setDetalle)
        .catch(() => undefined);
    }
  }, [objetivo]);

  const editando =
    objetivo !== null &&
    Boolean(
      (objetivo.tipo === 'mar' && objetivo.mar) ||
      (objetivo.tipo === 'zona' && objetivo.zona) ||
      (objetivo.tipo === 'base' && objetivo.base),
    );
  const sustantivo = objetivo ? SUSTANTIVO[objetivo.tipo] : '';
  const titulo = editando ? `Editar ${b.nombre || sustantivo}` : `Registrar ${sustantivo}`;
  const cambiar = <K extends keyof BorradorCatalogo>(k: K, v: BorradorCatalogo[K]): void => {
    setB((p) => ({ ...p, [k]: v }));
    setErrores((e) => ({ ...e, [k]: undefined }));
  };

  async function enviar(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!objetivo) return;
    const encontrados = validarCatalogo(objetivo.tipo, b);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) return;
    setGuardando(true);
    try {
      await guardar(objetivo, b);
      await recargarCatalogos();
      notificar.exito(editando ? 'Catálogo actualizado.' : `${b.nombre.trim()} registrado.`);
      onCerrar();
    } catch (error) {
      if (esConflictoDeVersion(error)) setConflicto(true);
    } finally {
      setGuardando(false);
    }
  }

  const etiquetaActivo = objetivo?.tipo === 'mar' ? 'Activo' : 'Activa';

  return (
    <Dialogo
      abierto={objetivo !== null}
      onCerrar={onCerrar}
      titulo={titulo}
      bloqueado={guardando}
      acciones={
        <>
          <Boton onClick={onCerrar} disabled={guardando}>
            Cancelar
          </Boton>
          <Boton
            type="submit"
            form="form-catalogo"
            variante="principal"
            cargando={guardando}
            textoCargando="Guardando…"
          >
            {editando ? 'Guardar cambios' : 'Registrar'}
          </Boton>
        </>
      }
    >
      <form
        id="form-catalogo"
        className="catalogo-form"
        noValidate
        onSubmit={(e) => void enviar(e)}
      >
        {conflicto && (
          <AlertaConflicto
            onRecargar={() => {
              void recargarCatalogos();
              onCerrar();
            }}
          />
        )}
        <CampoTexto
          etiqueta="Nombre"
          required
          maxLength={100}
          value={b.nombre}
          error={errores.nombre}
          onChange={(e) => cambiar('nombre', e.target.value)}
        />
        {objetivo?.tipo === 'mar' && (
          <CampoSelect
            etiqueta="Tipo"
            value={b.tipoMar}
            opciones={(['CUATRO_MARES', 'GRAND_LINE'] as TipoMar[]).map((t) => ({
              valor: t,
              etiqueta: etiquetaTipoMar(t),
            }))}
            onChange={(e) => cambiar('tipoMar', e.target.value as TipoMar)}
          />
        )}
        {objetivo?.tipo === 'zona' && (
          <>
            <CampoSelect
              etiqueta="Mar"
              required
              value={b.padreId}
              opciones={mares.map((m) => ({ valor: m.id, etiqueta: m.nombre }))}
              onChange={(e) => cambiar('padreId', e.target.value)}
            />
            <CampoAreaTexto
              etiqueta="Descripción"
              maxLength={2000}
              rows={3}
              value={b.descripcion ?? ''}
              onChange={(e) => cambiar('descripcion', e.target.value)}
            />
          </>
        )}
        {objetivo?.tipo === 'base' && (
          <>
            <CampoSelect
              etiqueta="Zona de influencia"
              required
              value={b.padreId}
              error={errores.padreId}
              onChange={(e) => cambiar('padreId', e.target.value)}
            >
              {mares.map((m) => (
                <optgroup key={m.id} label={m.nombre}>
                  {zonasDeMar(m.id).map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.nombre}
                    </option>
                  ))}
                </optgroup>
              ))}
            </CampoSelect>
            <CampoTexto
              etiqueta="Ubicación"
              required
              maxLength={500}
              placeholder="Isla Navarone, Grand Line"
              value={b.ubicacion ?? ''}
              error={errores.ubicacion}
              onChange={(e) => cambiar('ubicacion', e.target.value)}
            />
            <CampoTexto
              etiqueta="Comandante a cargo"
              required
              maxLength={150}
              placeholder="Vicealmirante Jonathan"
              value={b.comandante ?? ''}
              error={errores.comandante}
              onChange={(e) => cambiar('comandante', e.target.value)}
            />
            {detalle && (
              <p className="catalogo-nota">
                {detalle.usuariosAsignados.length}{' '}
                {detalle.usuariosAsignados.length === 1 ? 'cuenta asignada' : 'cuentas asignadas'} ·{' '}
                {detalle.operativosActivos}{' '}
                {detalle.operativosActivos === 1 ? 'operativo activo' : 'operativos activos'}
              </p>
            )}
          </>
        )}
        {editando && (
          <CampoSelect
            etiqueta="Estado"
            value={b.activo ? 'si' : 'no'}
            opciones={[
              { valor: 'si', etiqueta: etiquetaActivo },
              { valor: 'no', etiqueta: objetivo?.tipo === 'mar' ? 'Inactivo' : 'Inactiva' },
            ]}
            ayuda="Lo inactivo deja de aparecer en filtros y asignaciones; el historial lo conserva."
            onChange={(e) => cambiar('activo', e.target.value === 'si')}
          />
        )}
        {editando && !b.activo && detalle && detalle.operativosActivos > 0 && (
          <Alerta tipo="aviso" titulo="Esta base participa en operativos activos">
            Desactivarla no la retira de esos operativos, pero ya no se podrá asignar a nuevos.
          </Alerta>
        )}
      </form>
    </Dialogo>
  );
}
