# Que cambia

<!-- Una o dos frases. Si necesitas mas de cinco, el PR es demasiado grande. -->

## Requerimiento funcional que cubre

<!-- RF-1 Criminales / RF-2 Carteles / RF-3 Inteligencia / RF-4 Operativos / RF-5 Amenaza / RF-6 Incidentes / RF-7 RBAC -->

Closes #

## Como probarlo

1. `npm start` (requiere el backend en `http://localhost:3000`)
2.
3.

## Captura de pantalla

<!-- Obligatoria si el PR cambia algo visible. -->

## Checklist

- [ ] El titulo del PR cumple Conventional Commits (`feat(criminales): ...`)
- [ ] CI en verde (format, lint, test, build)
- [ ] El diff es menor a ~400 lineas
- [ ] Componentes standalone con `ChangeDetectionStrategy.OnPush`
- [ ] Sin imports de otra feature (el linter lo bloquea)
- [ ] Rutas declaradas en MI `*.routes.ts`, no en `app.routes.ts`
- [ ] Las rutas protegidas llevan `authGuard` y, si aplica, `roleGuard`
- [ ] Estados de carga, error y vacio contemplados
- [ ] Sin `any` ni `console.log`
- [ ] Rama rebasada contra `develop`
