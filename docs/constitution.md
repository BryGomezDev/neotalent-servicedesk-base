# Constitution — Mini Service Desk

Este documento fija los principios de gobernanza técnica del proyecto Mini Service Desk: toda especificación, diseño o línea de código que se escriba de aquí en adelante debe cumplirlos sin excepción.

## 1. Stack mínimo

El proyecto se construye en HTML, CSS y JavaScript vanilla, sin framework, sin librería de terceros y sin bundler ni gestor de paquetes, sirviendo `data/tickets.json` directamente al navegador sin backend propio. Cualquier dependencia nueva (paquete npm, framework, herramienta de build) solo se incorpora si este mismo documento se actualiza primero con un párrafo que justifique, por escrito, qué problema concreto resuelve que vanilla no resuelva en menos de 30 líneas de código.

**Por qué:** una bandeja de ~60 tickets con alcance cerrado no tiene ni el volumen de datos ni la vida útil prevista que justifiquen el coste de mantenimiento de un framework o un pipeline de build.

## 2. Especificación como fuente de verdad

`docs/spec.md` es la fuente de verdad de qué debe hacer el proyecto; cuando el comportamiento del código no coincide con lo que dice el spec, se considera que el código está mal, no el documento. Ningún commit que cambie el comportamiento observable de la aplicación (una funcionalidad nueva, una regla de negocio distinta) se da por terminado si no actualiza `docs/spec.md` en ese mismo commit.

**Por qué:** un spec que no se actualiza al ritmo del código deja de servir como fuente de verdad, que es precisamente la función que debe cumplir frente a cualquier especificación futura del proyecto.

## 3. Separación entre lógica e interfaz

Ningún archivo dentro de `js/components/` o `css/` calcula, invoca o modifica la `categoria` o la `prioridad` de un ticket: esos campos llegan ya resueltos desde el dataset, y esos archivos solo los leen para pintarlos. A la inversa, el proceso o código que asigna `categoria` y `prioridad` no importa ni depende de ningún archivo de `js/components/` ni de `css/`.

**Por qué:** así la clasificación se puede recalcular con otro criterio o modelo sin tocar la interfaz, y el diseño visual se puede rehacer por completo sin arriesgar la lógica de triaje.

## 4. Política de tests

Antes de dar por cerrada cualquier tarea, toda función de `js/utils/` tiene un test automatizado en verde y, si la tarea tocó `data/tickets.json`, una validación automatizada confirma que los 60 tickets tienen `categoria` y `prioridad` rellenos con un valor del catálogo cerrado que define `docs/spec.md`. Si un test o esa validación falla, la tarea no se considera terminada y corregir el fallo (código o dato) forma parte de la propia tarea, no de una tarea aparte.

**Por qué:** en un dataset de solo 60 registros, un dato mal clasificado o una función de filtrado rota es barato de detectar y caro de dejar pasar sin darse cuenta.

## 5. Persistencia de los datos

Los tickets se guardan como un array JSON en el único archivo `data/tickets.json`, versionado en el propio repositorio; el proyecto no incorpora ningún motor de base de datos ni servicio de persistencia externo. Esta regla se revisa solo si el volumen de tickets pasa a un orden de magnitud que ya no quepa cómodamente en memoria del navegador (varios miles).

**Por qué:** 60 registros caben enteros en memoria y en un archivo de texto; una base de datos añadiría una pieza de infraestructura (servidor, conexión, esquema) que ningún requisito actual del proyecto necesita.

## 6. Idioma y convenciones

El código (nombres de variables, funciones, ids del DOM), los comentarios y los mensajes que ve la persona usuaria van en español, salvo palabras reservadas del lenguaje (`function`, `const`, `return`) o términos sin traducción establecida (`fetch`, `JSON`).

**Por qué:** el propio dataset ya usa nombres de campo en español (`titulo`, `sistema_afectado`, `reportado_por`) y el resto del repositorio está en español, así que mezclar idiomas rompería la coherencia que ya existe.

## Modificación de este documento

Modificar un principio ya aprobado exige un commit dedicado exclusivamente a este archivo, no mezclado con cambios de código, cuyo mensaje registre qué principio cambia y por qué.
