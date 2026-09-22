# Spec — Mini Service Desk, Fase 1

## Objetivo

Enriquecer el dataset de incidencias de seguridad física
(`data/tickets.json`) con dos campos derivados — `categoria` y
`prioridad` — y construir sobre ese dataset enriquecido una interfaz
web de solo lectura que permita al operador filtrar y ordenar la
bandeja por esos campos.

La clasificación la realiza Claude Code directamente sobre el
repositorio (lectura del JSON, inferencia, escritura de campos).
La interfaz no clasifica ni reclasifica: muestra valores ya resueltos
en el dataset.

## Alcance de la Fase 1

### Qué se construye

1. **Enriquecimiento del dataset**: Claude Code añade `categoria` y
   `prioridad` a los 60 tickets de `data/tickets.json` aplicando los
   criterios definidos en este documento.
2. **Validación automatizada del dataset**: un script confirma que los
   60 tickets tienen ambos campos con valores del catálogo cerrado.
3. **Tests de utilidades**: toda función añadida a `js/utils/` tiene
   un test automatizado en verde antes de cerrar la tarea.
4. **Interfaz de bandeja**: vista de lista que muestra todos los
   tickets, permite filtrar por `categoria` y `prioridad`, y ordena
   por prioridad con `alta` primero por defecto.
5. **Etiquetas visuales**: `prioridad` se muestra con código de color
   (rojo / amarillo / verde para alta / media / baja).

### Qué no se construye en esta fase

- Diseño visual definitivo ni wireframes (eso es `docs/diseno.md`,
  Fase 2).
- Búsqueda por texto libre dentro de título o descripción.
- Edición de tickets desde el navegador (la UI es de solo lectura).
- Reclasificación de `categoria` o `prioridad` desde la interfaz.
- Notificaciones, alertas o mecanismos de escalado.
- Segundo archivo de datos, base de datos o servicio externo de
  persistencia.
- Gestión de usuarios, roles o autenticación.
- Integración con ningún sistema externo.

## Modelo de datos

### Campos existentes (sin cambios)

| Campo              | Tipo   | Descripción                             |
|--------------------|--------|-----------------------------------------|
| `id`               | string | Identificador único (p. ej. "SVD-4100") |
| `titulo`           | string | Título corto de la incidencia           |
| `descripcion`      | string | Descripción extendida                   |
| `sistema_afectado` | string | Sistema implicado                       |
| `reportado_por`    | string | Rol que reporta                         |
| `zona`             | string | Zona física afectada                    |
| `fecha`            | string | Fecha de reporte (YYYY-MM-DD)           |
| `estado`           | string | "abierto" / "cerrado"                   |

### Campos nuevos añadidos en Fase 1

| Campo       | Tipo   | Valores válidos                                                            |
|-------------|--------|----------------------------------------------------------------------------|
| `categoria` | string | `provisioning` · `fallo-tecnico` · `configuracion` · `incidente-seguridad` |
| `prioridad` | string | `alta` · `media` · `baja`                                                  |

Ambos campos se añaden a los 60 tickets. Ningún ticket puede quedar
sin uno de los dos campos o con un valor fuera del catálogo cerrado.

> **Excepción de idioma (Principio 6):** el valor `provisioning` es un
> término técnico del dominio IAM/identidades (SailPoint, Active
> Directory) sin equivalente establecido en español en ese contexto
> profesional. Se acepta como excepción al requisito de español, igual
> que `fetch` o `JSON`. El resto de valores del catálogo (`fallo-tecnico`,
> `configuracion`, `incidente-seguridad`) están en español.

## Criterios de clasificación

Claude Code infiere `categoria` y `prioridad` a partir de `titulo`,
`descripcion` y `sistema_afectado`. La `zona` actúa como señal de
ajuste para la prioridad cuando la categoría no la determina por sí
sola. Cuando la señal sea ambigua, se aplica el nivel más conservador
(el más alto entre los posibles).

### Categorías

| Categoría             | Cuándo aplicar                                                                                                                          |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| `incidente-seguridad` | Acceso no autorizado, intrusión detectada, alarma activa sin causa conocida, credencial comprometida o uso indebido documentado.        |
| `fallo-tecnico`       | Componente de hardware o software que ha dejado de funcionar (alarma desactivada, lector inoperativo, cámara caída, barrera bloqueada). |
| `provisioning`        | Alta, baja o modificación de un perfil, credencial o acceso de una persona (guardia nuevo sin perfil, baja no procesada, acceso caducado). |
| `configuracion`       | Sincronización de cuadrantes, actualización de parámetros, ajuste de turnos o cambio de configuración que no implica fallo técnico ni provisioning de persona. Incluye solicitudes de histórico o informe de auditoría. |

