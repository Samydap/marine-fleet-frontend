import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionService } from '@core/session/session.service';

/**
 * RF-7 · Dev 1.
 *
 * Funcional contra POST /auth/login en cuanto el endpoint exista en el backend.
 * PENDIENTE: encadenar el reto de MFA para los roles que lo exigen (Almirante,
 * Director de Inteligencia y Especialista en Seguridad).
 */
export function LoginPage(): React.ReactElement {
  const navegar = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function entrar(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();
    setEnviando(true);
    try {
      await sessionService.login(email, password);
      navegar('/criminales', { replace: true });
    } catch {
      // El errorInterceptor ya mostro el mensaje al usuario.
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

        <button className="primary-button" type="submit" disabled={enviando}>
          {enviando ? 'Verificando…' : 'Ingresar'}
        </button>
      </form>
    </main>
  );
}
