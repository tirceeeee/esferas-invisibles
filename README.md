# esferas-invisibles
cápsula del tiempo

## Raíz: prototipo de memoria cultural compartida

Aplicación web con un mapa de participantes, selector de décadas, conexiones por referentes culturales y barras de memoria aproximada. Esta carpeta es la copia de trabajo del repositorio `tirceeeee/esferas-invisibles`.

### Desarrollo local

Requiere Node.js. No hay dependencias que instalar.

```sh
npm run dev
```

Abrir http://127.0.0.1:4173. Comprobar el código con `npm run check` y `npm test`.

En Windows también puedes ejecutar `powershell -File .\preview.ps1` desde esta carpeta. Mantiene el servidor en segundo plano y comprueba que responde antes de mostrar el enlace. Los registros se guardan en `.preview/`, fuera del repositorio. La dirección local funciona mientras el equipo y el proceso estén encendidos; tras reiniciar, vuelve a ejecutar el script.

### Vercel

Importar este repositorio en Vercel. Usar la raíz del repositorio, Framework Preset **Other** y Output Directory **dist**. `vercel.json` configura estos valores y omite instalación y compilación, porque la aplicación es estática. No requiere variables de entorno. `server.mjs` solo se utiliza para la vista previa local.

La configuración está preparada; la vinculación a un proyecto de Vercel debe verificarse en esa cuenta.

### Archivos principales

- `dist/index.html`: estructura de la interfaz.
- `dist/styles.css`: diseño adaptable basado en Figma, con fuentes locales.
- `dist/scene.mjs`: posiciones y tamaños de sprites, destino del zoom.
- `dist/connections.mjs`: capa Canvas de conexiones con opacidad exacta y ondas sin asignaciones por línea.
- `dist/assets/figma/`: imagen y SVG originales de las esferas.
- `dist/app.mjs`: mapa, selección, filtros y formulario.
- `dist/domain.mjs`: generaciones, memoria, conceptos y datos ficticios.
- `dist/assets/sprites/`: carpeta para los sprites definitivos. Asignar su ruta en la propiedad `sprite` de cada generación en `domain.mjs`.
- `tests/domain.test.mjs`: pruebas de las reglas de cálculo.

### Estado del prototipo

Incluye 20 participantes ficticios. Se pueden incorporar nuevos nodos de demostración durante la sesión; desaparecen al recargar. No hay base de datos ni entrevistas reales publicadas.

Se estudian cuatro periodos: 1980–1989, 1990–1999, 2000–2009 y 2010–2020 incluido. Cada uno pesa un 25 % en la estimación de memoria. Las respuestas orientan las categorías; los casos insuficientes quedan pendientes de revisión. La correspondencia automática inicial debe validarse con la investigación antes de utilizar datos reales.

Todas las parejas visibles están conectadas. La opacidad aumenta con los conceptos compartidos: 0 coincidencias mantiene 1 %, 4 produce 50 % y 8 o más produce 100 %. La extracción de conceptos es manual con normalización limitada de alias; aún no existe extracción semántica de respuestas abiertas.

### Selección temporal (4 de noviembre de 2026)

El filtro por generación se ha sustituido por cinco opciones exclusivas: General, Años 80, Años 90, Años 2000 y Años 2010 (hasta 2020 incluido). General está seleccionado al abrir. Siempre permanecen todos los participantes, sus IDs y su generación. Cambian los referentes, acontecimientos, cápsula y coincidencias usados para las conexiones. La selección del participante y el zoom se conservan al cambiar de época.

Los datos por periodo viven en `periodData.p80`, `p90`, `p00` y `p10`, con `keywords`, `events`, `capsule` y `memory`. La cápsula general es un campo independiente del participante. General reúne conceptos únicos y acontecimientos de los cuatro periodos. No se copian datos generales a periodos sin respuesta; estos muestran un estado sin información, conservando el nodo y la conexión mínima.

Las barras agregadas de memoria aparecen en General; una década concreta muestra únicamente la categoría estimada de ese periodo o el estado pendiente. El formulario de demostración recoge datos por década y una cápsula final general por separado.

Pendiente: revisión de la metodología, importación privada de entrevistas, síntesis anónimas y persistencia.

### Flotación y ondas por periodo

Las esferas permanecen en su sitio con una oscilación lenta inferior a dos píxeles del lienzo, sin desplazamiento acumulado. Cada ciclo dura entre 20 y 32 segundos y cada esfera tiene su propia fase. No se pueden arrastrar; el clic abre su información. La animación está en `dist/flotation.mjs`.

Se conservan los tamaños anteriores. La generación silenciosa tiene núcleo negro; Boomers, X y Millennials tienen centros blancos progresivamente mayores; Z tiene núcleo blanco. Las proporciones están en `dist/scene.mjs`.