#### Regla de precedencia entre categorías

Cuando un ticket encaja en más de una categoría, se aplica en este orden:

> `incidente-seguridad` > `fallo-tecnico` > `provisioning` > `configuracion`

Ejemplos de aplicación:
- Alarma activa sin causa aparente → `incidente-seguridad` (el riesgo de seguridad activo tiene precedencia sobre el posible fallo de hardware).
- Baja no procesada con credencial aún activa → `incidente-seguridad` (la exposición activa supera la tarea de provisioning pendiente).
- Doble fichaje detectado → `incidente-seguridad` si hay evidencia de uso indebido; `fallo-tecnico` si la descripción apunta solo a un error del sistema de registro.
- Checkpoint no registrado en ronda → `fallo-tecnico` si el dispositivo o la app fallaron; `incidente-seguridad` solo si hay evidencia de que la ronda no se realizó.
- Solicitud de histórico o informe de auditoría → `configuracion` (no implica fallo técnico ni provisioning de persona).

### Prioridad

#### Definición de zona perimetral

A efectos de la tabla siguiente, una zona se considera **perimetral** si el valor
del campo `zona` contiene alguna de estas palabras clave (insensible a mayúsculas):
`Perímetro`, `Acceso`, `Entrada`, `Vehículos`, `Barrera`, `Valla`, `Puerta principal`,
`Control de acceso`. Cualquier zona que no contenga ninguna de estas palabras se
trata como **interior**. En caso de duda, se aplica interior.

| Categoría             | Condición adicional                                                       | Prioridad |
|-----------------------|---------------------------------------------------------------------------|-----------|
| `incidente-seguridad` | Cualquier zona                                                            | `alta`    |
| `fallo-tecnico`       | Zona de perímetro exterior, acceso principal o entrada de vehículos       | `alta`    |
| `fallo-tecnico`       | Zona interior (almacén, pasillo, oficina)                                 | `media`   |
| `provisioning`        | Ticket `abierto` y descripción indica que la persona actualmente no puede acceder (acceso denegado, perfil sin crear, baja no tramitada que expone el sistema) | `media`   |
| `provisioning`        | Ticket `abierto` con tarea planificable (acceso futuro, renovación próxima, ajuste no urgente) o ticket `cerrado`                                             | `baja`    |
| `configuracion`       | Ticket `abierto` y el sistema no puede cumplir su función actual (guardias sin asignar en turno activo, cuadrante con huecos en turno en curso)                | `media`   |
| `configuracion`       | Ticket `abierto` pero el sistema funciona (configuración incorrecta que no impide la operación actual) o ticket `cerrado`                                     | `baja`    |

## Requisitos funcionales

### RF-01 — Enriquecimiento del dataset

Claude Code lee `data/tickets.json`, aplica los criterios de
clasificación de este documento a cada ticket y escribe los campos
`categoria` y `prioridad` en el mismo archivo. El archivo resultante
debe ser JSON válido y mantener todos los campos originales intactos.

### RF-02 — Validación del dataset

Existe un script Node.js en `tests/` que recorre el array y verifica
que todos los objetos tienen `categoria` con valor del catálogo
cerrado y `prioridad` con valor del catálogo cerrado. Retorna error
y lista los tickets que fallen si alguno no cumple. Este script debe
ejecutarse como condición de cierre de cualquier tarea que modifique
`data/tickets.json`.

### RF-03 — Visualización de la bandeja

La interfaz muestra todos los tickets en lista. Por cada ticket se
muestran al menos: `id`, `titulo`, `zona`, `fecha`, `estado`,
`categoria` y `prioridad`.

### RF-04 — Etiquetas con código de color

`prioridad` se muestra como etiqueta coloreada: `alta` → rojo,
`media` → amarillo/naranja, `baja` → verde. `categoria` se muestra
con un único color de fondo neutro uniforme para todos sus valores,
sin diferenciación cromática entre categorías y sin usar rojo, amarillo
ni verde.

### RF-05 — Filtro por categoría

