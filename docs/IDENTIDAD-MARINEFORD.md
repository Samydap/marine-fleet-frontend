# Identidad visual "Marineford": la Marina dentro del anime

Documento de diseño para rediseñar el aspecto de todo el frontend. Cuando quede construido, su contenido se integra en `docs/DISENO.md` y este archivo se elimina.

## 1. Intención

Quien haya visto One Piece (la profesora, el equipo, cualquier evaluador) debe abrir la aplicación y sentir que es **la herramienta real del Cuartel General de la Marina dentro del anime**: la que usarían Sengoku, Akainu o un capitán en Loguetown para perseguir piratas.

Al mismo tiempo, no puede perder seriedad. Es la herramienta de la autoridad: tiene que verse **imponente**, institucional y con peso. Debe representar a los piratas y la lucha de la Marina contra ellos.

Hoy la interfaz es correcta pero genérica: lienzo gris-blanco (`--fondo: #f3f5f8`), tarjetas blancas y navy. El usuario pidió explícitamente que el fondo deje de ser blanco.

**Contexto académico:** la profesora autorizó el uso de motivos y arte del universo One Piece. Se levanta la restricción de "arte original" de `DISENO.md` y de la definición del agente `frontend-marina`.

## 2. Objetivos

1. **Reconocible al instante:** en menos de 5 segundos, un fan reconoce la Marina por el emblema de la gaviota, el 正義 de los abrigos, los carteles WANTED, el Den Den Mushi y la Grand Line.
2. **Imponente y serio:** un lienzo oscuro y profundo, tipografía de orden oficial, dorado solo para el rango y nada infantil.
3. **Legible:** tablas, formularios y filtros conservan superficies claras y el contraste AA. El trabajo diario no se vuelve más lento de leer.
4. **Del lado de los piratas:** el enemigo se ve como enemigo. Hay Jolly Roger en las insignias de pirata, carteles WANTED protagonistas en fichas y listados, y amenaza alta con presencia.

## 3. No objetivos

- No cambia la lógica, las rutas, los datos, los permisos ni el contrato con el backend.
- No se agrega un selector de modo claro/oscuro. Hay un solo tema.
- No se reescriben los componentes: se cambian tokens, fondos, cabeceras, íconos y algunas piezas decorativas.
- No se usan capturas del anime ni personajes dibujados como decoración de fondo.

## 4. Anti-objetivos (fallaría aunque "funcione")

- **Fan page o cosplay:** stickers, personajes sonrientes, colores chillones o fuentes tipo cómic infantil en toda la app.
- **Ilegible:** texto sobre texturas sin superficie de respaldo, tablas sobre fondo oscuro o contraste por debajo de AA.
- **Pesado:** más de ~150 KB adicionales entre fuentes, SVG e imágenes en la carga inicial, o animaciones constantes de fondo.
- **Manga en todo:** viñetas con bordes gruesos y líneas de velocidad en tablas y formularios (fue la opción B, descartada).

## 5. Enfoques considerados

| Enfoque                              | Qué es                                                                                                                                                                              | Por qué sí o no                                                                                                                               |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Cuartel General de Marineford** | Lienzo marino profundo con el emblema de la gaviota en marca de agua, trama de tinta, el 正義 en las cabeceras, papel oficial claro para los datos, Den Den Mushi y carteles WANTED | **Elegido.** Junta "salió del anime" con seriedad y autoridad                                                                                 |
| B. Página de manga                   | Viñetas, líneas de velocidad y trama en todo                                                                                                                                        | Descartado: cansa en pantallas densas y resta seriedad                                                                                        |
| C. Sala de mando nocturna            | Todo oscuro, carta náutica de la Grand Line, olas en tinta                                                                                                                          | **Se toma solo la carta náutica** como capa del fondo de A. Todo oscuro alejaba el blanco y azul del uniforme y empeoraba la lectura de datos |

**Decisión del usuario:** A combinada con la carta náutica de C.

**Decisión del equipo de diseño (corregible):** el emblema, el Den Den Mushi, la trama y la carta náutica se dibujan en SVG dentro del repo, porque son ligeros, nítidos y temables con tokens. Si el usuario aporta arte oficial (PNG o SVG), puede reemplazar a cualquiera de ellos sin cambiar la estructura.

## 6. Diseño

### 6.1 Capas del lienzo (de abajo hacia arriba)

