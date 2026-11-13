---
name: Marina · Gestión de Recompensas y Captura
description: Sistema de diseño "Cuartel General de Marineford" para el frontend web.
colors:
  navy: '#14243b'
  navy-2: '#203958'
  navy-profundo: '#0d1726'
  gold: '#c99d4c'
  gold-tinta: '#8b6c37'
  gold-oscuro: '#6f5526'
  gold-fondo: '#f8f1e3'
  tinta: '#182337'
  tinta-2: '#4a5a70'
  tinta-3: '#5a687d'
  muted: '#718096'
  borde-campo: '#8592a5'
  line: '#e4e9f0'
  fondo: '#f3f5f8'
  lienzo: '#0b1424'
  lienzo-2: '#13223a'
  papel: '#f6f2e8'
  papel-2: '#ede7d8'
  papel-borde: '#d3c9b3'
  superficie: '{colors.papel}'
  superficie-2: '{colors.papel-2}'
  superficie-campo: '#ffffff'
  seleccion: '#e6ecf5'
  sobre-navy-texto: '#b8c2d1'
  sobre-lienzo: '#ffffff'
  peligro-sobre-lienzo: '#f28b82'
  horizonte: '#2c4868'
  silueta: '#050a14'
  mar-noche: '#070e1a'
  error: '#9d3833'
  error-fondo: '#fff0ef'
  error-borde: '#f4d2cf'
  aviso: '#7a4f00'
  aviso-fondo: '#fff6e5'
  aviso-borde: '#f1dcb2'
  exito: '#1e6b3a'
  exito-fondo: '#eaf6ee'
  info: '#203958'
  info-fondo: '#eaf0f8'
  amenaza-bajo: '#2e7d32'
  amenaza-medio: '#ed8c00'
  amenaza-alto: '#c62828'
  amenaza-pendiente: '#718096'
  amenaza-bajo-tinta: '#1d5e21'
  amenaza-medio-tinta: '#7a4500'
  amenaza-alto-tinta: '#9b1d1d'
  amenaza-bajo-fondo: '#e7f2e8'
  amenaza-medio-fondo: '#fdf0dc'
  amenaza-alto-fondo: '#fbe9e9'
typography:
  orden:
    fontFamily: 'Anton, Oswald, Arial Narrow, sans-serif'
    fontSize: 'clamp(1.75rem, 1.2rem + 1.6vw, 2.5rem)'
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: '0.02em'
    textTransform: uppercase
  cifra:
    fontFamily: 'Manrope, sans-serif'
    fontSize: 'clamp(30px, 4vw, 43px)'
    fontWeight: 800
    lineHeight: 1.15
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
  kanji:
    fontFamily: 'Yuji Syuku, serif'
    fontWeight: 400
rounded:
  sm: '4px'
  md: '8px'
  lg: '14px'
spacing:
  base: '8px'
  '05': '4px'
  '1': '8px'
  '15': '12px'
  '2': '16px'
  '3': '24px'
  '4': '32px'
  '6': '48px'
components:
  button-primary:
    backgroundColor: '{colors.navy}'
    textColor: '#ffffff'
    rounded: '{rounded.md}'
    padding: '14px 18px'
  button-primary-hover:
    backgroundColor: '{colors.navy-2}'
  input:
    backgroundColor: '{colors.superficie-campo}'
    textColor: '{colors.tinta}'
    rounded: '{rounded.md}'
    padding: '12px 14px'
  alerta-error:
    backgroundColor: '{colors.error-fondo}'
    textColor: '{colors.error}'
    rounded: '{rounded.md}'
    padding: '12px 14px'
---

# Sistema de diseño: Cuartel General de Marineford

Este documento es la fuente de verdad visual del frontend. Los tokens viven en
`src/styles.css` (bloque `:root`); aquí se explica qué significan y cuándo se
usan. Si una pantalla necesita un valor que no está aquí, primero se agrega el
token y se documenta, después se usa.

## Visión general

**Idea rectora: "el Cuartel General de Marineford, de noche, con sus órdenes
sobre la mesa".**

El sistema lo usan oficiales en bases navales: gente que entra a registrar un
avistamiento, validar una recompensa o seguir un operativo, casi siempre en un
escritorio de oficina y a veces desde el teléfono. Quien conozca la Marina de
One Piece debe reconocerla en pocos segundos: la gaviota del emblema, el 正義
de los abrigos, el Den Den Mushi, los carteles WANTED y la Grand Line. Y al
mismo tiempo la herramienta tiene que verse **imponente y seria**: es la
autoridad persiguiendo piratas, no una página de fans.

La composición tiene dos planos:

- **El lienzo** es la noche sobre el cuartel: navy profundo, una carta náutica
  tenue con la Grand Line y la Red Line, una trama de tinta en los bordes y la
  gaviota en marca de agua. Sobre él solo va la cabecera de cada página (la
  orden: título, 正義, descripción y acciones) y el muro de carteles.
- **El papel oficial** es donde se trabaja: tablas, formularios, filtros,
  fichas y diálogos van en hojas marfil con filete fino y una sombra corta,
  como documentos sobre la mesa de mando. Ningún texto de lectura va
  directamente sobre el lienzo.

El azul marino del uniforme da la estructura; el dorado es un galón: aparece
donde hay rango o autoridad (Almirante, validaciones, recompensas altas, el
filete del mando) y en ningún otro sitio. El enemigo se ve como enemigo: el
pirata lleva su Jolly Roger, el cartel WANTED es protagonista en fichas y en
el tablón, y la amenaza alta tiene presencia.

**Contexto académico.** La profesora autorizó el uso de motivos y arte del
universo One Piece para este proyecto. Los emblemas se dibujan en SVG dentro
del repo (ligeros, nítidos y con color de tokens); si el equipo recibe arte
oficial, puede reemplazar cualquiera de ellos sin cambiar la estructura.

**Rasgos clave:**

- Lienzo navy nocturno (`lienzo`) con capas fijas y estáticas.
- Superficies de datos en papel oficial (`papel`) con contraste AA.
- Cabecera de orden oficial: display condensada (Anton) en blanco y el sello
  正義.
- Dorado escaso, siempre con significado de rango o institución.
- Mapa mental geográfico: los Cuatro Mares (East, West, North, South Blue) y la
  Grand Line organizan filtros, reportes, agrupaciones y la propia carta del
  lienzo.

## Colores

Paleta restringida: un lienzo nocturno, un papel marfil, un color de
estructura (navy) y un acento de autoridad (dorado). Los colores semánticos
(amenaza, error, aviso) no se usan como decoración.

### Lienzo (detrás del contenido)

