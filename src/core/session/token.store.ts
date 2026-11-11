const CLAVE_ACCESS = 'marina.access_token';
const CLAVE_REFRESH = 'marina.refresh_token';

/**
 * Unico modulo que toca el almacenamiento de tokens.
 *
 * Nota de seguridad para el Especialista en Seguridad (Dev 1): localStorage es
 * vulnerable a XSS. Para produccion la recomendacion es cookie httpOnly +
 * SameSite, lo que mueve esta responsabilidad al backend. Al estar aislado aqui,
 * ese cambio no toca ninguna feature.
 *
 * Cada acceso va en try/catch: en modo privado o con cookies bloqueadas,
 * localStorage lanza en lugar de devolver null.
 */
function leer(clave: string): string | null {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function escribir(clave: string, valor: string | null): void {
  try {
    if (valor === null) {
      localStorage.removeItem(clave);
    } else {
      localStorage.setItem(clave, valor);
    }
  } catch {
    // Sin almacenamiento la sesion dura lo que dure la pestana: aceptable.
  }
}

export const tokenStore = {
  get accessToken(): string | null {
    return leer(CLAVE_ACCESS);
  },

  get refreshToken(): string | null {
    return leer(CLAVE_REFRESH);
  },

  guardar(accessToken: string, refreshToken: string): void {
    escribir(CLAVE_ACCESS, accessToken);
    escribir(CLAVE_REFRESH, refreshToken);
  },

  limpiar(): void {
    escribir(CLAVE_ACCESS, null);
    escribir(CLAVE_REFRESH, null);
  },
};