1. **Color base:** navy muy profundo, casi tinta nocturna (nuevo token `--lienzo`, del orden de `#0b1424`). Reemplaza a `--fondo` como color del área de contenido del shell.
2. **Carta náutica (de C):** líneas finas de rumbo, una rosa de los vientos grande y difusa y la franja de la Grand Line cruzando en diagonal, en `--sobre-navy-linea` con opacidad muy baja. Es un SVG fijo detrás del contenido (`position: fixed`), y no se desplaza con la página.
3. **Trama de tinta:** un patrón de puntos de manga (halftone) muy sutil que se intensifica hacia los bordes (viñeta). Se hace con CSS (`radial-gradient` repetido) o un SVG pequeño en mosaico.
4. **Emblema de la gaviota de la Marina:** marca de agua grande, en la esquina inferior derecha del lienzo, con opacidad muy baja.

El shell lateral sigue en navy, ahora con borde dorado fino y el emblema de la gaviota en lugar del sello actual. La gaviota pasa a ser el emblema principal en todas partes (shell, login, `/reportar`). El sello de la rosa y el ancla (`SelloMarina`) queda como pieza secundaria, por ejemplo en el pie del login o en estados vacíos.

### 6.2 Superficies de datos: papel de orden oficial

- Las tarjetas, paneles, tablas, formularios y diálogos dejan de ser blanco puro. Pasan a **papel oficial marfil** (nuevo token `--papel`, del orden de `#f6f2e8`), con un filete de tinta fino y una sombra profunda y corta, como hojas sobre una mesa de mando.
- El texto sobre papel conserva los tokens de tinta actuales. Todos los pares deben pasar AA.
- **Cada bloque de datos va siempre sobre papel.** Ningún texto de lectura va directamente sobre el lienzo, salvo la cabecera de página (6.3).

### 6.3 Cabecera de página: orden del Cuartel General

- El título va sobre el lienzo oscuro, en blanco uniforme, con tipografía display condensada e imponente (6.5).
- A la izquierda del título hay un sello con el kanji **正義** (Justicia), con estilo de pincel. Va en blanco para todos los roles y en dorado solo para el Almirante (`useEsRol(RolCodigo.ALMIRANTE)`), porque el dorado sigue reservado al rango más alto. _Decisión del equipo de diseño._
- La descripción y la meta ("Consultado hace…") van en `--sobre-navy-texto`.
- Las acciones de la cabecera se adaptan al fondo oscuro. El principal es blanco con texto navy, y el secundario lleva contorno blanco.
- Las pestañas de sección (`PestanasSeccion`) también van sobre el lienzo, con subrayado dorado en la activa.

### 6.4 Elementos del universo

| Elemento               | Dónde                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Notas                                                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Emblema de la gaviota  | Barra lateral, marca de agua del lienzo, login, favicon                                                                                                                                                                                                                                                                                                                                                                                                           | SVG; versión de línea y de silueta                                                                                                          |
| 正義                   | Cabeceras de página, login, pantalla de acceso denegado                                                                                                                                                                                                                                                                                                                                                                                                           | Fuente de pincel cargada solo con esos 2 glifos                                                                                             |
| Den Den Mushi          | Indicador de sincronización ("En vivo" o "Sin conexión"), avisos flotantes, estado sin conexión                                                                                                                                                                                                                                                                                                                                                                   | SVG pequeño; con los ojos abiertos cuando está en vivo y dormido sin conexión                                                               |
| Cartel WANTED          | **Ficha del criminal:** el cartel oficial vigente (la instantánea emitida que ya consulta la ficha), junto a la identificación; si no hay cartel emitido, un hueco con el texto "Sin cartel emitido" y el enlace a emitirlo. **Listado de criminales:** no lleva cartel en miniatura, para no perder densidad; el retrato (foto o iniciales, 32–48 px) gana un marco tipo cartel (papel envejecido y filete de tinta) puramente decorativo, que no se espera leer | `CartelWanted` pasa a `shared/ui` sin cambiar su origen de datos; no se arman carteles con datos actuales. _Decisión del equipo de diseño._ |
| Jolly Roger            | `InsigniaTipoCriminal` pirata                                                                                                                                                                                                                                                                                                                                                                                                                                     | Calavera con huesos cruzados, sobria; el revolucionario y el independiente mantienen su propio ícono                                        |
| Carta de la Grand Line | Capa del lienzo; vacíos y estados de error                                                                                                                                                                                                                                                                                                                                                                                                                        | Con los Cuatro Mares y la Red Line como referencia geográfica                                                                               |
| Login                  | Pantalla completa                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Silueta de la fortaleza de Marineford sobre el mar al atardecer nocturno, emblema y 正義; el formulario va sobre papel oficial              |

### 6.5 Tipografía