El operador puede seleccionar una o más categorías. Cuando hay varias
seleccionadas, se muestran los tickets que cumplan cualquiera de ellas
(OR intra-dimensión). Sin filtro activo, se muestran todos.

### RF-06 — Filtro por prioridad

El operador puede seleccionar uno o más niveles de prioridad. Cuando
hay varios seleccionados, se muestran los tickets que cumplan cualquiera
de ellos (OR intra-dimensión). Sin filtro activo, se muestran todos.

Cuando los filtros de categoría y prioridad están activos
simultáneamente, se aplica AND entre dimensiones: se muestran solo los
tickets que cumplan el filtro de categoría Y el filtro de prioridad
activos a la vez.

Si la combinación de filtros activos no coincide con ningún ticket, la
bandeja muestra el mensaje `"Sin resultados para los filtros activos."`
El filtro no se resetea automáticamente.

### RF-07 — Orden por prioridad

La bandeja se ordena `alta` → `media` → `baja` por defecto al cargar.
El orden se mantiene al aplicar filtros. Cuando dos tickets tienen la
misma prioridad, se ordenan por `fecha` descendente (el más reciente
primero).

### RF-08 — Tests de utilidades

Toda función pura añadida a `js/utils/` para filtrado, ordenación o
formateo de los nuevos campos tiene un test automatizado en verde.
Los tests se escriben como scripts JavaScript en `tests/` y se
ejecutan con `node <archivo>.test.js` usando únicamente el módulo
`assert` nativo de Node.js, sin instalar ningún paquete.

## Criterios de aceptación

| ID    | Criterio                                                              | Cómo verificar                                                                |
|-------|-----------------------------------------------------------------------|-------------------------------------------------------------------------------|
| CA-01 | Los 60 tickets tienen `categoria` con valor del catálogo cerrado      | El script de validación termina sin errores                                   |
| CA-02 | Los 60 tickets tienen `prioridad` con valor del catálogo cerrado      | El script de validación termina sin errores                                   |
| CA-03 | Ningún campo original fue modificado o eliminado                      | Diff del JSON original vs. enriquecido muestra solo adiciones                 |
| CA-04 | La bandeja muestra los 7 campos requeridos por ticket                 | Inspección visual con todos los filtros desactivados                          |
| CA-05 | Las etiquetas de prioridad muestran el color correcto                 | Inspección visual: alta=rojo, media=amarillo/naranja, baja=verde              |
| CA-06 | El filtro por categoría reduce la lista al subconjunto correcto; filtros múltiples aplican OR; combinado con prioridad aplica AND | Activar cada categoría individualmente y en combinación con prioridad; comparar recuento con el dataset |
| CA-07 | El filtro por prioridad reduce la lista al subconjunto correcto; filtros múltiples aplican OR; combinado con categoría aplica AND | Ídem con cada nivel de prioridad y en combinación con categoría               |
| CA-08 | La bandeja carga ordenada `alta` → `media` → `baja`; empates resueltos por `fecha` descendente | Inspección visual en carga inicial; verificar que dentro del mismo nivel el más reciente aparece primero |
| CA-11 | Filtros sin resultados muestran `"Sin resultados para los filtros activos."` sin resetear el filtro | Activar combinación de filtros que no coincida con ningún ticket              |
| CA-09 | Todos los tests de `js/utils/` pasan en verde                        | `node tests/<nombre>.test.js` — salida sin errores ni excepciones             |
| CA-10 | La interfaz funciona desde un servidor HTTP local                     | `python -m http.server 8080` → `http://localhost:8080`; sin errores en consola |

## Restricciones técnicas

Las restricciones siguientes son requisitos de este proyecto. Añadir
cualquier dependencia nueva (paquete npm, framework, herramienta de
build) requiere actualizar primero `docs/constitution.md` con la
justificación escrita que ese documento exige.

- Stack vanilla: HTML + CSS + JS sin frameworks, sin librerías de
  terceros, sin bundler.
- Los archivos de `js/components/` y `css/` solo leen `categoria` y
  `prioridad`; no los calculan.
- El código que clasifica los tickets no importa ni depende de
  `js/components/` ni de `css/`.
- Todo el código (nombres de variables, funciones, ids del DOM) y los
  mensajes visibles al operador van en español, salvo las excepciones
  declaradas en este documento.
- La única fuente de datos es `data/tickets.json`; no hay base de
  datos ni servicio externo.
