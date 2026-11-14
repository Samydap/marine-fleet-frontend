import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import flowbiteReact from 'flowbite-react/plugin/vite';
// defineConfig viene de vitest/config, no de vite: es el que acepta la clave
// `test`. Con el de 'vite' el typecheck falla.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    react(),
    // Tailwind CSS v4: compila src/tailwind.css (ahi esta toda su configuracion).
    tailwindcss(),
    // Flowbite React: genera .flowbite-react/class-list.json con las clases de
    // los componentes que se importen. Las pruebas no procesan CSS (css: false),
    // asi que ahi no se carga.
    ...(process.env.VITEST ? [] : [flowbiteReact()]),
  ],

  resolve: {
    // Los mismos alias que tsconfig.json. Evitan los '../../../..' y, con ellos,
    // los conflictos cuando alguien mueve una carpeta.
    alias: {
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
    },
  },

  server: {
    host: '127.0.0.1',
    port: 5173,
    // El proxy evita que cada dev tenga que lidiar con CORS en desarrollo:
    // el frontend pide /api/... al mismo origen y Vite lo reenvia al backend.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    css: false,
    restoreMocks: true,
  },
});
