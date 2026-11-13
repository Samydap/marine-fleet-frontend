import { useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { rutaInicio } from '@core/session/navegacion';
import { AccesoLayout } from '../components/AccesoLayout';
import { AlertaAcceso } from '../components/AlertaAcceso';
import { BotonEnviar } from '../components/BotonEnviar';
import { IconoAlerta } from '../components/iconos';
import { esRetoMfa, mfaApi } from '../data-access/mfa-api';
import { describirFalloMfa, type FalloAcceso } from '../models/fallo-acceso';
import { validarCodigoMfa } from '../models/validacion-acceso';

/**
 * RF-7 · Segundo factor (TOTP de 6 digitos) para los roles con `requiere_2fa`:
 * Almirante, Director de Inteligencia y Especialista en Seguridad.
 *
 * Llega desde el login con `{ challengeToken, email }` en `location.state`. Sin
 * ese reto (entrada directa por URL o recarga) no hay nada que verificar y la
 * pantalla lo dice en lugar de mostrar un formulario inutil.
 */
export function MfaPage(): React.ReactElement {
  const location = useLocation();
  const reto = esRetoMfa(location.state) ? location.state : null;

  if (!reto) {
    return (
      <AccesoLayout>
        <h1 className="acceso-titulo">Verificación en dos pasos</h1>
        <p className="acceso-intro">
          No hay una verificación pendiente. El código se pide después de escribir tu correo y
          contraseña.
        </p>
        <Link className="acceso-enlace-boton" to="/auth/login" replace>
          Ir a iniciar sesión
        </Link>
      </AccesoLayout>
    );
  }

  return <FormularioMfa challengeToken={reto.challengeToken} email={reto.email} />;
}

function FormularioMfa({
  challengeToken,
  email,
}: {
  readonly challengeToken: string;
  readonly email: string;
}): React.ReactElement {
  const navegar = useNavigate();
  const refCodigo = useRef<HTMLInputElement>(null);
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [fallo, setFallo] = useState<FalloAcceso | null>(null);

  function cambiarCodigo(valor: string): void {
    // Acepta un codigo pegado con espacios ("123 456") y descarta lo que no es digito.
    const limpio = valor.replace(/\D/g, '').slice(0, 6);
    setCodigo(limpio);
    if (error) setError(validarCodigoMfa(limpio));
  }

  async function verificar(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();
    if (enviando) return;

    const invalido = validarCodigoMfa(codigo);
    setError(invalido);
    if (invalido) {
      refCodigo.current?.focus();
      return;
    }

    setFallo(null);
    setEnviando(true);
    try {
      const usuario = await mfaApi.verificar({ challengeToken, codigo });
      navegar(rutaInicio(usuario), { replace: true });
    } catch (fallido) {
      const descrito = describirFalloMfa(fallido);
      setFallo(descrito);
      if (descrito.tipo === 'credenciales') {
        setCodigo('');
        refCodigo.current?.focus();
      }
      setEnviando(false);
    }
  }

  return (
    <AccesoLayout ocupado={enviando}>
      <h1 className="acceso-titulo">Verificación en dos pasos</h1>
      <p className="acceso-intro">
        Escribe el código de 6 dígitos que muestra tu aplicación de autenticación para{' '}
        <strong className="acceso-correo">{email}</strong>.
      </p>

      <form
        className="acceso-form"
        noValidate
        aria-busy={enviando}
        onSubmit={(e) => void verificar(e)}
      >
        <div className="campo">
          <label htmlFor="codigo">Código de verificación</label>
          <input
            ref={refCodigo}
            id="codigo"
            name="codigo"
            className="campo-codigo"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            readOnly={enviando}
            value={codigo}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'codigo-error' : undefined}
            onChange={(e) => cambiarCodigo(e.target.value)}
          />
          {error && (
            <p id="codigo-error" className="campo-error">
              <IconoAlerta />
              {error}
            </p>
          )}
        </div>

        <AlertaAcceso fallo={fallo} />

        <BotonEnviar enviando={enviando} texto="Verificar" textoEnviando="Verificando código…" />
      </form>

      <p className="acceso-alterno">
        ¿No eres tú?{' '}
        <Link to="/auth/login" replace>
          Entrar con otra cuenta
        </Link>
      </p>
    </AccesoLayout>
  );
}
