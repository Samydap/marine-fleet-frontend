// Une clases de Tailwind resolviendo las que chocan (p. ej. `p-2` y `p-4`).
// Los componentes de shadcn/ui importan `cn` del paquete; este re-export deja
// un unico punto de entrada para el codigo propio: `@shared/utils/cn`.
export { cn } from 'cn';
