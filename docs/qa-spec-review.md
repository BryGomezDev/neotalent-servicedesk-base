# QA Review — docs/spec.md (Fase 1)

> Revisión de control previa a Fase 2 (diseño) y Fase 3 (desarrollo).
> Esta pasada solo detecta y reporta — no corrige, no propone soluciones.
> Generado por tres subagentes especializados: ambigüedades / casos límite / conflictos.

---

## 1. Ambigüedades

Frases o requisitos del spec que admiten más de una interpretación razonable y llevarían a implementaciones incompatibles.

---

### A-01 — Número de tickets: 50 vs. 60

**Sección:** Alcance § 1, Modelo de datos, RF-01, RF-02, CA-01, CA-02
**Frase:** "Claude Code añade `categoria` y `prioridad` a los **60 tickets** de `data/tickets.json`"

- **Interpretación A:** el dataset real tiene 50 tickets y el spec contiene un error tipográfico; la validación debe pasar con 50 registros.
- **Interpretación B:** el dataset debe ampliarse a 60 tickets antes de enriquecer; la validación debe exigir exactamente 60.

**Problema:** el script de validación de RF-02 y los criterios CA-01/CA-02 producen resultados incompatibles según cuál sea el número correcto. Un implementador escribe `assert(count === 50)` y otro `assert(count === 60)`.

---

### A-02 — Comportamiento con múltiples filtros activos simultáneamente

**Sección:** RF-05, RF-06
**Frase:** "El operador puede seleccionar una o más categorías [...] uno o más niveles de prioridad."

- **Interpretación A:** los filtros actúan en intersección (AND): se muestran tickets que cumplen la categoría Y el nivel de prioridad seleccionados.
- **Interpretación B:** los filtros actúan en unión (OR): se muestran tickets que cumplen cualquiera de las condiciones activas entre ambos filtros.

**Problema:** la función de filtrado en `js/utils/` produce conjuntos de resultados completamente distintos. CA-06 y CA-07 solo verifican cada filtro de forma individual, por lo que no detectan esta divergencia.

---

### A-03 — "Sin dependencias externas" en los tests

**Sección:** RF-08
**Frase:** "test automatizado en verde, ejecutable **sin dependencias externas**"

- **Interpretación A:** los tests corren directamente en Node.js con `assert` nativo, sin instalar ningún paquete.
- **Interpretación B:** "sin dependencias externas" significa sin servidor ni navegador; se permite un runner instalable via npm si está en `package.json` del repo.

**Problema:** un implementador escribe scripts `node test.js` con `assert` nativo; otro instala Jest. Son mecanismos incompatibles — el primero falla con `npx jest` y el segundo requiere `npm install`, lo que podría violar la constitución.

---

### A-04 — "Zona de perímetro exterior" como señal de prioridad

**Sección:** Criterios de clasificación — Prioridad, fila `fallo-tecnico` / `alta`
**Frase:** "Zona de perímetro exterior, acceso principal o entrada de vehículos"

- **Interpretación A:** solo aplica si el campo `zona` contiene literalmente esas palabras.
- **Interpretación B:** es un concepto semántico; valores como "Valla norte", "Garage" o "Puerta trasera" también cuentan aunque no contengan esa cadena exacta.

**Problema:** el catálogo de valores de `zona` no está definido en el spec. Dos implementadores asignan prioridades distintas al mismo ticket según si aplican coincidencia literal o inferencia semántica. La validación de CA-01/CA-02 no lo detecta porque solo verifica que el valor esté en el catálogo cerrado, no que sea correcto.

---

### A-05 — "Ticket abierto que bloquea el acceso activo de una persona hoy"

**Sección:** Criterios de clasificación — Prioridad, filas `provisioning`
**Frase:** "Ticket abierto que bloquea el acceso activo de una persona **hoy**"

- **Interpretación A:** "hoy" es la fecha en que Claude Code ejecuta la clasificación — criterio dinámico; el mismo ticket cambia de prioridad con el tiempo.
- **Interpretación B:** "hoy" se refiere a la fecha del campo `fecha` del ticket — criterio estático evaluado respecto al momento del reporte.

**Problema:** con la interpretación A, la prioridad de un ticket cambia sin que el dataset se actualice, lo que viola el principio de que los campos llegan "ya resueltos" al navegador. Con la interpretación B, el spec debería indicar cómo inferir urgencia temporal desde `fecha`. Las dos interpretaciones producen valores distintos para tickets con fecha pasada.

---

### A-06 — "Etiqueta neutra" para categoría

**Sección:** RF-04
**Frase:** "`categoria` se muestra como etiqueta neutra sin código de color propio."