- **Lienzo** (`--lienzo`, #0b1424): navy casi tinta, color base del área de
  contenido del shell y de las pantallas públicas. Sustituye a `--fondo` como
  fondo de la aplicación.
- **Lienzo 2** (`--lienzo-2`, #13223a): el resplandor del degradado radial del
  lienzo (arriba a la derecha).
- **Tinta de la carta** (`--tinta-carta`, rgba(184, 194, 209, 0.14)): rumbos,
  rosa de los vientos, Grand Line y Red Line de la carta náutica.
- **Trama** (`--trama`, rgba(184, 194, 209, 0.07)): el punto de la trama de
  tinta.
- **Marca de agua** (`--marca-agua`, rgba(255, 255, 255, 0.045)): la gaviota
  grande del lienzo.
- **Sobre el lienzo** (`--sobre-lienzo`, #fff): título de la cabecera, acción
  principal de la cabecera, pestaña activa y anillo de foco sobre el lienzo
  (18,4:1).
- **Peligro sobre el lienzo** (`--peligro-sobre-lienzo`, #f28b82, 7,7:1) y su
  fondo de hover (`--peligro-sobre-lienzo-fondo`): la acción destructiva de la
  cabecera ("Dar de baja", "Abortar") y la prioridad crítica en la meta.
- Los textos secundarios sobre el lienzo usan `--sobre-navy-texto` (10,2:1) y
  el dato viejo `--sobre-navy-aviso` (11,1:1).

### Escena de Marineford (acceso y pantallas públicas)

- **Horizonte** (`--horizonte`, #2c4868): el resplandor del cielo al caer la
  noche detrás de la fortaleza.
- **Silueta** (`--silueta`, #050a14): la fortaleza y la muralla a contraluz.
- **Luz de la silueta** (`--silueta-luz`: `rgba(184, 194, 209, 0.38)`): las ventanas encendidas del cuartel.
- **Mar de noche** (`--mar-noche`, #070e1a): el mar al pie de la escena; el
  texto del pie del acceso va encima en `--sobre-navy-texto` (10,7:1).

### Papel oficial (superficies de datos)

- **Papel** (`--papel`, #f6f2e8): tarjetas, paneles, tablas, filtros,
  formularios, diálogos y avisos. `--superficie` apunta a él.
- **Papel 2** (`--papel-2`, #ede7d8): cabecera de tabla y hover de fila.
  `--superficie-2` apunta a él.
- **Borde de papel** (`--papel-borde`, #d3c9b3): el filete de cada hoja.
- **Campo** (`--superficie-campo`, #fff): el interior de los campos sigue en
  blanco sobre el papel, para que se lea dónde se escribe.
- Sobre el papel, la tinta conserva sus tokens: `--tinta` 14,1:1, `--tinta-2`
  6,3:1, `--tinta-3` 5,1:1 y `--navy` 14,0:1.

### Estructura

- **Navy de uniforme** (`--navy`, #14243b): acción principal sobre el papel,
  títulos de las hojas de aviso y texto de la acción principal de la
  cabecera.
- **Navy de cubierta** (`--navy-2`, #203958): hover de la acción principal,
  anillo de foco sobre el papel.
- **Navy profundo** (`--navy-profundo`, #0d1726): barra lateral, franja móvil
  y franja de `/reportar`.

### Autoridad

- **Galón dorado** (`--gold`, #c99d4c): filete del mando, subrayado de la
  pestaña activa, anillo de foco en la barra lateral y el 正義 del Almirante
  sobre el lienzo (7,4:1). Sobre papel o blanco no llega a 3:1, así que
  **nunca** se usa allí para texto ni para indicar foco.
- **Filete dorado** (`--gold-filete`): el borde tenue entre la barra lateral y
  el lienzo y el pie del panel de acceso. Es un borde, nunca texto.
- **Dorado tinta** (`--gold-tinta`, #8b6c37): dorado para texto sobre blanco
  (4,9:1). Sobre el papel no llega a AA (4,4:1): ahí se usa `--gold-oscuro`.
- **Dorado oscuro / fondo / borde** (`--gold-oscuro`, `--gold-fondo`,
  `--gold-borde`): la insignia de autoridad (`InsigniaEstado tono="autoridad"`),
  los montos de alto rango (`MontoBerries altoRango`) y el 正義 del Almirante
  sobre el papel (6,3:1).

### Neutros

- **Tinta** (`--tinta`, #182337): texto principal.
- **Tinta secundaria** (`--tinta-2`, #4a5a70): texto de apoyo, ayudas de campo.
- **Muted** (`--muted`, #718096): metadatos grandes o no esenciales. No pasa AA
  en texto pequeño: para ayudas y descripciones se usa `tinta-2`.
- **Tinta terciaria** (`--tinta-3`, #5a687d): placeholders. Es el gris más
  claro permitido para texto pequeño sobre el papel.
- **Borde de campo** (`--borde-campo`, #8592a5): contorno de campos editables.
- **Línea** (`--line`, #e4e9f0): bordes y separadores que no delimitan un
  control.
- **Fondo** (`--fondo`, #f3f5f8): ya no es el fondo de la aplicación; queda
  para campos de solo lectura y hovers neutros sobre el papel.
- **Selección** (`--seleccion`, #e6ecf5): fila resaltada, hover de botones
  fantasma y selección de texto.
- **Sobre navy** (`--sobre-navy-texto`, `--sobre-navy-linea`,
  `--sobre-navy-hover`, `--sobre-navy-pista`, `--sobre-navy-exito`,
  `--sobre-navy-aviso`): texto secundario, separadores, la pista de un
  indicador de progreso y estados en la barra lateral, la franja móvil, el
  panel de acceso y la cabecera sobre el lienzo. Nunca se usan sobre el papel.

### Semánticos

- **Error** (`--error`, `--error-fondo`, `--error-borde`): fallos que el
  usuario debe corregir o que impiden continuar.
- **Aviso** (`--aviso`, `--aviso-fondo`, `--aviso-borde`): situaciones que no
  son un error del usuario (cuenta bloqueada, servidor no disponible, conflicto
  de versión, criminal en búsqueda).
- **Éxito** (`--exito`, `--exito-fondo`, `--exito-borde`): resuelto a favor
  (capturado, verificado, operativo exitoso).
- **Info** (`--info`, `--info-fondo`, `--info-borde`): en preparación
  (planificado, pendiente de revisión).
- **Amenaza** (`--amenaza-bajo`, `--amenaza-medio`, `--amenaza-alto`,
  `--amenaza-pendiente`): exclusivos del nivel de amenaza. El color **base** es
  para marcas de gráficos en áreas grandes y para el filete de las filas de
  amenaza alta; el **texto** usa `--amenaza-*-tinta` sobre `--amenaza-*-fondo`
  (todas ≥ 4,5:1). El blanco sobre `--amenaza-medio` no llega a 3:1: nunca se
  escribe texto sobre el naranja base. Siempre van con etiqueta de texto y con
  la marca de barras de `BadgeAmenaza`.

### Reglas

**La regla del galón.** El dorado marca rango o institución. Si quitar el
dorado de un elemento no le quita significado, ese elemento no debía ser
dorado. El 正義 es blanco (o navy sobre el papel) para todos los cargos y
dorado solo para el Almirante.

**La regla del color con nombre.** Ningún estado depende solo del color: el
nivel de amenaza lleva etiqueta, un error lleva ícono y texto, y el Den Den
Mushi dormido va con "Sin conexión".

**La regla del papel.** Todo lo que se lee va en papel. Sobre el lienzo solo
van la cabecera de la página, las pestañas y los carteles del muro; cada
etiqueta bajo un cartel va en su propio trozo de papel.

Las pruebas de contraste de `src/styles.contraste.test.ts` leen los tokens de
`:root` y frenan cualquier par de texto del lienzo o del papel que baje de AA.

## Tipografía

**Orden oficial:** Anton (400). **Paneles:** Manrope (800). **Trabajo:** DM
Sans (400–700). **Kanji:** Yuji Syuku. **Cartel:** Playfair Display. Todas se
cargan desde Google Fonts, con `display=swap` y respaldo del sistema.

Carácter: Anton es la letra condensada y pesada de una orden del Cuartel
General, en mayúsculas; da el peso institucional y solo aparece en titulares
de página. Manrope pesada sigue siendo la voz de los paneles y las cifras; DM
Sans es la letra de los formularios y tablas, neutra y legible a tamaños
pequeños.

### Jerarquía

- **Orden** (Anton 400, `--titulo-orden` = `clamp(1.75rem, 1.2rem + 1.6vw,
2.5rem)`, 1.1, tracking 0.02em, mayúsculas, `--fuente-display`): el h1 de
  `PageHeader`, la introducción de `/reportar` y el título de las hojas de
  aviso (acceso denegado, 404). El acceso usa una versión mayor,
  `clamp(38px, 4.4vw, 60px)`. Una vez por pantalla.
- **Cifra** (Manrope 800, `--texto-cifra` = `clamp(30px, 4vw, 43px)`, 1.15):
  el total de un reporte o de una distribución. Una por pantalla.
- **Headline** (Manrope 800, 1.5rem): título de una pantalla de resultado
  sobre papel ("Reporte recibido").
- **Title** (Manrope 800, 19px): título de panel, de hoja o de formulario.
- **Body** (DM Sans 400, 15px, 1.6): texto corrido. Medida máxima de 65–75
  caracteres.
- **Label** (DM Sans 600, 13px): etiquetas de campo y botones.
- **Sello** (Manrope 800, 11px, tracking 0.32em, mayúsculas): leyendas
  institucionales cortas (la línea de los Cuatro Mares del acceso, "Error
  404"). No se usa como "etiqueta encima del título".
- **Kanji** (Yuji Syuku 400, `--fuente-kanji`): solo los dos glifos de 正義,
  dentro de `SelloJusticia`. Se carga con `&text=%E6%AD%A3%E7%BE%A9`, que
  descarga únicamente esos glifos (unos 2 KB).
- **Cartel** (Playfair Display, `--cartel-fuente`): solo dentro del cartel
  WANTED. Su hoja de estilos la importa `CartelWanted`, así que se descarga
  solo donde hay un cartel.

**Código** (`--fuente-codigo`, monoespaciada del sistema): solo para códigos
técnicos que se escriben a mano (el código del cartel en `/reportar`) y la
ruta pedida en el 404.

Los campos de formulario usan 16px como mínimo para que iOS no haga zoom al
enfocarlos. Las cifras de tablas y montos usan `font-variant-numeric:
tabular-nums`.

## Espaciado y layout

- Escala base de 8px (`--espacio`): 8, 16, 24, 32, 48. Más espacio encima de un
  título que debajo.
- Barra lateral navy de 232px (`--ancho-lateral`) a toda la altura; el
  contenido se centra hasta 1280px (`--ancho-contenido`) sobre el lienzo. Por
  debajo de 900px la barra se convierte en una franja navy superior de 56px
  con el botón de menú, y el menú se abre en un cajón lateral (`<dialog>`
  modal).
- Puntos de corte: 1000px, 900px (barra lateral), 760px y 410px. Todo debe
  funcionar a 320px de ancho sin desplazamiento horizontal.
- A 410px o menos el lienzo se simplifica: se ocultan la carta náutica y la
  gaviota en marca de agua (queda el color y la trama), el sello 正義 de la
  cabecera baja de 52 a 42px y el de las hojas de aviso de 76 a 60px.
- El acceso usa una composición dividida en escritorio: la escena de
  Marineford a la izquierda y el formulario en papel a la derecha. En móvil la
  escena se reduce a una franja superior.

## Elevación y profundidad

La profundidad se expresa con planos: el lienzo al fondo, las hojas de papel
encima y lo flotante (avisos, menús, diálogos) arriba de todo.

- **Sombra de papel** (`--sombra-papel`: `0 1px 2px rgba(3, 8, 18, 0.45),
0 14px 28px -16px rgba(3, 8, 18, 0.85)`): profunda y corta, como una hoja
  sobre la mesa. La llevan las superficies de papel que se apoyan en el lienzo
  (hojas, tablas, filtros, fichas de la tabla en el teléfono).
- **Sombra clavado** (`--sombra-clavado`: `0 2px 3px rgba(3, 8, 18, 0.6),
0 18px 30px -14px rgba(3, 8, 18, 0.95)`): el cartel clavado directo sobre el
  lienzo en el muro de búsqueda.
- **Sombra 1** (`--sombra`: `0 1px 3px rgba(20, 36, 59, 0.12)`): elementos que
  se separan dentro del papel.
- **Sombra 2** (`--sombra-2`: `0 18px 40px -18px rgba(13, 23, 38, 0.45)`): solo
  elementos flotantes que no son hojas (notificaciones). Los diálogos, que son
  una hoja de papel sobre el lienzo, llevan `--sombra-papel`.

**La regla de una sola hoja.** Papel sobre papel no se levanta: lo que cae
dentro de una `.ui-hoja` (tabla, paginación, estado vacío) pierde su sombra y
su marco. Si un elemento no flota ni se apoya en el lienzo, no lleva sombra.

## Formas

- Radio pequeño (`--radio-sm`, 4px): insignias, chips, contadores.
- Radio medio (`--radio`, 8px): campos, botones, alertas, tablas.
- Radio grande (`--radio-lg`, 14px): paneles.
- Píldora (`--radio-pildora`): solo `BadgeAmenaza`. El resto de insignias usa
  `--radio-sm`.
- El sello de la rosa (`SelloMarina`) es circular y el 正義 (`SelloJusticia`)
  es cuadrado con doble filete y un giro de −3°, como un timbre puesto a mano;
  ningún otro elemento imita esas formas como adorno.

## Movimiento

Motion de herramienta: rápido, con propósito y nunca en bucle sin motivo.

- `--ease-out`: `cubic-bezier(0.23, 1, 0.32, 1)` para entradas y respuestas.
- `--dur-corta`: 160ms (presión de botón, hover, color).
- `--dur-media`: 240ms (aparición de alertas, avisos, diálogos y el cajón).
- Botones: `scale(0.97)` al presionar.
- Una sola animación de autor por pantalla. En el acceso es el giro lento del
  anillo del sello mientras se verifican las credenciales (indica estado).
- **Den Den Mushi:** al llegar un cambio sincronizado, el caracol se sacude
  una vez (`llamando`, 600ms). Es la única animación del shell y nunca se
  repite en bucle.
- **Sin animaciones de fondo.** El lienzo, la carta, la trama, la gaviota y la
  escena de Marineford son estáticos.
- Muro de carteles: el cartel sube 3px al pasar el puntero y se reduce a 0,98
  al presionar.
- Animaciones de sistema (no cuentan como "de autor"): barra de carga
  superior, brillo de los skeletons, entrada de avisos (8px), diálogos
  (6px + escala 0,98) y cajón (24px). Todas con `--ease-out`, nunca en la
  carga de una página ni en cada elemento de una lista.
- `prefers-reduced-motion: reduce`: se eliminan desplazamientos, escalas,
  giros y la sacudida del Den Den Mushi; se conservan los cambios de opacidad,
  color y estado.
- Hover con movimiento solo dentro de `@media (hover: hover) and (pointer:
fine)`.

## Componentes

Todos viven en `src/shared/ui/` (salvo el shell y los emblemas, en
`src/core/layout/`) y sus estilos en `src/shared/ui/ui.css`, que se carga una
vez desde `main.tsx`. Las clases llevan el prefijo `ui-` para no chocar con
las heredadas de la v1. Una
feature **no** redefine estos componentes ni sus clases: si necesita una
variante, se agrega aquí.

### Shell (core/layout)

- **Lienzo** (`LienzoMarina`): capas fijas detrás del contenido, de abajo
  hacia arriba: el degradado de `--lienzo` a `--lienzo-2`; la carta náutica
  (rumbos punteados, una rosa de los vientos grande, la franja de la Grand
  Line en diagonal y la Red Line en vertical, en `--tinta-carta`); la trama de
  tinta, que se intensifica hacia los bordes; y la gaviota en marca de agua
  abajo a la derecha (`--marca-agua`). Es un SVG `position: fixed`, decorativo
  (`aria-hidden`), sin eventos de puntero y sin animación. A 410px o menos se
  ocultan la carta y la gaviota.
- **Barra lateral** (escritorio): navy profundo, a toda la altura, con un
  filete dorado (`--gold-filete`) que la separa del lienzo. Arriba, la marca
  (gaviota de 40px en dorado + "MARINA / Cuartel General"); en medio, la
  navegación; abajo, el estado del canal, el usuario (nombre, cargo y base) y
  "Cerrar sesión". El foco dentro de la barra es dorado.
- **Navegación:** agrupada como se organiza el cuartel: _Archivo criminal_
  (Criminales, Carteles, Recompensas), _Inteligencia_ (Avistamientos,
  Amenaza), _Flota_ (Operativos, Incidentes) y _Mando_ (Administración). Cada
  entrada lleva un ícono propio de trazo. La activa: fondo `navy-2`, texto
  blanco 600. Solo aparecen las entradas que el rol puede abrir; la tabla única
  está en `core/session/navegacion.ts` y alimenta también el guard raíz de cada
  feature y la pantalla de llegada por rol.
- **Franja móvil** (< 900px): navy profundo, 56px, botón de menú de 44px,
  marca compacta (gaviota de 32px) y el indicador del canal. El menú se abre
  en un `<dialog>` modal desde la izquierda (Esc, clic fuera y foco atrapado
  los pone el navegador) y se cierra al navegar.
- **Indicador del canal:** el Den Den Mushi de 22px y el estado con texto: "En
  vivo" (ojos abiertos, `--sobre-navy-exito`), "Actualiza cada 10 s" o
  "Conectando…" (`--sobre-navy-texto`) y "Sin conexión, reintentando"
  (dormido, con su "z", en `--sobre-navy-aviso`). El texto nunca se quita: el
  caracol acompaña, no informa solo.
- **Avisos flotantes:** abajo a la derecha (abajo a todo el ancho en móvil),
  papel, `--sombra-2`, ícono del tipo (el Den Den Mushi en los informativos)
  y botón de cerrar. Los publica `notificar.exito/info/error` de
  `core/services/notification.store`. Los errores HTTP ya los publica el
  interceptor: una pantalla no repite el aviso.
- **Acceso denegado:** lo pinta `RequirePermiso` en el lugar de la página,
  dentro del shell, como una hoja de orden oficial: la gaviota y el 正義
  grande (`InsigniasAviso`), el título en display, el cargo del usuario y el
  enlace a su panel.
- **Página no encontrada** (`PaginaNoEncontrada`): una dirección que no existe
  se resuelve dentro del shell, no redirige al inicio. Misma hoja que el acceso
  denegado, con "Error 404", "Esta página no existe", la ruta pedida en
  `<code>` para revisar el enlace y "Ir a mi panel".

### Emblemas del universo (core/layout/emblemas)

Viven en `core/` porque los usan el shell, el acceso y los guards, y `core/`
no depende de `shared/`. Todos son SVG decorativos (`aria-hidden="true"` y
`focusable="false"`), toman `currentColor` y el CSS decide el tono según el
fondo.

| Componente          | Qué es                                                                                                                              | Dónde                                                                                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EmblemaGaviota`    | La gaviota de la Marina sobre dos ondas. `variante="silueta"` (llena) o `"linea"` (trazo con plumas).                               | Marca de la barra lateral y la franja, marca de agua del lienzo, acceso, `/reportar`, hojas de aviso y favicon (`public/favicon.svg` reutiliza el mismo trazado). |
| `SelloJusticia`     | 正義 a pincel en columna, en un sello cuadrado de doble filete. `tono="blanco"` o `"dorado"`; `tamano="md"` (52px) o `"lg"` (76px). | Cabecera de página (`md`), acceso, `/reportar` y hojas de aviso (`lg`). Dorado solo si `useEsRol(RolCodigo.ALMIRANTE)`.                                           |
| `DenDenMushi`       | El caracol de comunicaciones. `estado`: `vivo`, `dormido` (ojos cerrados y "z") o `llamando` (sacudida breve).                      | Indicador del canal y avisos flotantes informativos.                                                                                                              |
| `SiluetaMarineford` | La fortaleza del Cuartel General con el 正義 en la fachada, la muralla de la bahía y el mar nocturno, a contraluz.                  | Escena del acceso y el MFA. El mar y el resplandor se extienden fuera del viewBox.                                                                                |
| `SelloMarina`       | El sello de la rosa de los vientos y el ancla, con doble anillo dorado.                                                             | Pieza secundaria: el pie del acceso, donde su anillo gira mientras se verifican las credenciales.                                                                 |

### Cabecera de página — `PageHeader`

Es la orden del Cuartel General y va directa sobre el lienzo. Anatomía:
enlace de regreso opcional (pantallas de detalle, en `--sobre-navy-texto`) →
`SelloJusticia` a la izquierda del título, alineado con su primera línea →
título h1 (Anton, `--titulo-orden`, mayúsculas, `--sobre-lienzo`) → una frase
de descripción (`--sobre-navy-texto`) → línea de meta (`ActualizadoHace`,
insignias; el dato viejo en `--sobre-navy-aviso`) → acciones a la derecha (en
móvil se apilan a todo el ancho). Uno por página. **Sin kicker**: no hay
etiqueta en mayúsculas encima del título.

- Las insignias de la meta traen su propio fondo de papel; la prioridad pasa a
  los tonos del lienzo (la crítica en `--peligro-sobre-lienzo`).
- Acciones sobre el lienzo: la principal es blanca con texto navy (hover
  `--papel`); la secundaria, contorno blanco; la de peligro sutil, contorno y
  texto `--peligro-sobre-lienzo` con su fondo tenue al pasar el puntero.
- El foco dentro de la cabecera es un anillo blanco de 2px.

### Pestañas de sección — `PestanasSeccion`

Las secciones de una feature (Distribución · Tendencias · Criterios; Historial
· Solicitar · Validación · Reporte por mar; Avistamientos · Reportes
ciudadanos; Usuarios · Mares, zonas y bases · Bitácora) usan un único
componente: `secciones: { a, etiqueta, contador? }[]`, clase `.ui-pestanas`.

- Siempre **debajo** del `PageHeader` y, como él, sobre el lienzo; nunca
  encima del título ni del enlace "volver". Las fichas (un usuario, un
  operativo) no llevan pestañas.
- Solo las secciones que el cargo puede abrir; con una sola, no se pinta.
- Inactivas en `--sobre-navy-texto`; la activa en blanco 700 con subrayado
  dorado de 2px. Foco blanco. Hover solo con puntero fino.
- `contador` (reportes por revisar) en una cifra tintada, con 99+ como tope;
  se nombra para el lector con `contadorEtiqueta`.
- En el teléfono la fila no se envuelve: se desplaza en horizontal.

### Botones — `Boton`, `BotonEnlace`, `BotonIcono`

- **Principal** (`variante="principal"`): navy, texto blanco. La acción de la
  pantalla; uno por vista.
- **Secundario** (por defecto): blanco con borde `borde-campo` y texto `tinta`.
  Exportar, cancelar, reintentar.
- **Peligro:** fondo `error`. **Solo** el botón que confirma lo irreversible
  dentro de un `DialogoConfirmacion` (o de un diálogo de rechazo).
- **Peligro sutil** (`variante="peligro-sutil"`): contorno `error-borde` con
  texto `error`. La acción destructiva en una cabecera ("Dar de baja",
  "Abortar", "Marcar disuelta"): se ve, pero no compite con la principal. Abre
  la confirmación, que es donde aparece el rojo sólido.
- **Fantasma:** sin fondo, texto `navy-2`. Acciones terciarias en tablas y
  barras ("Limpiar filtros").
- **Autoridad:** navy con filete dorado. **Solo** validar una recompensa de alto
  rango o una decisión de rango. Si quitarle el dorado no le quita significado,
  es un botón principal.
- Tamaños: normal (44px de alto, área táctil) y compacto (36px, dentro de
  tablas, alertas y paginación).
- **Cargando:** `cargando` + `textoCargando` ("Guardando…"): se deshabilita,
  conserva el ancho y nombra la acción.
- `BotonEnlace` es un `<Link>` con forma de botón para acciones que navegan.
  `BotonIcono` es de solo ícono, 40px, con `etiqueta` obligatoria (es su nombre
  accesible y su tooltip).
- `type="button"` por defecto. Presionado `scale(0.97)`; hover solo con puntero
  fino.
- Sobre el papel y en los diálogos los botones conservan su aspecto; solo
  dentro de la cabecera de página toman los tonos del lienzo (ver
  `PageHeader`).

### Campos — `CampoTexto`, `CampoSelect`, `CampoAreaTexto`, `Campo`

- Anatomía: etiqueta visible (13px 600) → control → ayuda (13px `tinta-2`) →
  error (13px `error` con ícono). Ayuda y error van enlazados con
  `aria-describedby`; el error marca `aria-invalid`.
- Control: fondo `superficie-campo` (blanco sobre el papel), borde
  `borde-campo`, radio 8px, 44px de alto, **16px** de texto (iOS no hace
  zoom). Foco: anillo `navy-2` de 2px con 2px de separación. Solo lectura o
  deshabilitado: fondo `fondo`.
- Obligatorio: asterisco en `error` (oculto al lector; el control lleva
  `required`).
- `CampoSelect` es nativo (en el teléfono abre el selector del sistema) con
  flecha dibujada; acepta `opciones`, `opcionVacia` ("Todos") e hijos para
  `<optgroup>` (zonas agrupadas por mar).
- `CampoAreaTexto` admite `contador` ("120 / 500") si hay `maxLength`.
- `Campo` es el marco suelto para controles propios (subir foto, casillas):
  recibe los ids por función.
- Un `aria-describedby` pasado desde fuera se **suma** al de ayuda y error del
  campo; no lo sustituye.
- **`CampoZona`**: el campo "Zona" de todo el sistema, con las zonas
  agrupadas por mar (`<optgroup>`) en el orden del mapa. `OpcionesZona` son
  esas mismas opciones para un `CampoSelect` que ya tiene otras;
  `useNombreZonaConMar()` escribe "Loguetown · East Blue".
- **`SelectorCriminal`**: elegir un criminal en un formulario. Buscador por
  nombre o alias contra el archivo criminal (`soloActivos` para objetivos y
  recompensas nuevas) y, una vez elegido, su ficha corta: retrato, tipo,
  estado, amenaza y recompensa vigente, con "Cambiar". Lo encontrado alimenta
  el directorio compartido (`core/directorio`).
- Formularios: `ui-form-grilla` (dos columnas; una en móvil;
  `claseContenedor="ui-campo--ancho"` ocupa la fila) y `ui-form-acciones`
  (pie con las acciones a la derecha y filete superior).

### Barra de filtros — `BarraFiltros`

Una hoja de papel con radio grande sobre el listado. Arriba, el buscador
(lupa, "Buscar por nombre o alias…", botón para borrar); debajo, los
`CampoSelect` de filtro en una grilla que se envuelve; al pie, el resumen
("134 criminales") y "Limpiar filtros" solo si hay filtros activos. En móvil
los filtros se pliegan tras "Filtros (n)"; a 410px o menos el buscador ocupa
todo el ancho y "Filtros" baja a su propia línea. La grilla usa
`auto-fit, minmax(10rem, 1fr)`: a 1440px no queda un filtro huérfano en una
segunda fila. La búsqueda por texto consulta al
terminar de escribir con `useValorDiferido(texto, 350)`. El mapa geográfico
manda: el filtro de zona agrupa por mar en el orden East, West, North, South
Blue y Grand Line (`useCatalogos()` ya los entrega así).

### Tabla de datos — `TablaDatos`

- Densa: filas de 14px con 10 × 12px de relleno, cabecera `superficie-2`
  (papel 2) en 12px 600 `tinta-2`, separadores `line`, `--sombra-papel` sobre
  el lienzo (sin sombra dentro de una `.ui-hoja`). Cifras y montos
  (`numerica`) a la derecha con números tabulares.
- Una columna `principal` por tabla: identifica la fila y lleva el `<Link>` al
  detalle. No hay filas enteras clicables.
- Por debajo de 760px cada fila se vuelve una ficha: la columna principal
  arriba y el resto como pares etiqueta/valor en dos columnas, también a 410px:
  los datos cortos (tipo, amenaza, estado) van de dos en dos y los largos
  (`ancha`: relato, lugar, motivo) ocupan la fila. `ocultarEnMovil` retira
  datos secundarios. Nunca hay scroll horizontal en el
  teléfono.
- Estados incluidos: primera carga con filas esqueleto, recarga atenuada sin
  vaciar (`actualizando`), error con "Reintentar" (si había datos, se conservan
  y el error va arriba) y vacío (lo que se pase en `vacio`).
- `claseFila` para matices de fila (criminales dados de baja en `tinta-2`).
  `fila-amenaza-alta` pone un filete de 3px en `--amenaza-alto` en el borde
  izquierdo de la fila (en el teléfono, en el borde de la ficha). Es
  decorativo: la etiqueta de amenaza sigue en la fila.
- Si `claveFila` repitiera una clave, las repetidas se desambiguan con su
  índice (React no mezcla filas).
- **`CeldaCriminal`**: el criminal de una fila cuando la respuesta solo trae
  su id (recompensas, validación). Retrato, nombre con enlace a la ficha y
  alias; esqueleto mientras llega y "Criminal no disponible" si no se puede
  leer. Nunca muestra el id crudo.
- **`TextoRecortado`**: todo texto que puede no caber (alias, correos,
  relatos, subtítulos de una fila) se recorta con elipsis (`lineas` para 2 o
  más) y lleva el texto entero en el `title`.

### Paginación — `Paginacion`

Debajo de la tabla: "21–40 de 134 criminales" a la izquierda; "Anterior",
"Página 2 de 7" y "Siguiente" a la derecha. Con una sola página solo cuenta; sin
datos no aparece. Consume el `meta` que devuelve `apiClient.getPage`
(`page`, `limit`, `total`, `totalPages`, `hasNext`; el backend pagina de 20 en
20 y acepta hasta 100).

### Insignias

| Componente             | Forma                                                                           | Cuándo                                                                                                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BadgeAmenaza`         | Píldora tintada + barras (1, 2 o 3 llenas; vacías si sin clasificar) + etiqueta | Nivel de amenaza, en toda la app. Nunca otro componente pinta un nivel.                                                                                                                                              |
| `InsigniaTipoCriminal` | Chip de papel de radio 4px con borde `line`, ícono propio y nombre              | Pirata (Jolly Roger: calavera con huesos cruzados), Ejército Revolucionario (antorcha), Organización independiente (eslabones). Sin afiliación: borde discontinuo. Comparten tinta navy: son categorías, no niveles. |
| `InsigniaEstado`       | Chip tintado de radio 4px con marca de forma propia por tono                    | Estados de cada feature (operativo, recompensa, verificación, resultado).                                                                                                                                            |

Tonos de `InsigniaEstado` (la feature mapea sus estados; el sistema pone la
forma):

| Tono        | Marca            | Ejemplos                                                |
| ----------- | ---------------- | ------------------------------------------------------- |
| `neutro`    | círculo lleno    | histórica, fallecido, archivado                         |
| `info`      | círculo hueco    | planificado, pendiente de revisión                      |
| `aviso`     | rombo            | en búsqueda, en curso, pendiente de validación, parcial |
| `exito`     | visto            | capturado, verificado, aprobado, exitoso                |
| `peligro`   | aspa             | abortado, descartado, rechazado, fracaso                |
| `autoridad` | estrella, dorado | vigente validada por el Almirante                       |

`enCurso` agrega un anillo a la marca para estados que cambian en vivo
(operativo `EN_CURSO`).

### Datos

- **`ActualizadoHace`:** "Actualizado hace 3 min" con `<time>` y la fecha
  exacta en el tooltip. Se refresca con un reloj compartido de 15 s.
  `umbralViejo` (segundos) lo pasa a tono aviso cuando el dato pudo quedar
  atrás. Va en la meta de `PageHeader`, en tarjetas del tablero y en fichas.
- **`MontoBerries`:** monto con números tabulares y "฿". `abreviado` en tablas
  ("3 MM ฿", el completo en el tooltip y para el lector); `altoRango` en dorado
  oscuro cuando la feature decide que el monto es de rango; `tamano="grande"`
  para el monto protagonista de una ficha.
- **`RetratoCriminal`:** foto cuadrada de expediente (32, 48, 96 o 160px
  `xl`, la columna de identificación de la ficha; radio 4px, 8px desde 96;
  borde `line`). Sin foto o si no carga: iniciales en `navy-2` sobre
  `seleccion`. `marco="cartel"` le pone el marco de un cartel (papel
  `--cartel-papel` con un claro radial, filete `--cartel-marco` y relleno de
  2px, 4px desde 96): lo usan el listado de criminales y `CeldaCriminal`. Es
  decorativo; en el listado no se arman carteles en miniatura, para no perder
  densidad.

- **`MarcaPrioridad`:** prioridad como galones de manga (1 a 4 llenos sobre 4)
  con su etiqueta; la crítica en tinta de error. La comparten operativos e
  incidentes.
- **`BarrasHorizontales`:** barras de una serie en HTML (navy, o el color de
  amenaza si la agrupación es por nivel), valor en la punta, detalle en el
  `title` y en texto para el lector. `separada` abre un grupo con filete
  discontinuo (la Grand Line frente a los Cuatro Mares).
- **Cifra protagonista** (`--texto-cifra`, `clamp(30px, 4vw, 43px)`): el total
  de un reporte o de una distribución. Una por pantalla.
- **`BotonesExportar`:** "Exportar PDF" y "Exportar CSV". Con
  `motivoDeshabilitado` (`motivoSinExportar({ error, cargado, vacio })`) se
  deshabilitan y explican por qué: nunca se exporta una consulta fallida ni una
  pantalla vacía.

### Estados — `EstadoVacio`, `EstadoError`, `EstadoSinPermiso`, `EstadoCargando`, `Skeleton`

- Bloque centrado sobre papel con borde `papel-borde`: ícono de 28px en un
  cuadro de 56px, título Manrope 800 en navy (dice qué pasa, en positivo),
  detalle en `tinta-2` (por qué o qué hacer) y acciones. Nunca va directo
  sobre el lienzo.
- `variante="bloque"` suelto o en una tabla; `"pantalla"` ocupa el área de
  contenido; `"en-panel"` dentro de un panel que ya tiene borde y fondo (sin
  marco propio: nunca una tarjeta dentro de otra).
- `EstadoError` elige el texto según el `ApiError` (sin red, 403, 404, 5xx) y
  ofrece "Reintentar", salvo en un 404: reintentar no trae de vuelta lo que no
  existe. En las fichas lleva `volver` ("Volver a Criminales").
- Si la pantalla pinta el error en línea, la petición va con `sinAviso: true`
  (o `sinAviso: "conflicto"` en las escrituras que resuelven el 409 con
  `AlertaConflicto`): el aviso flotante repetiría lo mismo encima del
  contenido.
- En un vacío cuya acción ya está en la cabecera, el botón del vacío es
  secundario: una sola acción principal por vista.

### Avisos flotantes

Los publica `notificar` (interceptor HTTP, stores). Como máximo **tres** a la
vez (el cuarto retira el más antiguo) y el mismo aviso repetido no se apila:
reinicia su tiempo. Errores 8 s, el resto 4 s.

- `EstadoCargando` es el esqueleto de una página de listado y el fallback de las
  rutas lazy. `Skeleton` sueltos para fichas y tarjetas.

### Hoja de papel — `.ui-hoja`

Una sección con título propio que va sobre el lienzo (la tabla de miembros de
una organización, las bases de un operativo, un subtítulo con su tabla): el
título y su contenido comparten una sola hoja de `--papel` con filete
`--papel-borde`, radio grande y `--sombra-papel`. Lo que cae dentro no vuelve a
levantarse (sin papel sobre papel). `--hoja-relleno` es su relleno lateral e
inferior (24px; 16px en el teléfono): una lista a sangre lo resta con margen
negativo.

### Alertas en línea — `Alerta`, `AlertaConflicto`

- Fondo tintado del tono, borde de 1px del mismo tono, ícono, título breve y
  explicación con la salida; acciones opcionales a la derecha. No llevan borde
  lateral grueso.
- `error` y `aviso` se anuncian (`role="alert"`); `exito` e `info` como
  `status`.
- `AlertaConflicto`: el 409 de versión ("Otra base modificó este registro
  mientras lo editabas") con "Ver la versión actual". `esConflictoDeVersion(e)`
  lo detecta.
- La pantalla de acceso conserva su propia `AlertaAcceso` (misma anatomía).

### Diálogo — `Dialogo`, `DialogoConfirmacion`

- `<dialog>` nativo: velo `--velo`, panel de papel de radio 14px y `--sombra-papel`,
  520px (760px `amplio`). En móvil sube desde abajo como hoja a todo el ancho.
- Anatomía: título (Manrope 800, 19px), descripción, cuerpo y acciones a la
  derecha con la principal al final. La X se pinta en la esquina pero va la
  última en el orden de tabulación.
- Foco al abrir: lo marcado con `data-autofocus`; si no, el primer control
  del cuerpo; si no, el primer botón del pie ("Cancelar" en una confirmación
  peligrosa). Al cerrar, o si el padre lo desmonta abierto, vuelve a quien lo
  abrió.
- Las acciones quedan pegadas abajo (sticky, fondo de papel y filete superior):
  en un formulario largo o en el teléfono no se van bajo el pliegue.
- Solo para tareas que necesitan interrumpir: confirmar algo irreversible o un
  formulario corto sin pantalla propia.
- `DialogoConfirmacion`: el título es la pregunta con el objeto ("¿Abortar el
  operativo OP-0042?"), el mensaje es la consecuencia y el botón dice el verbo
  ("Abortar operativo"), nunca "Aceptar". Mientras confirma, se bloquea; si
  falla, queda abierto. `variante`: `principal`, `peligro` (o `peligroso`) y
  `autoridad` (solo validaciones de rango).

### Íconos

SVG en `shared/ui/iconos.tsx` (y los del shell en `core/layout/iconos-shell.tsx`):
caja de 24, trazo 1.75, extremos redondeados, `currentColor`, decorativos
(`aria-hidden`). Ningún carácter Unicode ni emoji hace de ícono. Los motivos
del universo (Jolly Roger, gaviota, Den Den Mushi) siguen la misma regla: son
SVG del repo con el trazo del sistema, sobrios, sin caras sonrientes ni
colores de cómic.

### Sellos

- **`SelloJusticia` (正義):** el sello de la orden. Va en la cabecera de cada
  página, en el acceso, en `/reportar` y en las hojas de aviso. Blanco sobre el
  lienzo y navy sobre el papel para todos los cargos; dorado (`--gold` sobre el
  lienzo, `--gold-oscuro` sobre el papel) solo para el Almirante. Es
  decorativo: el título de la pantalla ya nombra lo que hay.
- **`SelloMarina`:** el emblema de la rosa de los vientos de ocho puntas y el
  ancla, con doble anillo dorado y la leyenda "MARINA · CUARTEL GENERAL". Desde
  que la gaviota es el emblema principal, queda como pieza secundaria en el pie
  del acceso. Por debajo de 64px se usa `simple` (sin leyenda).

### Cartel WANTED — `CartelWanted`

La pieza estrella: papel envejecido, tipografía display con serifa, "DEAD OR
ALIVE", recompensa en berries con su símbolo y foto enmarcada. Vive en
`shared/ui` (con `shared/ui/cartel.css` y la lectura de la instantánea en
`shared/utils/cartel.ts`) porque lo pintan `carteles` y la ficha de
`criminales`. Su paleta de papel y tinta son los tokens `--cartel-*` de
`styles.css`.

**Tokens:**

| Token                     | Valor                                | Uso                                          |
| ------------------------- | ------------------------------------ | -------------------------------------------- |
| `--cartel-papel`          | #e9d6aa                              | Fondo del papel                              |
| `--cartel-papel-claro`    | #f3e6c4                              | Zona central más clara y fondo del marco     |
| `--cartel-mancha`         | rgba(140, 96, 38, 0.16)              | Manchas de humedad (degradados radiales)     |
| `--cartel-quemado`        | rgba(96, 60, 22, 0.5)                | Bordes envejecidos (sombra interior)         |
| `--cartel-tinta`          | #2a1c0f                              | Texto principal (más de 12:1 sobre el papel) |
| `--cartel-tinta-2`        | #5a4026                              | Alias, afiliación, texto legal (≈6,5:1)      |
| `--cartel-marco`          | #3b2915                              | Marco de la foto                             |
| `--cartel-sello`          | #8e2317                              | Sello CAPTURADO / FALLECIDO (≈6:1)           |
| `--cartel-sombra`         | 0 16px 32px -14px rgba(42,28,15,.55) | La pieza colgada en la vista de un cartel    |
| `--cartel-fuente`         | Playfair Display, Georgia, serif     | Toda la tipografía del cartel                |
| `--cartel-fuente-simbolo` | Georgia, Times New Roman, serif      | El símbolo ฿ (Playfair no lo dibuja)         |

Fuera del cartel, solo el marco de `RetratoCriminal marco="cartel"` usa
`--cartel-papel`, `--cartel-papel-claro`, `--cartel-marco` y `--cartel-tinta`.

**Anatomía**, de arriba abajo: "WANTED" (Playfair 900, el elemento más grande)
→ foto en marco doble de tinta → "DEAD OR ALIVE" entre filetes → nombre en
mayúsculas → alias en cursiva → recompensa con "฿" y el guion final de los
carteles de la Marina ("1.500.000.000-") → afiliación con su tipo → texto legal
→ pie con "MARINA" y la versión ("V3 · 12 nov 2026"). Proporción 5:7.

**Dónde aparece:**

- **Vista de un cartel** (`/carteles/:id`): protagonista, con sus versiones,
  descarga, impresión y "Reportar avistamiento".
- **Ficha del criminal:** el cartel oficial vigente (la instantánea emitida)
  junto a la identificación, con su versión, el motivo, cuándo se emitió y
  "Ver cartel y versiones". Si no hay cartel emitido, o no se puede leer, un
  hueco con "Sin cartel emitido" y el enlace a emitirlo; la ficha nunca se
  rompe por el cartel.
- **Tablón** (`/carteles`): el muro de búsqueda (ver "Pantallas con
  tratamiento especial").

**Reglas:**

- Escala con su contenedor (`container-type: inline-size` y unidades `cqi`):
  la misma pieza es miniatura en el tablón, protagonista en la vista de un
  cartel y media hoja al imprimir.
- Lo que se pinta es la **instantánea** de la versión (`datos` del cartel), no
  el criminal actual. La única excepción es la miniatura del tablón, que avisa
  que es una vista previa.
- Nombres, alias largos y montos de diez cifras bajan de cuerpo en dos
  escalones; nunca desbordan ni se cortan. En la miniatura del tablón el alias
  se limita a dos líneas con el texto entero en el `title`.
- "Reportar avistamiento" en la vista del cartel lleva al formulario público
  (`/reportar?criminal=<id>`), el mismo del enlace impreso. Ahí el ciudadano
  no ve el código interno: lee "el criminal del cartel que escaneaste".
- Sin foto: busto en silueta dibujado, nunca un ícono genérico.
- Si el criminal no está activo, sello en tinta roja girado −14°
  ("CAPTURADO" o "FALLECIDO"), con `mix-blend-mode: multiply`.
- El grano del papel es ruido SVG (`feTurbulence`) multiplicado; no se usan
  imágenes de textura.

## Pantallas con tratamiento especial

- **Acceso y MFA:** la pantalla más cinematográfica. Dos zonas: a la izquierda
  la escena (`SiluetaMarineford` sobre `--horizonte` y `--mar-noche`, la
  gaviota en línea, el 正義 grande, "Marina" en display y, al pie, el
  `SelloMarina` con los Cuatro Mares y la Grand Line); a la derecha el
  formulario en una hoja de papel. En el teléfono la escena se reduce a una
  franja superior.
- **Acceso denegado y 404:** hojas de orden oficial dentro del shell, con la
  gaviota y el 正義 grande (ver Shell).
- **Carteles (tablón):** el lienzo se convierte en un muro de búsqueda. Los
  carteles van clavados directo sobre el lienzo, sin un panel de papel detrás,
  con `--sombra-clavado` y una inclinación alterna de ±0,6°. La rotación vive
  en el enlace, así el anillo de foco (blanco, 3px, separado 5px) y el área de
  toque la siguen. Lo que se lee bajo cada cartel va en una etiqueta de papel.
  La barra de filtros, la paginación y los estados vacío o de error siguen en
  papel, como franjas propias encima y debajo del muro; no hay variantes
  oscuras de componentes compartidos.
- **Formulario público `/reportar`:** el ciudadano ve la Marina de frente: una
  franja navy profundo con la gaviota, "Marina · Línea de reportes
  ciudadanos" y el 正義; la introducción en display sobre el lienzo y el
  formulario claro y simple en una hoja de papel.

## Datos que cambian entre bases

- Toda pantalla con datos compartidos muestra cuándo se consultaron
  (`ActualizadoHace` en la meta del `PageHeader`) y se actualiza sola con
  `useCambiosSincronizados([...eventos], recargar)` de `core/sync`.
- Ante un 409 de concurrencia: `AlertaConflicto` y nunca sobrescribir en
  silencio.
- El canal se nombra en el shell; una pantalla no pinta su propio "en vivo".

## Estados

Cada pantalla diseña sus cuatro estados antes de darse por terminada:

- **Vacío:** `EstadoVacio` con un título que dice qué falta y, si existe, la
  acción para crearlo. Si el vacío viene de los filtros, el texto lo dice y la
  salida es limpiar filtros. Nunca una tabla vacía sin explicación.
- **Carga:** skeletons con la forma del contenido (`TablaDatos cargando`,
  `EstadoCargando`, `Skeleton`); un indicador en línea para acciones (botón
  "Guardando…"). La barra superior (`.barra-carga`) indica peticiones en vuelo.
  Nunca un spinner en el centro del contenido.
- **Error:** `EstadoError` o `Alerta` con el problema y la salida. Los errores
  de red dicen que el servidor no respondió y permiten reintentar sin perder lo
  escrito.
- **Sin permiso:** la ruta protegida con `RequirePermiso` muestra que el cargo
  no tiene acceso y a dónde ir, sin dejar al usuario en una pantalla en blanco.
  Dentro de una página, `EstadoSinPermiso`. Las acciones que el rol no puede
  hacer no se muestran (`useHasPermission`); las que el backend ata a un rol y
  no a un permiso (editar criterios de amenaza) se ocultan con `useEsRol`.

## Lo que sí y lo que no

### Sí

- **Sí** usar los tokens de `:root`; nunca un color, sombra o radio suelto.
- **Sí** poner todo lo que se lee en papel; sobre el lienzo, solo la cabecera,
  las pestañas y los carteles del muro.
- **Sí** reservar el dorado para rango, autoridad y el mando; el 正義 dorado
  solo para el Almirante.
- **Sí** usar los motivos del universo con sobriedad: la gaviota, el 正義, el
  Den Den Mushi, el Jolly Roger, la carta de la Grand Line y el cartel WANTED,
  cada uno donde informa o da identidad.
- **Sí** escribir en el idioma de la Marina: "base naval", "operativo",
  "avistamiento", "recompensa en berries".
- **Sí** distinguir Pirata, Ejército Revolucionario y Organización criminal
  independiente con insignia propia y texto.
- **Sí** mostrar cuándo se actualizó un dato que se sincroniza entre bases.
- **Sí** comprobar el foco sobre los dos planos: blanco en el lienzo, navy en
  el papel, dorado en la barra lateral.

### No

- **No** texto de lectura directo sobre el lienzo, ni tablas o formularios
  oscuros: las variantes oscuras de componentes compartidos no existen.
- **No** fan page ni cosplay: stickers, personajes sonrientes, capturas del
  anime como fondo, colores chillones o fuentes de cómic.
- **No** manga en todo: viñetas de borde grueso o líneas de velocidad en
  tablas y formularios.
- **No** animaciones de fondo constantes ni en el lienzo ni en la escena del
  acceso.
- **No** gradientes morado-azul, glassmorphism decorativo ni texto con
  degradado.
- **No** emojis ni caracteres Unicode como íconos: los íconos son SVG con un
  mismo trazo.
- **No** tarjetas dentro de tarjetas (ni papel sobre papel), ni grillas de tres
  tarjetas iguales con ícono, título y texto.
- **No** la sombra genérica `0 4px 12px rgba(0,0,0,.1)` repetida en todo.
- **No** bordes redondeados excesivos ni píldoras fuera de insignias.
- **No** texto gris claro sobre gris (`muted` no se usa en texto pequeño).
- **No** etiquetas pequeñas en mayúsculas encima de los títulos (`PageHeader`
  ya no acepta `kicker`).
- **No** botones, campos, tablas o insignias propios en una feature: se usan los
  de `shared/ui`; si falta una variante, se agrega allí y se documenta aquí.
- **No** texto blanco sobre el naranja de amenaza media, ni el dorado como color
  de texto sobre blanco o papel (usa `--gold-oscuro`).
- **No** filas enteras clicables: el enlace va en la columna principal.
- **No** un modal donde basta una sección en línea.
- **No** dashboards con KPIs inventados ni copys de marketing ("Potencia tu
  flota…").
- **No** animaciones de entrada en cada elemento ni spinners eternos donde
  corresponde un skeleton.
- **No** Lorem ipsum ni datos de relleno sin marcar como tales.
- **No** más de unos 150 KB adicionales en la carga inicial por fuentes,
  SVG o imágenes de la identidad.
