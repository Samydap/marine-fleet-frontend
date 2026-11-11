/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * URL base del backend. Vacia en desarrollo: el proxy de vite.config.ts
   * reenvia /api al backend, asi que las peticiones salen al mismo origen.
   */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