- **Interpretación A:** todas las categorías comparten el mismo color de fondo (p. ej. gris uniforme).
- **Interpretación B:** no hay color semántico, pero el implementador puede usar colores distintos por categoría siempre que no sean rojo/amarillo/verde.

**Problema:** un implementador pinta todas las etiquetas de categoría en gris; otro usa cuatro colores diferenciados. CA-05 solo verifica las etiquetas de prioridad, así que ambas implementaciones superan los criterios de aceptación pero producen resultados visuales incompatibles.

---

## 2. Casos límite

Situaciones que el spec no contempla explícitamente y que ocurrirán en la práctica.

---

### CL-01 — Alarma sin causa aparente: `incidente-seguridad` vs. `fallo-tecnico`

**Sección:** Criterios de clasificación — Categorías
**Caso:** ticket con "alarma activa sin causa conocida" que también describe la alarma disparándose sola tras mantenimiento o sin movimiento en cámaras.

La tabla define `incidente-seguridad` para "alarma activa sin causa conocida" y `fallo-tecnico` para "componente que ha dejado de funcionar". Cuando una alarma se dispara sola, cumple simultáneamente ambas definiciones.

**Problema:** dos implementadores aplicando el spec de buena fe pueden clasificar el mismo ticket de forma distinta, produciendo datasets inconsistentes que invalidan CA-01 desde el inicio.

---

### CL-02 — Credencial de persona dada de baja que sigue activa: `provisioning` vs. `incidente-seguridad`

**Sección:** Criterios de clasificación — Categorías
**Caso:** baja de empleado no procesada con credencial aún activa.

Encaja en `provisioning` ("baja no procesada, acceso caducado") y simultáneamente en `incidente-seguridad` ("credencial comprometida o uso potencial indebido"). El spec no define cuál categoría tiene prioridad cuando un ticket de provisioning crea una ventana de riesgo de seguridad activa.

**Problema:** la prioridad resultante difiere radicalmente: `provisioning` → `media` o `baja`; `incidente-seguridad` → siempre `alta`. La diferencia afecta al orden por defecto (RF-07) y a los filtros (RF-05, RF-06).

---

### CL-03 — Solicitud de histórico de accesos para auditoría: ninguna categoría encaja

**Sección:** Criterios de clasificación — Categorías
**Caso:** ticket solicitando un informe o exportación de logs de acceso.

No es un fallo técnico, no es incidente, no es alta/baja de persona y no es cambio de configuración del sistema. No encaja limpiamente en ninguna de las cuatro categorías del catálogo cerrado.

**Problema:** el spec no contempla tickets de tipo "petición de servicio" o "solicitud de información". El implementador no tiene instrucción clara, lo que compromete la coherencia del dataset y la validación de RF-02/CA-01.

---

### CL-04 — Doble fichaje detectado: `incidente-seguridad` vs. `fallo-tecnico`

**Sección:** Criterios de clasificación — Categorías
**Caso:** el mismo guardia aparece fichado en dos puestos a la misma hora.

Puede interpretarse como `incidente-seguridad` (uso indebido de credencial) o como `fallo-tecnico` (app de rondas registra incorrectamente). El spec no define criterio de desempate cuando la misma observación apunta a fallo del sistema y a posible uso indebido.

**Problema:** si es `incidente-seguridad` → siempre `alta`; si es `fallo-tecnico` en zona interior → `media`. Impacta el orden por defecto y los filtros.

---

### CL-05 — Checkpoint no registrado en ronda: `fallo-tecnico` vs. `configuracion`

**Sección:** Criterios de clasificación — Categorías
**Caso:** un checkpoint de ronda de guardia no queda registrado en la app.

Puede ser un fallo técnico (app que deja de funcionar) o un problema de configuración (parámetros del checkpoint mal configurados). El spec no cubre este patrón en ninguna de las dos categorías con suficiente precisión.

**Problema:** sin un criterio que cubra fallos de registro de rondas, el implementador tiene dos opciones igualmente válidas según el spec.

---

### CL-06 — Zonas del dataset que no encajan en la tabla de prioridad

**Sección:** Criterios de clasificación — Prioridad, filas `fallo-tecnico`
**Caso:** zonas como "Sala de servidores", "Torre de control", "Muelle de carga", "Aparcamiento -1", "Recepción Principal", "Nave logística 2".

La tabla de prioridad para `fallo-tecnico` solo menciona dos tipos: "perímetro exterior / acceso principal / entrada de vehículos" (→ `alta`) y "zona interior (almacén, pasillo, oficina)" (→ `media`). La mayoría de las zonas del dataset no caben literalmente en ninguna de esas dos descripciones.

**Problema:** sin un mapeo explícito entre las zonas reales del dataset y los tipos de la tabla, cada implementador resuelve la ambigüedad de forma diferente, generando prioridades inconsistentes entre tickets del mismo tipo de zona.

