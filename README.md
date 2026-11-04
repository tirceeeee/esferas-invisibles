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
- `dist/styles.css`: diseño adaptable.
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

Pendiente: sprites definitivos, revisión de la metodología, importación privada de entrevistas, síntesis anónimas y persistencia. La revisión visual automatizada del primer prototipo sigue pendiente.
