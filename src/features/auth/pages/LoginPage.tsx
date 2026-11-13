import { useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { sessionService } from '@core/session/session.service';
import { AccesoLayout } from '../components/AccesoLayout';
import { AlertaAcceso } from '../components/AlertaAcceso';
import { BotonEnviar } from '../components/BotonEnviar';
import { IconoAlerta, IconoOjo, IconoOjoTachado } from '../components/iconos';
import { describirFalloAcceso, type FalloAcceso } from '../models/fallo-acceso';
import { validarContrasena, validarCorreo } from '../models/validacion-acceso';

const DESTINO_POR_DEFECTO = '/criminales';

interface ErroresCampo {
  email?: string | null;
  password?: string | null;
}

/**
 * Solo se vuelve a rutas internas de la aplicacion: un `redirectTo` externo
 * (`//otro-sitio`) o de vuelta al propio acceso se ignora.
 */
function destinoTrasLogin(estado: unknown): string {
  const destino = (estado as { redirectTo?: unknown } | null)?.redirectTo;
  if (
    typeof destino === 'string' &&
    destino.startsWith('/') &&
    !destino.startsWith('//') &&
    !destino.startsWith('/auth')
  ) {
    return destino;
  }
  return DESTINO_POR_DEFECTO;
}

/**
 * RF-7 · Pantalla de acceso.
 *
 * El error de un login fallido se muestra en la propia pagina: las
 * notificaciones globales las pinta MainLayout y esta pantalla queda fuera de
 * el, asi que sin esto un login fallido no le diria nada al usuario.
 *
 * PENDIENTE (backend): cuando /auth/login devuelva el reto del segundo factor,
 * navegar a /auth/mfa con `{ challengeToken, email }` en el state.
 */
export function LoginPage(): React.ReactElement {
  const navegar = useNavigate();
  const location = useLocation();
  const refEmail = useRef<HTMLInputElement>(null);
  const refPassword = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [mayusculas, setMayusculas] = useState(false);
  const [errores, setErrores] = useState<ErroresCampo>({});
  const [enviando, setEnviando] = useState(false);
  const [fallo, setFallo] = useState<FalloAcceso | null>(null);

  function cambiarEmail(valor: string): void {
    setEmail(valor);
    // Si el campo ya mostraba un error, se revalida mientras se corrige.
    if (errores.email) setErrores((e) => ({ ...e, email: validarCorreo(valor) }));
  }

  function cambiarPassword(valor: string): void {
    setPassword(valor);
    if (errores.password) setErrores((e) => ({ ...e, password: validarContrasena(valor) }));
  }

  function detectarMayusculas(evento: ReactKeyboardEvent<HTMLInputElement>): void {
    setMayusculas(evento.getModifierState('CapsLock'));
  }

  async function entrar(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();
    if (enviando) return;

    const nuevos: ErroresCampo = {
      email: validarCorreo(email),
      password: validarContrasena(password),
    };
    setErrores(nuevos);
    if (nuevos.email || nuevos.password) {
      (nuevos.email ? refEmail : refPassword).current?.focus();
      return;
    }

    setFallo(null);
    setEnviando(true);
    try {
      await sessionService.login(email.trim(), password);
      navegar(destinoTrasLogin(location.state), { replace: true });
    } catch (error) {
      const descrito = describirFalloAcceso(error);
      setFallo(descrito);
      if (descrito.tipo === 'credenciales') {
        setPassword('');
        refPassword.current?.focus();
      }
      setEnviando(false);
    }
  }

  const descripcionPassword = [
    mayusculas ? 'password-mayus' : '',
    errores.password ? 'password-error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <AccesoLayout ocupado={enviando}>
      <h1 className="acceso-titulo">Iniciar sesión</h1>
      <p className="acceso-intro">
        Identifícate con tu correo institucional para entrar al sistema.
      </p>

      <form
        className="acceso-form"
        noValidate
        aria-busy={enviando}
        onSubmit={(e) => void entrar(e)}
      >
        <div className="campo">
          <label htmlFor="email">Correo institucional</label>
          <input
            ref={refEmail}
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="nombre@marina.gov"
            maxLength={150}
            readOnly={enviando}
            value={email}
            aria-invalid={errores.email ? true : undefined}
            aria-describedby={errores.email ? 'email-error' : undefined}
            onChange={(e) => cambiarEmail(e.target.value)}
            onBlur={() => {
              if (email) setErrores((e) => ({ ...e, email: validarCorreo(email) }));
            }}
          />
          {errores.email && (
            <p id="email-error" className="campo-error">
              <IconoAlerta />
              {errores.email}
            </p>
          )}
        </div>

        <div className="campo">
          <label htmlFor="password">Contraseña</label>
          <div className="campo-con-accion">
            <input
              ref={refPassword}
              id="password"
              name="password"
              type={verPassword ? 'text' : 'password'}
              autoComplete="current-password"
              maxLength={128}
              readOnly={enviando}
              value={password}
              aria-invalid={errores.password ? true : undefined}
              aria-describedby={descripcionPassword || undefined}
              onChange={(e) => cambiarPassword(e.target.value)}
              onKeyDown={detectarMayusculas}
              onKeyUp={detectarMayusculas}
              onBlur={() => setMayusculas(false)}
            />
            <button
              type="button"
              className="campo-accion"
              aria-controls="password"
              aria-pressed={verPassword}
              aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={() => setVerPassword((v) => !v)}
            >
              {verPassword ? <IconoOjoTachado /> : <IconoOjo />}
            </button>
          </div>
          {mayusculas && (
            <p id="password-mayus" className="campo-ayuda">
              Bloq Mayús está activado.
            </p>
          )}
          {errores.password && (
            <p id="password-error" className="campo-error">
              <IconoAlerta />
              {errores.password}
            </p>
          )}
        </div>

        <AlertaAcceso fallo={fallo} />

        <BotonEnviar enviando={enviando} texto="Entrar" textoEnviando="Verificando credenciales…" />
      </form>
    </AccesoLayout>
  );
}