---

### CL-07 — Acceso temporal con fecha de caducidad próxima: umbral no definido

**Sección:** Criterios de clasificación — Prioridad, filas `provisioning`
**Caso:** ticket de provisioning sobre un acceso temporal que caduca en N días.

La tabla distingue "bloquea acceso activo hoy" (→ `media`) vs. "planificable" (→ `baja`). Un acceso que caduca en 4 días implica urgencia inminente; uno que caduca en 19 días parece planificable. El spec no define ningún umbral temporal.

**Problema:** dos tickets estructuralmente idénticos reciben prioridades distintas (`media` vs. `baja`) según cómo el implementador interprete "urgente" o "planificable", sin criterio objetivo en el spec.

---

### CL-08 — `configuracion` con operación parcialmente degradada: `media` vs. `baja`

**Sección:** Criterios de clasificación — Prioridad, filas `configuracion`
**Caso:** cuadrante con guardias sin asignar — el sistema funciona pero con cobertura incompleta.

La tabla distingue "bloquea operación en curso" (→ `media`) vs. "planificable o sistema funciona con configuración actual" (→ `baja`). Un cuadrante parcialmente sin cubrir puede interpretarse como funcionamiento parcial (→ `baja`) o como bloqueo de turno (→ `media`).

**Problema:** la distinción `media`/`baja` queda sin criterio operativo. La validación automática (RF-02) no puede detectarlo porque ambos valores son del catálogo cerrado.

---

### CL-09 — Filtros activos que devuelven 0 resultados

**Sección:** RF-05, RF-06, CA-06, CA-07
**Caso:** el operador activa un filtro y ningún ticket lo cumple.

El spec no define qué debe mostrar la interfaz cuando la lista filtrada está vacía: ¿lista vacía sin mensaje?, ¿un mensaje explicativo?, ¿el filtro se resetea?

**Problema:** CA-06 y CA-07 verifican que el filtro "reduce la lista al subconjunto correcto" pero no verifican el estado de lista vacía, que es el caso límite más visible para el operador.

---

### CL-10 — Criterio secundario de ordenación en empate de prioridad

**Sección:** RF-07, CA-08
**Caso:** múltiples tickets con la misma prioridad.

El spec define el orden `alta` → `media` → `baja` pero no define ningún criterio de desempate dentro del mismo nivel (p. ej. por `fecha` descendente).

**Problema:** sin criterio secundario, el orden entre tickets del mismo nivel es indeterminado. CA-08 verifica la ordenación en carga inicial pero no puede ser reproducible si el orden interno de cada grupo es no determinista.

---

### CL-11 — Entorno y lenguaje del script de validación (RF-02)

**Sección:** RF-02, CA-01, CA-02
**Caso:** el spec exige "un script o función de test" que valide el dataset pero no especifica en qué lenguaje ni entorno debe ejecutarse.

Con stack vanilla sin bundler, un script Node.js requiere `node` instalado fuera del stack. Un script Python sale del entorno web. Un test en el navegador no corre desde línea de comandos sin un runner externo.

**Problema:** la forma de verificar CA-01 y CA-02 queda sin definir, haciendo los criterios de aceptación no reproducibles de forma objetiva.

---

## 3. Conflictos con constitution.md

Puntos del spec que contradicen, esquivan o no son verificables binarialmente contra alguno de los 6 principios de la constitución.

---

### C-01 — Principio 1 (Stack mínimo) / RF-08

**Frase del spec:** "test automatizado en verde, ejecutable sin dependencias externas"

**Conflicto:** ambigüedad que podría violar el principio. Si "sin dependencias externas" se resuelve instalando un runner de tests (Jest, Vitest, Mocha), se introduce una dependencia nueva que la constitución exige justificar actualizando el propio `docs/constitution.md` antes de incorporarla. El spec no menciona ni restringe el tooling de test, dejando abierta esa vía sin el proceso de justificación exigido.

---

### C-02 — Principio 1 (Stack mínimo) / Restricciones técnicas

**Frase del spec:** "Stack vanilla: HTML + CSS + JS sin frameworks, sin librerías de terceros, sin bundler."

**Conflicto:** omisión que lo hace inverificable. El spec replica el estado deseado pero omite la condición procedimental de la constitución: cualquier dependencia nueva requiere actualizar primero la constitución con una justificación escrita. Un desarrollador que lea solo el spec no sabe qué proceso debe seguir para añadir una dependencia.

---

### C-03 — Principio 2 (Spec como fuente de verdad) / Restricciones técnicas

**Frase del spec:** "Derivan directamente de `docs/constitution.md` y no son negociables"