- **Display** (títulos de página, cifras protagonistas, login): una fuente condensada, pesada y de cartel oficial, por ejemplo **Anton** u **Oswald 700** (Google Fonts). Sustituye a Manrope solo en display y titulares de página.
- **Paneles y cuerpo:** se mantienen Manrope (títulos de panel) y DM Sans (texto). Ya son legibles y no se tocan.
- **Kanji 正義:** una fuente de pincel japonesa (por ejemplo, **Yuji Syuku** o **Zen Antique**), cargada con `&text=正義` para descargar solo esos glifos.
- **Cartel:** se mantiene Playfair Display.

### 6.6 Color

- **Se mantiene:**
  - El navy y el dorado de la paleta actual.
  - El dorado sigue siendo exclusivo del rango y la autoridad.
  - Todos los colores semánticos de amenaza y estado, que no cambian.
- **Nuevos tokens:**
  - `--lienzo` y `--lienzo-2`: el navy del lienzo.
  - `--papel`, `--papel-2` y `--papel-borde`: las superficies de datos.
  - `--tinta-carta`: las líneas de la carta náutica.
  - `--trama`: el punto de la trama.
- **Rojo de amenaza alta:** puede ganar presencia (por ejemplo, un borde izquierdo rojo en las filas de criminales de amenaza alta), siempre acompañado de la etiqueta.

### 6.7 Movimiento

- **Sin animaciones de fondo constantes.**
- **Den Den Mushi:** un parpadeo breve al recibir un cambio sincronizado.
- **Lo que ya existe:** las transiciones actuales se mantienen.
- **`prefers-reduced-motion`:** lo desactiva todo menos los cambios de estado.

### 6.8 Pantallas con tratamiento especial

- **Login y MFA:** la pantalla más cinematográfica (6.4). Se construye **encima** del login actual: se conservan la estructura de dos zonas, el formulario, la validación, los estados y sus pruebas; cambian el panel institucional (silueta de Marineford, gaviota y 正義 en lugar de la rosa) y el lienzo. _Decisión del equipo de diseño._
- **Acceso denegado y 404:** el 正義 grande y el emblema, con tono de orden oficial.
- **Carteles (tablón):** el lienzo se convierte en un "muro de búsqueda", con los carteles sobre el fondo oscuro sin un panel de papel detrás. La barra de filtros, la paginación y los estados vacío o de error siguen sobre papel, como franjas propias encima y debajo del muro; no se crean variantes oscuras de componentes compartidos. _Decisión del equipo de diseño._
- **Formulario público `/reportar`:** el ciudadano ve la Marina de frente, con su emblema y 正義, pero con el formulario claro y simple.

## 7. Restricciones

- **Arquitectura de `docs/ARQUITECTURA.md`:**
  - Las piezas nuevas (emblema, Den Den Mushi, trama, carta, `CartelWanted`) viven en `shared/ui` o `core/layout`.
  - Ninguna feature importa a otra.
- **Tokens:** todo color, sombra y radio va con tokens en `src/styles.css`, documentados en `DISENO.md`. Nada de valores sueltos.
- **Accesibilidad:**
  - El contraste es AA en todo el texto, también en la cabecera sobre el lienzo.
  - El foco es visible sobre el lienzo oscuro y sobre el papel.
  - Los elementos decorativos usan `aria-hidden`.
- **Móvil:** funciona desde 320 px. En móvil, la marca de agua y la carta se simplifican o se ocultan.
- **Peso:** sin dependencias npm nuevas, y como máximo unos 150 KB adicionales en la carga inicial.
- **Huella:**
  - Sin rastros de herramientas de IA en el repo, como en todo el proyecto.
  - Los commits van en Conventional Commits en español.
- **Pruebas:** lint, pruebas y build en verde. Los textos y roles que cubren las pruebas no cambian; si una prueba depende de una clase o de un texto decorativo, se ajusta.
- **Revisión visual:** con Playwright, como en la fase anterior, a 1440, 1024, 768 y 390 px, en todas las rutas.

## 8. Lo que queda a criterio de quien construye

- El dibujo exacto de cada SVG y su nivel de detalle.
- Los valores finales de los tokens nuevos, siempre que pasen AA y respeten el carácter descrito.
- Las opacidades de la trama, la carta y la marca de agua.
- La fuente display concreta (Anton, Oswald u otra de la misma familia condensada).
- Qué pantallas, además de las de 6.8, simplifican la carta en el fondo.

## 9. Tareas de documentación al terminar

- Integrar este documento en `docs/DISENO.md`. Hay que reescribir las secciones Visión general, Colores, Tipografía, Shell, Íconos, Sello y "Lo que sí y lo que no", y quitar la regla "solo el cartel usa la estética de papel".
- Eliminar este archivo.
- Actualizar la definición del agente `frontend-marina` (fuera del repo): levantar la restricción de arte original y apuntar a la nueva dirección.
