import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCatalogos } from '@core/catalogos/catalogos';
import { notificar } from '@core/services/notification.store';
import { ETIQUETA_ROL, etiquetaRol, Permiso, RolCodigo } from '@core/session/permiso.enum';
import { useUsuario } from '@core/session/session.store';
import { useHasPermission } from '@shared/hooks/useHasPermission';
import { ActualizadoHace } from '@shared/ui/ActualizadoHace';
import { AlertaConflicto, esConflictoDeVersion } from '@shared/ui/Alerta';
import { Boton, BotonEnlace } from '@shared/ui/Boton';
import { CampoSelect, CampoTexto } from '@shared/ui/Campo';
import { EstadoCargando, EstadoError } from '@shared/ui/Estados';
import { InsigniaEstado } from '@shared/ui/InsigniaEstado';
import { PageHeader } from '@shared/ui/PageHeader';
import { formatearFecha } from '@shared/utils/fecha';
import { DialogoContrasena } from '../components/DialogoContrasena';
import { RequisitosContrasena } from '../components/RequisitosContrasena';
import { usuariosApi } from '../data-access/admin-api';
import {
  ROLES_CON_BASE,
  etiquetaEstadoUsuario,
  opcionesEstadoUsuario,
  tonoEstadoUsuario,
  validarUsuario,
  type BorradorUsuario,
  type ErroresUsuario,
  type EstadoUsuario,
  type Usuario,
} from '../models/usuario';

const VACIO: BorradorUsuario = {
  nombreCompleto: '',
  email: '',
  password: '',
  rol: '',
  baseNavalId: '',
  estado: 'ACTIVO',
};

const aBorrador = (u: Usuario): BorradorUsuario => ({
  nombreCompleto: u.nombreCompleto,
  email: u.email,
  password: '',
  rol: u.rol ?? '',
  baseNavalId: u.baseNavalId ?? '',
  estado: u.estado,
});

