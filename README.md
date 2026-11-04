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

Incluye 8 síntesis anónimas de entrevistas de Madrid y 4 participantes ficticios coherentes, identificados con IDs R y D y una etiqueta de origen en la ficha. Las nuevas respuestas del cuestionario siguen siendo una demostración de sesión: desaparecen al recargar. No hay base de datos ni envío automático a Drive.

Se estudian cuatro periodos: 1980–1989, 1990–1999, 2000–2009 y 2010–2020 incluido. Cada uno pesa un 25 % en la estimación de memoria. Las respuestas orientan las categorías; los casos insuficientes quedan pendientes de revisión. La correspondencia automática inicial debe validarse con la investigación antes de utilizar datos reales.

Todas las parejas visibles están conectadas. La opacidad aumenta con los conceptos compartidos: 0 coincidencias mantiene 1 %, 4 produce 50 % y 8 o más produce 100 %. La extracción de conceptos es manual con normalización limitada de alias; aún no existe extracción semántica de respuestas abiertas.

### Selección temporal (4 de noviembre de 2026)

El filtro por generación se ha sustituido por cinco opciones exclusivas: General, Años 80, Años 90, Años 2000 y Años 2010 (hasta 2020 incluido). General está seleccionado al abrir. Siempre permanecen todos los participantes, sus IDs y su generación. Cambian los referentes, acontecimientos, cápsula y coincidencias usados para las conexiones. La selección del participante y el zoom se conservan al cambiar de época.

Los datos por periodo viven en `periodData.p80`, `p90`, `p00` y `p10`, con `keywords`, `events`, `capsule` y `memory`. La cápsula general es un campo independiente del participante. General reúne conceptos únicos y acontecimientos de los cuatro periodos. No se copian datos generales a periodos sin respuesta; estos muestran un estado sin información, conservando el nodo y la conexión mínima.

Las barras agregadas de memoria aparecen en General; una década concreta muestra únicamente la categoría estimada de ese periodo o el estado pendiente. El formulario de demostración recoge datos por década y una cápsula final general por separado.

Pendiente: revisión editorial de las síntesis y estimaciones de memoria, sprites oficiales y persistencia de nuevas respuestas.

### Flotación y ondas por periodo

Las esferas permanecen en su sitio con una oscilación lenta inferior a dos píxeles del lienzo, sin desplazamiento acumulado. Cada ciclo dura entre 20 y 32 segundos y cada esfera tiene su propia fase. No se pueden arrastrar; el clic abre su información. La animación está en `dist/flotation.mjs`.

Se conservan los tamaños anteriores. La generación silenciosa tiene núcleo negro; Boomers, X y Millennials tienen centros blancos progresivamente mayores; Z tiene núcleo blanco. Las proporciones están en `dist/scene.mjs`.

`dist/sound-motion.mjs` produce envolventes sintéticas: energía para amplitud, brillo para densidad de ondas y pulsos para ritmo. Cada década tiene un perfil y General combina los cuatro. Son decisiones artísticas, no mediciones históricas. No se reproduce audio. La opacidad sigue dependiendo exclusivamente de los conceptos compartidos. Las líneas se dibujan en una sola capa Canvas con cálculos de ondas compartidos.

### Entrevistas y cuestionario (4 de noviembre de 2026)

Se leyeron los ocho PDF facilitados en la carpeta de entrevistas. Solo se incluyen síntesis culturales: no se publican los PDF, nombres, ocupaciones, edades exactas, enlaces privados ni detalles personales identificables. Los IDs no codifican datos personales. El archivo conserva asociaciones subjetivas en el periodo en el que se expresaron, incluso si hay solapamientos cronológicos. No se presentan como hechos históricos.

La clasificación generacional sigue los rangos acordados y el año de nacimiento de la fuente, no el nombre del PDF. No hay testimonios reales de Baby Boomers ni Millennials en este lote; sus nodos están identificados como ficticios. Las clasificaciones mixtas de recuerdos de infancia se sintetizan como parciales, con nota visible de estimación revisable. La cápsula general conserva los elementos expresados, aunque una entrevista haya dado más de cinco. Las preguntas sin una selección explícita no se completan inventando respuestas.

- `dist/interviews.mjs`: ocho síntesis anónimas y keywords revisadas manualmente.
- `dist/participants.mjs`: composición inicial y cuatro ejemplos ficticios contextualizados en Madrid.
- `dist/questionnaire.mjs`: esquema compartido entre preguntas y ficha, y validación de respuestas.

El cuestionario recoge relación y origen de memoria, primera asociación, sensación, cultura, objetos, acontecimientos, mirada actual, cápsula, tres imprescindibles, elección única y comparación general. Cada respuesta va a la ficha de su periodo; las comparaciones y la cápsula final aparecen en General. Las keywords se resumen explícitamente por el participante: no hay extracción semántica automática de texto libre. No se infieren conceptos a partir de respuestas negativas.

Las ondas siguen siendo un prototipo sintético: 80 amplio y pausado; 90 rítmico; 2000 más corto; 2010 fino; General intermedio. La amplitud sigue siendo pequeña y la capa completa conserva un desenfoque leve. No se han integrado grabaciones. Las futuras fuentes sonoras deben corresponder a Madrid, España, dentro de 1980–2020; la referencia anterior a Toronto queda descartada.

La selección oculta inmediatamente los otros grupos SVG, evitando el artefacto de composición de la transición de opacidad con la imagen en modo exclusion. No se han editado los sprites. Las fichas se centran en el área derecha, con altura según contenido limitada al espacio disponible; en móvil se centran bajo la esfera. Los elementos internos se ajustan al texto y se centran horizontalmente.
