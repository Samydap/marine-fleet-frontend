# marine-fleet-frontend

UI del Sistema de Gestión de Recompensas y Captura de Criminales de la Marina (Caso 13).
React + TypeScript + Vite, arquitectura feature-based con un chunk por página.

> La arquitectura completa, la matriz de los 6 desarrolladores y las políticas de Git están
> en [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md), que es el mismo documento que está en el
> repo del backend: si lo cambias, actualiza las dos copias.

## Arranque

```bash
npm install
npm run dev
```

La app queda en `http://localhost:5173`. **Requiere el backend en `http://localhost:3000`**:
`vite.config.ts` tiene un proxy que reenvía `/api` hacia allá, así que no hay CORS en
desarrollo y nadie tiene que configurar una URL distinta en su máquina. `VITE_API_URL` va
vacía salvo que quieras apuntar a un backend remoto.

## La regla que sostiene el trabajo en paralelo

```
features/X  →  puede importar de core/ y shared/
shared/     →  puede importar de core/            (nunca de features/)
core/       →  no importa de nadie
features/X  →  NUNCA importa de features/Y
```

El linter la hace cumplir, y está comprobada con pruebas negativas en las tres direcciones.
Si Operativos necesita mostrar criminales, consume el endpoint del backend o un servicio de
`core/`; no importa `features/criminales/...`.

**No toques `src/app/routes.tsx`.** Las nueve entradas ya están declaradas. Al agregar una
pantalla editas tu propio `features/<tu-feature>/<tu-feature>.routes.tsx`. Ahí está el 90 % de
la prevención de conflictos en este repositorio.

## Qué hay implementado y qué no

| Zona                    | Estado                                                                                                                                                                         | Dueño |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| `core/`                 | **Completo**: sesión con Zustand, `RequireAuth`, `RequirePermiso`, los 4 interceptores compuestos sobre `fetch`, cliente HTTP, layout con menú filtrado por permisos, avisos   | Dev 1 |
| `features/criminales`   | **Slice de referencia**: modelo, módulo HTTP, store y página de listado completa (carga / vacío / datos / paginación)                                                          | Dev 2 |
| `features/inteligencia` | **CRUD de avistamientos portado de la v1**, ya dentro de la arquitectura. Ver la advertencia de abajo                                                                          | Dev 5 |
| `features/auth`         | Login funcional contra `POST /auth/login`; MFA pendiente                                                                                                                       | Dev 1 |
| `shared/`               | `BadgeAmenaza`, `PageHeader`, `EmptyState`, `Cargando`, `useHasPermission` y utilidades de berries, amenaza y fecha                                                            | Dev 4 |
| Resto de features       | Rutas declaradas con sus guards + página placeholder que indica lo pendiente y su responsable                                                                                  | —     |
| Pruebas                 | 21 specs con Vitest: lógica pura, un componente con Testing Library y el servicio de sesión con `fetch` sustituido, incluida la matriz de permisos por rol. Son las plantillas | Dev 1 |

Cada placeholder lleva en su cabecera la lista de pantallas y componentes por construir.

> **El módulo de avistamientos no tiene backend todavía.** La pantalla viene de la v1 y
> funcionaba, pero apuntaba a la API vieja (`/api/avistamientos`). Ahora apunta al contrato
> nuevo (`/api/v1/avistamientos`), que Dev 5 debe implementar en el Sprint 1. Hasta entonces
> la pantalla se renderiza pero las llamadas fallan: es lo esperado, no un bug.

## Cómo agregar una pantalla (copia el slice de referencia)

1. `features/<tu-feature>/models/` — tipos que reflejan el DTO del backend.
2. `features/<tu-feature>/data-access/<x>-api.ts` — usa `apiClient`, rutas relativas.
3. `features/<tu-feature>/data-access/<x>.store.ts` — estado con Zustand.
4. `features/<tu-feature>/pages/<X>Page.tsx` — contempla carga, vacío y datos.
5. Agrega la ruta en **tu** `*.routes.tsx`, con `RequirePermiso` si requiere permiso.

Referencias para copiar: `features/criminales/data-access/criminales.store.ts` y
`features/criminales/pages/CriminalListPage.tsx`.

## Convenciones de código

- Nada de `any`, nada de `console.log`, nada de promesas sin `await` o sin `void`.
- El módulo HTTP escribe rutas relativas (`/criminales`): el `apiUrlInterceptor` pone el prefijo.
- Los errores HTTP **no se manejan en la feature**: el `errorInterceptor` ya notificó al
  usuario. En el `catch` solo apagas tu indicador de carga.
- Toda pantalla con datos contempla los tres estados: cargando, vacío y con datos.
- El frontend **oculta**, el backend **autoriza**. Todo `RequirePermiso` y todo
  `useHasPermission` tienen su contraparte obligatoria en el `RolesGuard` del backend;
  esconder un botón no protege nada.

## Convenciones de commit

Idénticas al backend (una sola convención para el equipo, no una por repositorio):

```
feat(criminales): agregar filtro por nivel de amenaza
fix(core): renovar token antes de expirar
```

Alcances válidos: `auth`, `usuarios`, `criminales`, `recompensas`, `amenaza`, `carteles`,
`inteligencia`, `operativos`, `incidentes`, `catalogos`, `core`, `shared`, `config`, `ci`, `deps`.

## Notas de mantenimiento

- **`.eslintrc.json` se generó con un script.** Los nueve bloques que aíslan las features son
  casi idénticos. Si agregas o renombras una feature, actualiza los nueve, no solo el tuyo: si
  el nombre nuevo no aparece en las prohibiciones de las otras ocho, la regla no protege nada
  y nadie se da cuenta.
- **`core/session/`, no `core/auth/`.** El aislamiento se enforza por nombres de carpeta y
  `core/auth/` colisionaba con `features/auth/`. El renombrado también quita una ambigüedad
  real: `core/session/` es el estado de la sesión; `features/auth/` son las pantallas de login.
- **`vitest` debe ir alineado con `vite`.** La combinación verificada es vite 6 + vitest 3. Con
  vitest 2 se instala una copia anidada de Vite y el typecheck de `vite.config.ts` falla.
- **`src/test-setup.ts` instala un polyfill de `localStorage`.** Node 25 expone un global
  propio sin métodos que tapa el de jsdom; sin el polyfill, las pruebas de sesión fallan con un
  mensaje que no apunta a la causa.
