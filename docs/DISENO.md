---
name: Marina · Gestión de Recompensas y Captura
description: Sistema de diseño "Cuartel General de la Marina" para el frontend web.
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
  tinta-3: '#66748a'
  muted: '#718096'
  borde-campo: '#8592a5'
  line: '#e4e9f0'
  fondo: '#f3f5f8'
  superficie: '#ffffff'
  superficie-2: '#f7f9fc'
  seleccion: '#e6ecf5'
  sobre-navy-texto: '#b8c2d1'
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
- **Dorado oscuro / fondo / borde** (`--gold-oscuro`, `--gold-fondo`,
  `--gold-borde`): la insignia de autoridad (`InsigniaEstado tono="autoridad"`)
  y los montos de alto rango (`MontoBerries altoRango`). El texto dorado sobre
  `--gold-fondo` usa siempre `--gold-oscuro` (5,6:1).

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
- **Superficie 2** (`--superficie-2`, #f7f9fc): cabecera de tabla y hover de
  fila. **Selección** (`--seleccion`, #e6ecf5): fila resaltada, hover de
  botones fantasma y selección de texto.
- **Sobre navy** (`--sobre-navy-texto`, `--sobre-navy-linea`,
  `--sobre-navy-hover`, `--sobre-navy-pista`, `--sobre-navy-exito`,
  `--sobre-navy-aviso`): texto secundario, separadores, la pista de un
  indicador de progreso y estados dentro de la barra lateral, la franja móvil
  y el panel de acceso. Nunca se usan sobre blanco.
- **Filete dorado** (`--gold-filete`): el filete tenue sobre navy del panel de
  acceso. Es un borde, nunca texto.

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
  para marcas de gráficos en áreas grandes; el **texto** usa `--amenaza-*-tinta`
  sobre `--amenaza-*-fondo` (todas ≥ 4,5:1). El blanco sobre `--amenaza-medio`
  no llega a 3:1: nunca se escribe texto sobre el naranja base. Siempre van con
  etiqueta de texto y con la marca de barras de `BadgeAmenaza`.

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

- **Display** (800, `--texto-cifra` = `clamp(30px, 4vw, 43px)`, 1.15,
  -0.04em): una vez por pantalla, como mucho. Paneles institucionales y cabeceras de sección grandes.
- **Headline** (800, 1.5rem): título de página (`PageHeader`).
- **Title** (800, 19px): título de panel o de formulario.
- **Body** (400, 15px, 1.6): texto corrido. Medida máxima de 65–75 caracteres.
- **Label** (600, 13px): etiquetas de campo y botones.
- **Sello** (800, 11px, tracking 0.32em, mayúsculas): leyendas institucionales
  cortas (el texto circular del sello, la línea de los Cuatro Mares). No se
  usa como "etiqueta encima del título".

**Código** (`--fuente-codigo`, monoespaciada del sistema): solo para códigos
técnicos que se escriben a mano (el código del cartel en `/reportar`).

Los campos de formulario usan 16px como mínimo para que iOS no haga zoom al
enfocarlos. Las cifras de tablas y montos usan `font-variant-numeric:
tabular-nums`.

## Espaciado y layout

- Escala base de 8px (`--espacio`): 8, 16, 24, 32, 48. Más espacio encima de un
  título que debajo.
- Barra lateral navy de 232px (`--ancho-lateral`) a toda la altura; el
  contenido se centra hasta 1280px (`--ancho-contenido`). Por debajo de 900px
  la barra se convierte en una franja navy superior de 56px con el botón de
  menú, y el menú se abre en un cajón lateral (`<dialog>` modal).
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
- Píldora (`--radio-pildora`): solo `BadgeAmenaza`. El resto de insignias usa
  `--radio-sm`.
- El sello institucional es circular; ningún otro elemento imita ese círculo
  como adorno.

## Movimiento

Motion de herramienta: rápido, con propósito y nunca en bucle sin motivo.

- `--ease-out`: `cubic-bezier(0.23, 1, 0.32, 1)` para entradas y respuestas.
- `--dur-corta`: 160ms (presión de botón, hover, color).
- `--dur-media`: 240ms (aparición de alertas, avisos, diálogos y el cajón).
- Botones: `scale(0.97)` al presionar.
- Una sola animación de autor por pantalla. En el acceso es el giro lento del
  anillo del sello mientras se verifican las credenciales (indica estado).
- Animaciones de sistema (no cuentan como "de autor"): barra de carga
  superior, brillo de los skeletons, entrada de avisos (8px), diálogos
  (6px + escala 0,98) y cajón (24px). Todas con `--ease-out`, nunca en la
  carga de una página ni en cada elemento de una lista.
- `prefers-reduced-motion: reduce`: se eliminan desplazamientos, escalas y
  giros; se conservan los cambios de opacidad y color.
- Hover con movimiento solo dentro de `@media (hover: hover) and (pointer:
fine)`.

## Componentes

Todos viven en `src/shared/ui/` (salvo el shell, en `src/core/layout/`) y sus
estilos en `src/shared/ui/ui.css`, que se carga una vez desde `main.tsx`. Las
clases llevan el prefijo `ui-` para no chocar con las heredadas de la v1. Una
feature **no** redefine estos componentes ni sus clases: si necesita una
variante, se agrega aquí.

### Shell (core/layout)

- **Barra lateral** (escritorio): navy profundo, a toda la altura. Arriba, la
  marca (sello simplificado de 40px + "MARINA / Cuartel General"); en medio, la
  navegación; abajo, el estado del canal, el usuario (nombre, cargo y base) y
  "Cerrar sesión".
- **Navegación:** agrupada como se organiza el cuartel: _Archivo criminal_
  (Criminales, Carteles, Recompensas), _Inteligencia_ (Avistamientos,
  Amenaza), _Flota_ (Operativos, Incidentes) y _Mando_ (Administración). Cada
  entrada lleva un ícono propio de trazo. La activa: fondo `navy-2`, texto
  blanco 600. Solo aparecen las entradas que el rol puede abrir; la tabla única
  está en `core/session/navegacion.ts` y alimenta también el guard raíz de cada
  feature y la pantalla de llegada por rol.
- **Franja móvil** (< 900px): navy profundo, 56px, botón de menú de 44px,
  marca compacta y el indicador del canal. El menú se abre en un `<dialog>`
  modal desde la izquierda (Esc, clic fuera y foco atrapado los pone el
  navegador) y se cierra al navegar.
- **Indicador del canal:** "En vivo", "Actualiza cada 10 s", "Conectando…" o
  "Sin conexión, reintentando". El estado se nombra con texto; el punto lo
  acompaña con forma propia (lleno, hueco o rombo).
- **Avisos flotantes:** abajo a la derecha (abajo a todo el ancho en móvil),
  superficie blanca, `--sombra-2`, ícono del tipo y botón de cerrar. Los publica
  `notificar.exito/info/error` de `core/services/notification.store`. Los errores
  HTTP ya los publica el interceptor: una pantalla no repite el aviso.
- **Acceso denegado:** lo pinta `RequirePermiso` en el lugar de la página, dentro
  del shell. Nombra el cargo del usuario y ofrece ir a su panel.

### Cabecera de página — `PageHeader`

Anatomía: enlace de regreso opcional (pantallas de detalle) → título h1
(Manrope 800, 1.5rem, navy) → una frase de descripción → línea de meta
(`ActualizadoHace`, insignias) → acciones a la derecha (en móvil se apilan a
todo el ancho). Uno por página. **Sin kicker**: no hay etiqueta en mayúsculas
encima del título.

### Pestañas de sección — `PestanasSeccion`

Las secciones de una feature (Distribución · Tendencias · Criterios; Historial
· Solicitar · Validación · Reporte por mar; Avistamientos · Reportes
ciudadanos; Usuarios · Mares, zonas y bases · Bitácora) usan un único
componente: `secciones: { a, etiqueta, contador? }[]`, clase `.ui-pestanas`.

- Siempre **debajo** del `PageHeader`, nunca encima del título ni del enlace
  "volver". Las fichas (un usuario, un operativo) no llevan pestañas.
- Solo las secciones que el cargo puede abrir; con una sola, no se pinta.
- Activa: filete navy de 2px y texto navy 700. Hover solo con puntero fino.
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

### Campos — `CampoTexto`, `CampoSelect`, `CampoAreaTexto`, `Campo`

- Anatomía: etiqueta visible (13px 600) → control → ayuda (13px `tinta-2`) →
  error (13px `error` con ícono). Ayuda y error van enlazados con
  `aria-describedby`; el error marca `aria-invalid`.
- Control: fondo blanco, borde `borde-campo`, radio 8px, 44px de alto, **16px**
  de texto (iOS no hace zoom). Foco: anillo `navy-2` de 2px con 2px de
  separación. Solo lectura o deshabilitado: fondo `fondo`.
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

Una superficie blanca con radio grande sobre el listado. Arriba, el buscador
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

- Densa: filas de 14px con 10 × 12px de relleno, cabecera `superficie-2` en
  12px 600 `tinta-2`, separadores `line`, `--sombra` sobre el fondo. Cifras y
  montos (`numerica`) a la derecha con números tabulares.
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

| Componente             | Forma                                                                           | Cuándo                                                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `BadgeAmenaza`         | Píldora tintada + barras (1, 2 o 3 llenas; vacías si sin clasificar) + etiqueta | Nivel de amenaza, en toda la app. Nunca otro componente pinta un nivel.                                                                                                                    |
| `InsigniaTipoCriminal` | Chip blanco de radio 4px con borde `line`, ícono propio y nombre                | Pirata (cráneo y tibias), Ejército Revolucionario (antorcha), Organización independiente (eslabones). Sin afiliación: borde discontinuo. Comparten tinta navy: son categorías, no niveles. |
| `InsigniaEstado`       | Chip tintado de radio 4px con marca de forma propia por tono                    | Estados de cada feature (operativo, recompensa, verificación, resultado).                                                                                                                  |

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
  `seleccion`. Fuera del cartel la foto nunca lleva marco de papel.

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

- Bloque centrado sobre superficie blanca con borde `line`: ícono de 28px en un
  cuadro de 56px, título Manrope 800 en navy (dice qué pasa, en positivo),
  detalle en `tinta-2` (por qué o qué hacer) y acciones.
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

- `<dialog>` nativo: velo `--velo`, panel blanco de radio 14px y `--sombra-2`,
  520px (760px `amplio`). En móvil sube desde abajo como hoja a todo el ancho.
- Anatomía: título (Manrope 800, 19px), descripción, cuerpo y acciones a la
  derecha con la principal al final. La X se pinta en la esquina pero va la
  última en el orden de tabulación.
- Foco al abrir: lo marcado con `data-autofocus`; si no, el primer control
  del cuerpo; si no, el primer botón del pie ("Cancelar" en una confirmación
  peligrosa). Al cerrar, o si el padre lo desmonta abierto, vuelve a quien lo
  abrió.
- Las acciones quedan pegadas abajo (sticky, fondo blanco y filete superior):
  en un formulario largo o en el teléfono no se van bajo el pliegue.
- Solo para tareas que necesitan interrumpir: confirmar algo irreversible o un
  formulario corto sin pantalla propia.
- `DialogoConfirmacion`: el título es la pregunta con el objeto ("¿Abortar el
  operativo OP-0042?"), el mensaje es la consecuencia y el botón dice el verbo
  ("Abortar operativo"), nunca "Aceptar". Mientras confirma, se bloquea; si
  falla, queda abierto. `variante`: `principal`, `peligro` (o `peligroso`) y
  `autoridad` (solo validaciones de rango).

### Íconos

SVG propios en `shared/ui/iconos.tsx` (y los del shell en
`core/layout/iconos-shell.tsx`): caja de 24, trazo 1.75, extremos redondeados,
`currentColor`, decorativos (`aria-hidden`). Ningún carácter Unicode ni emoji
hace de ícono.

### Sello institucional

Emblema original del sistema (no reproduce ningún logo existente): doble anillo
dorado con la leyenda "MARINA · CUARTEL GENERAL", rosa de los vientos de ocho
puntas y ancla al centro. Vive en `core/layout/SelloMarina.tsx` porque lo usan
el shell y el acceso. Por debajo de 64px se usa `simple` (sin leyenda).

### Cartel WANTED

Pieza estrella y única con estética de papel: papel envejecido, tipografía
display con serifa, "DEAD OR ALIVE", recompensa en berries con su símbolo y foto
enmarcada. La construye la feature `carteles`; su paleta de papel y tinta se
agrega como tokens `--cartel-*` en `styles.css` y solo la usa el cartel.

**Tokens** (solo dentro de `features/carteles`):

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

**Anatomía**, de arriba abajo: "WANTED" (Playfair 900, el elemento más grande)
→ foto en marco doble de tinta → "DEAD OR ALIVE" entre filetes → nombre en
mayúsculas → alias en cursiva → recompensa con "฿" y el guion final de los
carteles de la Marina ("1.500.000.000-") → afiliación con su tipo → texto legal
→ pie con "MARINA" y la versión ("V3 · 12 nov 2026"). Proporción 5:7.

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
- Fuera del cartel, nada usa estos tokens ni la serifa: la foto en el resto de
  la app sigue siendo `RetratoCriminal`.

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
- **No** etiquetas pequeñas en mayúsculas encima de los títulos (`PageHeader`
  ya no acepta `kicker`).
- **No** botones, campos, tablas o insignias propios en una feature: se usan los
  de `shared/ui`; si falta una variante, se agrega allí y se documenta aquí.
- **No** texto blanco sobre el naranja de amenaza media, ni el dorado como color
  de texto sobre blanco (usa `--gold-oscuro` sobre `--gold-fondo`).
- **No** filas enteras clicables: el enlace va en la columna principal.
- **No** un modal donde basta una sección en línea.
- **No** dashboards con KPIs inventados ni copys de marketing ("Potencia tu
  flota…").
- **No** animaciones de entrada en cada elemento ni spinners eternos donde
  corresponde un skeleton.
- **No** Lorem ipsum ni datos de relleno sin marcar como tales.
- **No** arte, logos ni personajes oficiales del anime: la iconografía es
  original.
