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
| `configuracion`       | Sincronización de cuadrantes, actualización de parámetros, ajuste de turnos o cambio de configuración que no implica fallo técnico ni provisioning de persona. |

### Prioridad

| Categoría             | Condición adicional                                                       | Prioridad |
|-----------------------|---------------------------------------------------------------------------|-----------|
| `incidente-seguridad` | Cualquier zona                                                            | `alta`    |
| `fallo-tecnico`       | Zona de perímetro exterior, acceso principal o entrada de vehículos       | `alta`    |
| `fallo-tecnico`       | Zona interior (almacén, pasillo, oficina)                                 | `media`   |
| `provisioning`        | Ticket abierto que bloquea el acceso activo de una persona hoy            | `media`   |
| `provisioning`        | Ticket planificable (la persona no necesita acceso de forma urgente)      | `baja`    |
| `configuracion`       | Ticket abierto que bloquea operación en curso                             | `media`   |
| `configuracion`       | Ticket planificable o el sistema funciona con la configuración actual     | `baja`    |

## Requisitos funcionales

### RF-01 — Enriquecimiento del dataset

Claude Code lee `data/tickets.json`, aplica los criterios de
clasificación de este documento a cada ticket y escribe los campos
`categoria` y `prioridad` en el mismo archivo. El archivo resultante
debe ser JSON válido y mantener todos los campos originales intactos.

### RF-02 — Validación del dataset

Existe un script o función de test que recorre el array y verifica
que todos los objetos tienen `categoria` con valor del catálogo
cerrado y `prioridad` con valor del catálogo cerrado. Retorna error
y lista los tickets que fallen si alguno no cumple.

### RF-03 — Visualización de la bandeja

La interfaz muestra todos los tickets en lista. Por cada ticket se
muestran al menos: `id`, `titulo`, `zona`, `fecha`, `estado`,
`categoria` y `prioridad`.

### RF-04 — Etiquetas con código de color

`prioridad` se muestra como etiqueta coloreada: `alta` → rojo,
`media` → amarillo/naranja, `baja` → verde. `categoria` se muestra
como etiqueta neutra sin código de color propio.

### RF-05 — Filtro por categoría

El operador puede seleccionar una o más categorías para ver solo los
tickets que las cumplan. Sin filtro activo, se muestran todos.

### RF-06 — Filtro por prioridad

El operador puede seleccionar uno o más niveles de prioridad. Sin
filtro activo, se muestran todos.

### RF-07 — Orden por prioridad

La bandeja se ordena `alta` → `media` → `baja` por defecto al cargar.
El orden se mantiene al aplicar filtros.

### RF-08 — Tests de utilidades

Toda función pura añadida a `js/utils/` para filtrado, ordenación o
formateo de los nuevos campos tiene un test automatizado en verde,
ejecutable sin dependencias externas.

## Criterios de aceptación

| ID    | Criterio                                                              | Cómo verificar                                                                |
|-------|-----------------------------------------------------------------------|-------------------------------------------------------------------------------|
| CA-01 | Los 60 tickets tienen `categoria` con valor del catálogo cerrado      | El script de validación termina sin errores                                   |
| CA-02 | Los 60 tickets tienen `prioridad` con valor del catálogo cerrado      | El script de validación termina sin errores                                   |
| CA-03 | Ningún campo original fue modificado o eliminado                      | Diff del JSON original vs. enriquecido muestra solo adiciones                 |
| CA-04 | La bandeja muestra los 7 campos requeridos por ticket                 | Inspección visual con todos los filtros desactivados                          |
| CA-05 | Las etiquetas de prioridad muestran el color correcto                 | Inspección visual: alta=rojo, media=amarillo/naranja, baja=verde              |
| CA-06 | El filtro por categoría reduce la lista al subconjunto correcto       | Activar cada categoría individualmente y comparar con el recuento del dataset |
| CA-07 | El filtro por prioridad reduce la lista al subconjunto correcto       | Ídem con cada nivel de prioridad                                              |
| CA-08 | La bandeja carga ordenada `alta` → `media` → `baja` por defecto      | Inspección visual en carga inicial sin filtros                                |
| CA-09 | Todos los tests de `js/utils/` pasan en verde                        | Ejecutar suite de tests; salida sin errores                                   |
| CA-10 | La interfaz funciona desde un servidor HTTP local                     | `python -m http.server 8080` → `http://localhost:8080`; sin errores en consola |

## Restricciones técnicas

Derivan directamente de `docs/constitution.md` y no son negociables:

- Stack vanilla: HTML + CSS + JS sin frameworks, sin librerías de
  terceros, sin bundler.
- Los archivos de `js/components/` y `css/` solo leen `categoria` y
  `prioridad`; no los calculan.
- El código que clasifica los tickets no importa ni depende de
  `js/components/` ni de `css/`.
- Todo el código (nombres de variables, funciones, ids del DOM) y los
  mensajes visibles al operador van en español.
- La única fuente de datos es `data/tickets.json`; no hay base de
  datos ni servicio externo.
