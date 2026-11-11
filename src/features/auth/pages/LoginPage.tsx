import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '@core/models/api-response';
import { sessionService } from '@core/session/session.service';

/**
 * RF-7 · Dev 1.
 *
 * PENDIENTE: encadenar el reto de MFA para los roles que lo exigen (Almirante,
 * Director de Inteligencia y Especialista en Seguridad).
 */
export function LoginPage(): React.ReactElement {
  const navegar = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  async function entrar(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await sessionService.login(email, password);
      navegar('/criminales', { replace: true });
    } catch (fallo) {
      // Aqui el error SI se muestra en la pagina: las notificaciones globales
      // las pinta MainLayout y esta pantalla queda fuera de el, asi que sin esto
      // un login fallido no le dice nada al usuario.
      setError(fallo instanceof ApiError ? fallo.message : 'No se pudo iniciar sesión.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="login-shell">
      <form className="login-card" onSubmit={(e) => void entrar(e)}>
        <span className="brand-mark">M</span>
        <h1>Marina</h1>
        <p className="login-sub">Gestión de Recompensas y Captura de Criminales</p>

        <label htmlFor="email">Correo institucional</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

        <button className="primary-button" type="submit" disabled={enviando}>
          {enviando ? 'Verificando…' : 'Ingresar'}
        </button>
      </form>
    </main>
  );
}
