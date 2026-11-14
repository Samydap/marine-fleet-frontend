import { useState, type FormEvent } from 'react';
import { notificar } from '@core/services/notification.store';
import { Boton } from '@shared/ui/Boton';
import { CampoTexto } from '@shared/ui/Campo';
import { Dialogo } from '@shared/ui/Dialogo';
import { usuariosApi } from '../data-access/admin-api';
import { faltasContrasena } from '../models/usuario';
import { RequisitosContrasena } from './RequisitosContrasena';

interface Props {
  readonly abierto: boolean;
  readonly onCerrar: () => void;
  readonly usuarioId: string;
  readonly nombre: string;
}

/** Restablece la contrasena de otra cuenta (PATCH /usuarios/:id/contrasena). */
export function DialogoContrasena({
  abierto,
  onCerrar,
  usuarioId,
  nombre,
}: Props): React.ReactElement {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  function cerrar(): void {
    setPassword('');
    setError(null);
    onCerrar();
  }

  async function enviar(e: FormEvent): Promise<void> {
    e.preventDefault();
    const faltas = faltasContrasena(password);
    if (faltas.length > 0) {
      setError(`Le falta ${faltas.join(', ')}.`);
      return;
    }
    setGuardando(true);
    try {
      await usuariosApi.restablecerContrasena(usuarioId, password);
      notificar.exito(`Contraseña de ${nombre} restablecida. Entrégasela por un canal seguro.`);
      cerrar();
    } catch {
      // Aviso del interceptor.
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialogo
      abierto={abierto}
      onCerrar={cerrar}
      titulo={`Restablecer la contraseña de ${nombre}`}
      descripcion="La contraseña actual deja de servir en cuanto guardes la nueva."
      bloqueado={guardando}
      acciones={
        <>
          <Boton onClick={cerrar} disabled={guardando}>
            Cancelar
          </Boton>
          <Boton
            type="submit"
            form="form-contrasena"
            variante="principal"
            cargando={guardando}
            textoCargando="Restableciendo…"
          >
            Restablecer contraseña
          </Boton>
        </>
      }
    >
      <form id="form-contrasena" noValidate onSubmit={(e) => void enviar(e)}>
        <CampoTexto
          etiqueta="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          required
          maxLength={128}
          value={password}
          error={error}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
        />
        <RequisitosContrasena id="requisitos-restablecer" password={password} />
      </form>
    </Dialogo>
  );
}