`dist/sound-motion.mjs` produce envolventes sintéticas: energía para amplitud, brillo para densidad de ondas y pulsos para ritmo. Cada década tiene un perfil y General combina los cuatro. Son decisiones artísticas, no mediciones históricas. No se reproduce audio. La opacidad sigue dependiendo exclusivamente de los conceptos compartidos. Las líneas se dibujan en una sola capa Canvas con cálculos de ondas compartidos.

### Grabación candidata

[Calles de Toronto, verano de 1995, por TRP](https://freesound.org/people/TRP/sounds/567324/): grabación en casete con tráfico, voces y música de coches, según su autor. Duración 4:23; licencia CC0 indicada en la ficha. Publicada en 2021, grabada en 1995 según el autor. La descarga requiere iniciar sesión. Consultada el 4 de noviembre de 2026.

No está descargada ni integrada. Es una referencia localizada, no una representación de toda la década ni del contexto español. Faltan fuentes validadas para los otros tres periodos. Una futura integración puede extraer energía RMS, centroide espectral y transitorios previamente y guardar series pequeñas para animar las líneas sin decodificar audio en cada fotograma.

Pausar detiene tanto bolitas como ondas. La preferencia de movimiento reducido inicia la vista quieta, con reanudación voluntaria. Las pestañas ocultas no acumulan tiempo de simulación.

### Diseño de Figma implementado

Referencia: archivo ArAzhz00jvvWEXyKhpG2Uu, frames 1:2 (red) y 1:70 (detalle). Se han leído sus capas y propiedades con la integración de Figma. Interfaz blanca, Cutive Mono y Fira Mono locales, filtros inferiores a la izquierda y botones superiores. La captura del navegador que encabeza los frames no forma parte de la aplicación.

Se reutilizan sphere.png y los cuatro SVG de núcleos descargados de Figma, sin modificar los archivos. La imagen se compone con mezcla exclusion y conserva su proporción original. Las conexiones y esferas son instancias dinámicas de los datos: el esquema estático de hilos de Figma se expresa como curvas animadas, conservando todas las parejas y el cálculo de opacidad. Las variantes mantienen tamaños diferentes por generación; la asignación artística puede revisarse.

Al abrir una esfera, se amplía suavemente hacia la zona izquierda y se ocultan las demás esferas y conexiones, también para navegación con teclado. La ficha a la derecha conserva todos los datos, con desplazamiento interno cuando no caben. Cambiar de década actualiza la misma ficha. Volver a la red o Esc recupera las posiciones, el foco y el filtro. En móvil la ficha pasa debajo de la esfera. Movimiento reducido desactiva las transiciones y comienza con ondas pausadas.

Validación: apertura y regreso, filtro exclusivo 80/90 con el mismo participante, 20 nodos al regresar, vista estrecha sin desbordamiento horizontal y pruebas de dominio/movimiento.

### Opacidad y rendimiento

Se ha contrastado la regla con la biblia: opacidad = max(0,01, min(coincidencias / 8, 1)). General compara conceptos únicos de las cuatro épocas, sin duplicar un concepto repetido entre décadas. Cada década compara únicamente sus respuestas. La red conserva todas las parejas. Cada conexión devuelve también sus keywords compartidas para poder verificar su recuento.

Los anteriores ejemplos ficticios producían entre 9 y 21 coincidencias en General: las 190 conexiones alcanzaban 100 %. Se han diversificado los ejemplos sin modificar la regla ni datos reales. La demostración incluye ahora 0, 4 y 8 o más coincidencias.

Los hilos se dibujan en una sola capa Canvas, con globalAlpha igual a la opacidad calculada. Se eliminan 190 filtros SVG, las cadenas de trazado por fotograma y la actualización continua de atributos de accesibilidad. Las ondas reutilizan buffers numéricos y cálculos trigonométricos compartidos; los extremos siguen las posiciones efectivamente dibujadas de las esferas. Canvas limita la densidad a 2x y se reajusta al tamaño del mapa.

La animación deja de solicitar fotogramas al estabilizarse el zoom de detalle, al pausar y al ocultarse la pestaña; vuelve con las interacciones correspondientes. Los diálogos suspenden la flotación mientras están abiertos.

Validación: 12 pruebas, incluyendo equivalencia geométrica con las ondas originales, opacidad exacta de Canvas, deduplicación global y variedad de la demostración. Ensayo local de 600 fotogramas y 190 curvas: cálculo antiguo 2238 ms, nuevo 39 ms. Es una medición de CPU geométrica con contexto de dibujo simulado, no una medición de FPS ni del coste total de renderizado.
