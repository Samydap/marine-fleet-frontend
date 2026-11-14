import { IconoExito } from '@shared/ui/iconos';

const REQUISITOS: readonly { texto: string; cumple: (p: string) => boolean }[] = [
  { texto: '8 caracteres o más', cumple: (p) => p.length >= 8 },
  { texto: 'Una mayúscula', cumple: (p) => /[A-Z]/.test(p) },
  { texto: 'Una minúscula', cumple: (p) => /[a-z]/.test(p) },
  { texto: 'Un número', cumple: (p) => /\d/.test(p) },
];

/**
 * Politica de contrasenas a la vista mientras se escribe (la misma que valida
 * el backend). Cada requisito dice con icono y texto si ya se cumple.
 */
export function RequisitosContrasena({
  id,
  password,
}: {
  readonly id: string;
  readonly password: string;
}): React.ReactElement {
  return (
    <ul id={id} className="requisitos">
      {REQUISITOS.map((r) => {
        const ok = r.cumple(password);
        return (
          <li key={r.texto} className={ok ? 'requisito requisito--ok' : 'requisito'}>
            {ok ? (
              <IconoExito tamano={16} />
            ) : (
              <span className="requisito-marca" aria-hidden="true" />
            )}
            {r.texto}
            <span className="sr-only">{ok ? ': cumple' : ': falta'}</span>
          </li>
        );
      })}
    </ul>
  );
}