**Conflicto:** contradicción directa. Al declarar que ciertas restricciones "derivan de" la constitución y son no-negociables, el spec establece implícitamente una jerarquía donde la constitución puede anular al spec. Esto contradice el principio 2, que fija a `docs/spec.md` como fuente de verdad sin admitir documentos superiores en materia de comportamiento observable.

---

### C-04 — Principio 2 (Spec como fuente de verdad) / Número de tickets

**Frase del spec:** "Claude Code añade `categoria` y `prioridad` a los **60 tickets**" (Alcance § 1, RF-01, RF-02, CA-01, CA-02)

**Conflicto:** contradicción interna que hace el spec inverificable como fuente de verdad. El dataset real (`data/tickets.json`) tiene 50 registros según el commit inicial del repo. Si el spec describe un estado que no coincide con el artefacto versionado, no puede actuar como fuente de verdad — cualquier validación contra el spec fallará o pasará incorrectamente.

---

### C-05 — Principio 4 (Política de tests) / RF-02

**Frase del spec:** "Existe un script o función de test que recorre el array y verifica [...]"

**Conflicto:** omisión que lo hace inverificable contra el principio. La constitución establece que la validación del dataset es una condición de cierre de tarea ("antes de dar por cerrada cualquier tarea"). El spec describe RF-02 como un requisito entregable sin fijar en qué momento del flujo de trabajo debe ejecutarse ni quién es responsable. No se puede verificar binarialmente si se cumple el principio 4 porque el spec no vincula la existencia del script a la condición temporal que la constitución impone.

---

### C-06 — Principio 4 (Política de tests) / CA-09

**Frase del spec:** "Ejecutar suite de tests; salida sin errores"

**Conflicto:** ambigüedad que podría violar el principio. "Suite de tests" no especifica el mecanismo de ejecución. Si implica un runner externo (paquete npm), se activa el conflicto con el principio 1 sin que el spec haya satisfecho el proceso de justificación de la constitución. Si implica ejecución manual en consola, CA-09 no es reproducible como criterio de aceptación automatizable.

---

### C-07 — Principio 6 (Idioma y convenciones) / Catálogo de categorías

**Frase del spec:** valores del catálogo: `provisioning` · `fallo-tecnico` · `configuracion` · `incidente-seguridad`

**Conflicto:** ambigüedad que podría violar el principio. La constitución exige nombres de variables, funciones e ids del DOM en español, con excepción solo para "términos sin traducción establecida" (`fetch`, `JSON`). El valor `provisioning` es un anglicismo; el spec lo fija como valor literal del campo del dataset y potencial id/clase del DOM, pero no documenta por qué se acepta como excepción. Sin esa justificación, no es verificable binarialmente si cumple el principio 6.

---

## Resumen de hallazgos

| ID    | Eje              | Sección del spec afectada                          |
|-------|------------------|----------------------------------------------------|
| A-01  | Ambigüedad       | Alcance §1, Modelo de datos, RF-01, RF-02, CA-01/02 |
| A-02  | Ambigüedad       | RF-05, RF-06                                       |
| A-03  | Ambigüedad       | RF-08                                              |
| A-04  | Ambigüedad       | Criterios de clasificación — Prioridad             |
| A-05  | Ambigüedad       | Criterios de clasificación — Prioridad             |
| A-06  | Ambigüedad       | RF-04                                              |
| CL-01 | Caso límite      | Criterios de clasificación — Categorías            |
| CL-02 | Caso límite      | Criterios de clasificación — Categorías            |
| CL-03 | Caso límite      | Criterios de clasificación — Categorías            |
| CL-04 | Caso límite      | Criterios de clasificación — Categorías            |
| CL-05 | Caso límite      | Criterios de clasificación — Categorías            |
| CL-06 | Caso límite      | Criterios de clasificación — Prioridad             |
| CL-07 | Caso límite      | Criterios de clasificación — Prioridad             |
| CL-08 | Caso límite      | Criterios de clasificación — Prioridad             |
| CL-09 | Caso límite      | RF-05, RF-06, CA-06, CA-07                         |
| CL-10 | Caso límite      | RF-07, CA-08                                       |
| CL-11 | Caso límite      | RF-02, CA-01, CA-02                                |
| C-01  | Conflicto        | RF-08 / Principio 1                                |
| C-02  | Conflicto        | Restricciones técnicas / Principio 1               |
| C-03  | Conflicto        | Restricciones técnicas / Principio 2               |
| C-04  | Conflicto        | Alcance §1, RF-01, RF-02, CA-01/02 / Principio 2  |
| C-05  | Conflicto        | RF-02 / Principio 4                                |
| C-06  | Conflicto        | CA-09 / Principio 4                                |
| C-07  | Conflicto        | Modelo de datos — catálogo / Principio 6           |