/** RF-7 Alta (`/admin/usuarios/nuevo`) y ficha editable (`/admin/usuarios/:id`). */
export function UsuarioFormPage(): React.ReactElement {
  const { id } = useParams();
  const nuevo = !id;
  const navigate = useNavigate();
  const yo = useUsuario();
  const esAlmirante = useHasPermission(Permiso.TODO);
  const { mares, zonasDeMar, bases } = useCatalogos();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [errorCarga, setErrorCarga] = useState<unknown>(null);
  const [b, setB] = useState<BorradorUsuario>(VACIO);
  const [errores, setErrores] = useState<ErroresUsuario>({});
  const [guardando, setGuardando] = useState(false);
  const [conflicto, setConflicto] = useState(false);
  const [contrasena, setContrasena] = useState(false);
  const [roles, setRoles] = useState(() =>
    (Object.keys(ETIQUETA_ROL) as RolCodigo[]).map((c) => ({ codigo: c, nombre: ETIQUETA_ROL[c] })),
  );

  const cargar = useCallback(async () => {
    if (!id) return;
    setErrorCarga(null);
    try {
      const u = await usuariosApi.obtener(id);
      setUsuario(u);
      setB(aBorrador(u));
      setConflicto(false);
    } catch (e) {
      setErrorCarga(e);
    }
  }, [id]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useEffect(() => {
    usuariosApi
      .roles()
      .then((r) => setRoles(r.filter((x) => x.activo)))
      .catch(() => undefined); // Sin catalogo de roles se usa la lista conocida.
  }, []);

  const autogestion = !nuevo && yo?.id === id;
  const cambiar = <K extends keyof BorradorUsuario>(k: K, v: BorradorUsuario[K]): void => {
    setB((p) => ({ ...p, [k]: v }));
    setErrores((e) => ({ ...e, [k]: undefined }));
  };

  async function enviar(e: FormEvent): Promise<void> {
    e.preventDefault();
    const encontrados = validarUsuario(b, nuevo);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) {
      document.querySelector<HTMLElement>(`[name="${Object.keys(encontrados)[0]}"]`)?.focus();
      return;
    }
    setGuardando(true);
    try {
      if (nuevo) {
        const creado = await usuariosApi.crear({
          nombreCompleto: b.nombreCompleto.trim(),
          email: b.email.trim(),
          password: b.password,
          rol: b.rol as RolCodigo,
          baseNavalId: b.baseNavalId || null,
        });
        notificar.exito(`Cuenta de ${creado.nombreCompleto} creada.`);
        navigate(`/admin/usuarios/${creado.id}`, { replace: true });
        return;
      }
      if (!usuario) return;
      const actualizado = await usuariosApi.actualizar(usuario.id, {
        version: usuario.version,
        nombreCompleto: b.nombreCompleto.trim(),
        ...(autogestion
          ? {}
          : { rol: b.rol as RolCodigo, baseNavalId: b.baseNavalId || null, estado: b.estado }),
      });
      setUsuario(actualizado);
      setB(aBorrador(actualizado));
      notificar.exito('Cambios guardados.');
    } catch (error) {
      if (esConflictoDeVersion(error)) setConflicto(true);
    } finally {
      setGuardando(false);
    }
  }

  if (!nuevo && !usuario) {
    return errorCarga ? (
      <>
        <PageHeader titulo="Usuario" volver={{ a: '/admin/usuarios', etiqueta: 'Usuarios' }} />
        <EstadoError
          variante="pantalla"
          error={errorCarga}
          onReintentar={() => void cargar()}
          volver={{ a: '/admin/usuarios', etiqueta: 'Usuarios' }}
        />
      </>
    ) : (
      <EstadoCargando mensaje="Cargando la cuenta…" filas={3} />
    );
  }

  const requiereBase = b.rol !== '' && ROLES_CON_BASE.includes(b.rol);

  return (
    <>
      <PageHeader
        titulo={nuevo ? 'Alta de usuario' : (usuario?.nombreCompleto ?? '')}
        volver={{ a: '/admin/usuarios', etiqueta: 'Usuarios' }}
        descripcion={
          nuevo ? 'Crea la cuenta con su cargo y la base naval a la que responde.' : usuario?.email
        }
        meta={
          usuario && (
            <>
              <InsigniaEstado
                etiqueta={etiquetaEstadoUsuario(usuario.estado)}
                tono={tonoEstadoUsuario(usuario.estado)}
              />
              <span>
                Último acceso:{' '}
                {usuario.ultimoAcceso ? formatearFecha(usuario.ultimoAcceso) : 'nunca'}
              </span>
              <ActualizadoHace fecha={usuario.createdAt} prefijo="Alta" />
            </>
          )
        }
      >
        {usuario && !autogestion && (
          <Boton onClick={() => setContrasena(true)}>Restablecer contraseña</Boton>
        )}
      </PageHeader>

      <div className="aviso-ficha" aria-live="polite">
        {conflicto && <AlertaConflicto onRecargar={() => void cargar()} />}
      </div>

      <form className="admin-form" noValidate onSubmit={(e) => void enviar(e)}>
        <div className="ui-form-grilla">
          <CampoTexto
            etiqueta="Nombre completo"
            name="nombreCompleto"
            required
            maxLength={150}
            autoComplete="off"
            value={b.nombreCompleto}
            error={errores.nombreCompleto}
            onChange={(e) => cambiar('nombreCompleto', e.target.value)}
          />
          {nuevo ? (
            <CampoTexto
              etiqueta="Correo institucional"
              name="email"
              type="email"
              required
              maxLength={150}
              autoComplete="off"
              placeholder="nombre@marina.gov"
              value={b.email}
              error={errores.email}
              onChange={(e) => cambiar('email', e.target.value)}
            />
          ) : (
            <CampoTexto
              etiqueta="Correo institucional"
              value={b.email}
              readOnly
              ayuda="El correo identifica la cuenta y no se cambia."
            />
          )}
          <CampoSelect
            etiqueta="Cargo"
            name="rol"
            required
            opcionVacia={nuevo ? 'Elige el cargo' : undefined}
            value={b.rol}
            disabled={autogestion}
            error={errores.rol}
            ayuda={autogestion ? 'Tu propio cargo lo cambia otro administrador.' : undefined}
            opciones={roles.map((r) => ({
              valor: r.codigo,
              etiqueta: etiquetaRol(r.codigo),
              deshabilitada: r.codigo === RolCodigo.ALMIRANTE && !esAlmirante,
            }))}
            onChange={(e) => cambiar('rol', e.target.value as RolCodigo)}
          />
          <CampoSelect
            etiqueta="Base naval"
            name="baseNavalId"
            required={requiereBase}
            opcionVacia="Sin base (mando global)"
            value={b.baseNavalId}
            disabled={autogestion}
            error={errores.baseNavalId}
            ayuda={
              requiereBase
                ? 'Un Capitán solo ve los operativos de su base.'
                : 'Sin base, la cuenta ve la información de todas las bases.'
            }
            onChange={(e) => cambiar('baseNavalId', e.target.value)}
          >
            {mares.map((mar) => {
              const zonas = new Set(zonasDeMar(mar.id).map((z) => z.id));
              const delMar = bases.filter((x) => zonas.has(x.zonaInfluenciaId));
              if (delMar.length === 0) return null;
              return (
                <optgroup key={mar.id} label={mar.nombre}>
                  {delMar.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.nombre}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </CampoSelect>
          {nuevo ? (
            <div className="ui-campo--ancho admin-contrasena">
              <CampoTexto
                etiqueta="Contraseña inicial"
                name="password"
                type="password"
                required
                maxLength={128}
                autoComplete="new-password"
                value={b.password}
                error={errores.password}
                onChange={(e) => cambiar('password', e.target.value)}
              />
              <RequisitosContrasena id="requisitos-alta" password={b.password} />
            </div>
          ) : (
            <CampoSelect
              etiqueta="Estado de la cuenta"
              name="estado"
              value={b.estado}
              disabled={autogestion}
              opciones={opcionesEstadoUsuario()}
              ayuda={
                autogestion
                  ? 'Tu propio estado lo cambia otro administrador.'
                  : 'Activar también desbloquea una cuenta bloqueada por intentos fallidos.'
              }
              onChange={(e) => cambiar('estado', e.target.value as EstadoUsuario)}
            />
          )}
        </div>
        <div className="ui-form-acciones">
          <BotonEnlace to="/admin/usuarios">Cancelar</BotonEnlace>
          <Boton
            type="submit"
            variante="principal"
            cargando={guardando}
            textoCargando={nuevo ? 'Creando…' : 'Guardando…'}
          >
            {nuevo ? 'Crear cuenta' : 'Guardar cambios'}
          </Boton>
        </div>
      </form>

      {usuario && (
        <DialogoContrasena
          abierto={contrasena}
          onCerrar={() => setContrasena(false)}
          usuarioId={usuario.id}
          nombre={usuario.nombreCompleto}
        />
      )}
    </>
  );
}
