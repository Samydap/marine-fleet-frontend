---
name: Marina · Gestión de Recompensas y Captura
description: Sistema de diseño "Cuartel General de la Marina" para el frontend web.
colors:
  navy: '#14243b'
  navy-2: '#203958'
  navy-profundo: '#0d1726'
  gold: '#c99d4c'
  gold-tinta: '#8b6c37'
  tinta: '#182337'
  tinta-2: '#4a5a70'
  tinta-3: '#66748a'
  muted: '#718096'
  borde-campo: '#8592a5'
  line: '#e4e9f0'
  fondo: '#f3f5f8'
  superficie: '#ffffff'
  error: '#9d3833'
  error-fondo: '#fff0ef'
  error-borde: '#f4d2cf'
  aviso: '#7a4f00'
  aviso-fondo: '#fff6e5'
  aviso-borde: '#f1dcb2'
  amenaza-bajo: '#2e7d32'
  amenaza-medio: '#ed8c00'
  amenaza-alto: '#c62828'
  amenaza-pendiente: '#718096'
typography:
  display:
    fontFamily: 'Manrope, sans-serif'
    fontSize: 'clamp(30px, 4vw, 43px)'
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: '-0.04em'
  headline:
    fontFamily: 'Manrope, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: '-0.025em'
  title:
    fontFamily: 'Manrope, sans-serif'
    fontSize: '19px'
    fontWeight: 800
    lineHeight: 1.3
  body:
    fontFamily: 'DM Sans, Segoe UI, sans-serif'
    fontSize: '15px'
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: 'DM Sans, Segoe UI, sans-serif'
    fontSize: '13px'
    fontWeight: 600
    lineHeight: 1.3
  sello:
    fontFamily: 'Manrope, sans-serif'
    fontSize: '11px'
    fontWeight: 800
    letterSpacing: '0.32em'
rounded:
  sm: '4px'
  md: '8px'
  lg: '14px'
spacing:
  base: '8px'
  '1': '8px'
  '2': '16px'
  '3': '24px'
  '4': '32px'
  '6': '48px'
components:
  button-primary:
    backgroundColor: '{colors.navy}'
    textColor: '{colors.superficie}'
    rounded: '{rounded.md}'
    padding: '14px 18px'
  button-primary-hover:
    backgroundColor: '{colors.navy-2}'
  input:
    backgroundColor: '{colors.superficie}'
    textColor: '{colors.tinta}'
    rounded: '{rounded.md}'
    padding: '12px 14px'
  alerta-error:
    backgroundColor: '{colors.error-fondo}'
    textColor: '{colors.error}'
    rounded: '{rounded.md}'
    padding: '12px 14px'
---

# Sistema de diseño: Cuartel General de la Marina

Este documento es la fuente de verdad visual del frontend. Los tokens viven en
`src/styles.css` (bloque `:root`); aquí se explica qué significan y cuándo se
usan. Si una pantalla necesita un valor que no está aquí, primero se agrega el
token y se documenta, después se usa.

## Visión general

**Idea rectora: "la sala de mando y su papelería oficial".**

El sistema lo usan oficiales en bases navales: gente que entra a registrar un
avistamiento, validar una recompensa o seguir un operativo, casi siempre en un
escritorio de oficina y a veces desde el teléfono. La interfaz debe sentirse
como una herramienta de mando: sobria, legible, con autoridad, y sin adornos que
no informen.

El azul marino del uniforme da la estructura; el blanco es la superficie de
trabajo; el dorado es un galón: aparece donde hay rango o autoridad (Almirante,
validaciones, recompensas altas, el sello institucional) y en ningún otro sitio.
La única excepción estética es el cartel WANTED, que usa papel envejecido; el
resto del sistema es una interfaz limpia.

**Rasgos clave:**

- Fondo claro (`fondo`), superficies blancas con borde de 1px (`line`) y
  sombras mínimas.
- Navy como color de estructura y de acción principal.
- Dorado escaso, siempre con significado de rango o institución.
- Tipografía de mando: Manrope pesada para títulos, DM Sans para el trabajo.
- Mapa mental geográfico: los Cuatro Mares (East, West, North, South Blue) y la
  Grand Line organizan filtros, reportes y agrupaciones.

## Colores

Paleta restringida: neutros fríos, un color de estructura (navy) y un acento
de autoridad (dorado). Los colores semánticos (amenaza, error, aviso) no se
usan como decoración.

### Estructura

- **Navy de uniforme** (`--navy`, #14243b): acción principal, barra lateral
  activa, paneles institucionales (como el de la pantalla de acceso).
- **Navy de cubierta** (`--navy-2`, #203958): hover de la acción principal,
  anillo de foco sobre superficies claras.
- **Navy profundo** (`--navy-profundo`, #0d1726): fondo de los paneles
  institucionales de gran formato.

### Autoridad

- **Galón dorado** (`--gold`, #c99d4c): sello, filetes y anillo de foco sobre
  navy. Sobre blanco no llega a 3:1, así que **nunca** se usa para texto ni
  para indicar foco sobre fondos claros.
- **Dorado tinta** (`--gold-tinta`, #8b6c37): la versión del dorado apta para
  texto sobre blanco (4,9:1).

### Neutros

- **Tinta** (`--tinta`, #182337): texto principal.
- **Tinta secundaria** (`--tinta-2`, #4a5a70): texto de apoyo, ayudas de campo.
  Cumple AA sobre blanco y sobre `fondo`.
- **Muted** (`--muted`, #718096): metadatos grandes o no esenciales. No pasa AA
  en texto pequeño: para ayudas y descripciones se usa `tinta-2`.
- **Tinta terciaria** (`--tinta-3`, #66748a): placeholders. Es el gris más
  claro permitido para texto pequeño sobre blanco.
- **Borde de campo** (`--borde-campo`, #8592a5): contorno de campos editables.
- **Línea** (`--line`, #e4e9f0): bordes y separadores que no delimitan un
  control.
- **Fondo** (`--fondo`, #f3f5f8) y **Superficie** (`--superficie`, #fff).

### Semánticos

- **Error** (`--error`, `--error-fondo`, `--error-borde`): fallos que el
  usuario debe corregir o que impiden continuar.
- **Aviso** (`--aviso`, `--aviso-fondo`, `--aviso-borde`): situaciones que no
  son un error del usuario (cuenta bloqueada, servidor no disponible).
- **Amenaza** (`--amenaza-bajo`, `--amenaza-medio`, `--amenaza-alto`,
  `--amenaza-pendiente`): exclusivos del nivel de amenaza y de `BadgeAmenaza`.
  Siempre van con etiqueta de texto.

### Reglas

**La regla del galón.** El dorado marca rango o institución. Si quitar el
dorado de un elemento no le quita significado, ese elemento no debía ser
dorado.

**La regla del color con nombre.** Ningún estado depende solo del color: el
nivel de amenaza lleva etiqueta, un error lleva ícono y texto.

## Tipografía

**Títulos:** Manrope (800). **Trabajo:** DM Sans (400–700). Ambas se cargan
desde Google Fonts en `styles.css`, con `Segoe UI` / `sans-serif` como respaldo.

Carácter: Manrope pesada y con tracking negativo da la voz de mando; DM Sans es
la letra de los formularios y tablas, neutra y legible a tamaños pequeños.

### Jerarquía

- **Display** (800, `clamp(30px, 4vw, 43px)`, 1.15, -0.04em): una vez por
  pantalla, como mucho. Paneles institucionales y cabeceras de sección grandes.
- **Headline** (800, 1.5rem): título de página (`PageHeader`).
- **Title** (800, 19px): título de panel o de formulario.
- **Body** (400, 15px, 1.6): texto corrido. Medida máxima de 65–75 caracteres.
- **Label** (600, 13px): etiquetas de campo y botones.
- **Sello** (800, 11px, tracking 0.32em, mayúsculas): leyendas institucionales
  cortas (el texto circular del sello, la línea de los Cuatro Mares). No se
  usa como "etiqueta encima del título".

Los campos de formulario usan 16px como mínimo para que iOS no haga zoom al
enfocarlos. Las cifras de tablas y montos usan `font-variant-numeric:
tabular-nums`.

## Espaciado y layout

- Escala base de 8px (`--espacio`): 8, 16, 24, 32, 48. Más espacio encima de un
  título que debajo.
- Contenedor de la aplicación de hasta 1500px; barra lateral de 232px que pasa
  a la parte superior por debajo de 900px.
- Puntos de corte: 1000px, 900px (barra lateral), 760px y 410px. Todo debe
  funcionar a 320px de ancho sin desplazamiento horizontal.
- Paneles institucionales (como el acceso) usan una composición dividida en
  escritorio: el panel navy a la izquierda y la superficie de trabajo a la
  derecha. En móvil el panel se reduce a una franja superior.

## Elevación y profundidad

El sistema es plano por defecto: la profundidad se expresa con superficie
blanca sobre `fondo` y un borde `line` de 1px.

- **Sombra 1** (`--sombra`: `0 1px 3px rgba(20, 36, 59, 0.12)`): tablas y
  superficies que se separan del fondo.
- **Sombra 2** (`--sombra-2`: `0 18px 40px -18px rgba(13, 23, 38, 0.45)`): solo
  elementos flotantes (notificaciones, menús).

**La regla de la cubierta plana.** No se apilan sombras genéricas en cada
tarjeta. Si un elemento no flota, no lleva sombra.

## Formas

- Radio pequeño (`--radio-sm`, 4px): insignias, chips, contadores.
- Radio medio (`--radio`, 8px): campos, botones, alertas, tablas.
- Radio grande (`--radio-lg`, 14px): paneles.
- Píldora (999px): solo `BadgeAmenaza` y el rol en la cabecera.
- El sello institucional es circular; ningún otro elemento imita ese círculo
  como adorno.

## Movimiento

Motion de herramienta: rápido, con propósito y nunca en bucle sin motivo.

- `--ease-out`: `cubic-bezier(0.23, 1, 0.32, 1)` para entradas y respuestas.
- `--dur-corta`: 160ms (presión de botón, hover, color).
- `--dur-media`: 240ms (aparición de alertas y paneles).
- Botones: `scale(0.97)` al presionar.
- Una sola animación de autor por pantalla. En el acceso es el giro lento del
  anillo del sello mientras se verifican las credenciales (indica estado).
- `prefers-reduced-motion: reduce`: se eliminan desplazamientos, escalas y
  giros; se conservan los cambios de opacidad y color.
- Hover con movimiento solo dentro de `@media (hover: hover) and (pointer:
fine)`.

## Componentes

### Botones

- **Principal:** fondo navy, texto blanco, 8px de radio, 14px × 18px, label 600. Hover `navy-2`. Presionado `scale(0.97)`.
- **Enviando:** se deshabilita, conserva el ancho y cambia el texto a la acción
  en curso ("Verificando credenciales…") con un indicador pequeño en línea.
- **Secundario:** blanco con borde `line` y texto `tinta-2`.
- **Enlace de texto:** `navy-2` con subrayado y `text-underline-offset: 3px`.

### Campos

- Fondo blanco, borde 1px `borde-campo` (#8592a5, 3:1 sobre blanco para que
  el campo se distinga), 8px de radio, 16px de texto, 48px de alto mínimo.
- Placeholder en `tinta-3` (#66748a); nunca sustituye a la etiqueta.
- **Foco:** anillo de 2px `navy-2` con 2px de separación (sobre navy, el anillo
  es dorado). Nunca se quita el foco visible.
- **Inválido:** borde `error`, `aria-invalid="true"` y mensaje debajo enlazado
  con `aria-describedby`, con ícono y texto.
- Toda etiqueta es un `<label>` visible; el placeholder no sustituye a la
  etiqueta.

### Alertas

- Fondo tintado (`error-fondo` o `aviso-fondo`), borde de 1px del mismo tono,
  ícono SVG y dos niveles: título breve y explicación con la salida ("qué pasó y
  qué hacer").
- Viven dentro de una región `role="alert"` que existe siempre en el DOM, para
  que el lector de pantalla las anuncie.
- No llevan borde lateral grueso de color.

### Sello institucional

Emblema original del sistema (no reproduce ningún logo existente): doble anillo
dorado con la leyenda "MARINA · CUARTEL GENERAL", rosa de los vientos de ocho
puntas y ancla al centro. Vive en `features/auth/components/SelloMarina.tsx`;
si otra feature lo necesita, se mueve a `shared/ui`.

### Cartel WANTED

Pieza estrella y única con estética de papel: papel envejecido, tipografía
display con serifa, "DEAD OR ALIVE", recompensa en berries con su símbolo y foto
enmarcada.

## Estados

Cada pantalla diseña sus cuatro estados antes de darse por terminada:

- **Vacío:** `EmptyState` con un título que dice qué falta y, si existe, la
  acción para crearlo. Nunca una tabla vacía sin explicación.
- **Carga:** skeletons con la forma del contenido para listas y tablas; un
  indicador en línea para acciones (botón "Guardando…"). La barra superior
  (`.barra-carga`) indica peticiones en vuelo.
- **Error:** alerta con el problema y la salida. Los errores de red dicen que el
  servidor no respondió y permiten reintentar sin perder lo escrito.
- **Sin permiso:** la ruta protegida con `RequirePermiso` muestra que el rol no
  tiene acceso, sin dejar al usuario en una pantalla en blanco.

## Lo que sí y lo que no

### Sí

- **Sí** usar los tokens de `:root`; nunca un color, sombra o radio suelto.
- **Sí** reservar el dorado para rango, autoridad y el sello.
- **Sí** escribir en el idioma de la Marina: "base naval", "operativo",
  "avistamiento", "recompensa en berries".
- **Sí** distinguir Pirata, Ejército Revolucionario y Organización criminal
  independiente con insignia propia y texto.
- **Sí** mostrar cuándo se actualizó un dato que se sincroniza entre bases.

### No

- **No** gradientes morado-azul, glassmorphism decorativo ni texto con
  degradado.
- **No** emojis ni caracteres Unicode como íconos: los íconos son SVG con un
  mismo trazo.
- **No** tarjetas dentro de tarjetas, ni grillas de tres tarjetas iguales con
  ícono, título y texto.
- **No** la sombra genérica `0 4px 12px rgba(0,0,0,.1)` repetida en todo.
- **No** bordes redondeados excesivos ni píldoras fuera de insignias.
- **No** texto gris claro sobre gris (`muted` no se usa en texto pequeño).
- **No** etiquetas pequeñas en mayúsculas encima de los títulos.
- **No** dashboards con KPIs inventados ni copys de marketing ("Potencia tu
  flota…").
- **No** animaciones de entrada en cada elemento ni spinners eternos donde
  corresponde un skeleton.
- **No** Lorem ipsum ni datos de relleno sin marcar como tales.
- **No** arte, logos ni personajes oficiales del anime: la iconografía es
  original.
