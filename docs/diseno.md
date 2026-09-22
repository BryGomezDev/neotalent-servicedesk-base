# Diseño — Mini Service Desk, Fase 2

## Referencia visual

Inspiración: dashboard **ForShop** (e-commerce) de `assets/model.png`.
Elementos adoptados: paleta morado índigo, bordes redondeados, sidebar
fijo, tipografía sans-serif limpia, fondos suaves. Elementos descartados
por estar fuera del alcance de Fase 1 (`docs/spec.md`): gráficas de
líneas, tarjetas KPI de métricas y panel derecho de rankings.

---

## Layout general

**Estructura: sidebar fijo izquierdo + área principal**

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR (220 px, fijo)  │  ÁREA PRINCIPAL (resto del viewport) │
│  ──────────────────────  │  ───────────────────────────────────  │
│  Logo + nombre sistema   │  Título de página                     │
│                          │  ──────────────────────────────────   │
│  ▦  Bandeja  ← activo    │  Barra de filtros (chips toggle)      │
│                          │  ──────────────────────────────────   │
│                          │  Tabla de tickets (scroll vertical)   │
│                          │                                       │
└──────────────────────────┴───────────────────────────────────────┘
```

- Sidebar: `width: 220px`, `position: fixed`, `height: 100vh`.
- Área principal: `margin-left: 220px`, scroll solo en esta zona.
- El sidebar no hace scroll aunque la tabla sea larga.

---

## Wireframe detallado

```
┌────────────────────┬──────────────────────────────────────────────────────────────┐
│                    │  Bandeja de incidencias                                       │
│  ⊙ MSD             │                                                               │
│  Mini Service Desk │  Categoría:                                                   │
│                    │  [ provisioning ]  [ fallo-tecnico ]  [ configuracion ]        │
│────────────────────│  [ incidente-seguridad ]                                      │
│                    │                                                               │
│  ▦  Bandeja        │  Prioridad:                                                   │
│                    │  [ alta ]  [ media ]  [ baja ]                                │
│                    │                                                               │
│                    │  ┌──────────┬──────────┬──────────────────┬──────────────┬──────────┬──────────┬──────────┐
│                    │  │ PRIORIDAD│    ID    │     TÍTULO       │  CATEGORÍA   │   ZONA   │  FECHA   │  ESTADO  │
│                    │  ├──────────┼──────────┼──────────────────┼──────────────┼──────────┼──────────┼──────────┤
│                    │  │ ● alta   │ SVD-4102 │ Alarma perimet…  │ fallo-tecnico│ Perímetro│ 04/09/26 │ abierto  │
│                    │  │ ● alta   │ SVD-4108 │ Acceso no autor… │ incid-seguri.│ Acceso E.│ 08/09/26 │ abierto  │
│                    │  │ ● media  │ SVD-4101 │ Cuadrante sin s… │ configuracion│ Almacén N│ 11/09/26 │ abierto  │
│                    │  │ ● baja   │ SVD-4100 │ Guardia nuevo s… │ provisioning │ Acceso E.│ 02/09/26 │ cerrado  │
│                    │  └──────────┴──────────┴──────────────────┴──────────────┴──────────┴──────────┴──────────┘
└────────────────────┴──────────────────────────────────────────────────────────────┘
```

---

## Paleta de color

### Tokens base

| Token CSS                    | Valor             | Uso principal                              |
|------------------------------|-------------------|--------------------------------------------|
| `--color-primario`           | `#4B3FA0`         | Sidebar, chips activos, acento principal    |
| `--color-primario-hover`     | `rgba(75,63,160,0.12)` | Hover de fila, chip inactivo hover    |
| `--color-fondo`              | `#F4F5FB`         | Fondo del área principal                   |
| `--color-superficie`         | `#FFFFFF`         | Fondo de tabla y contenedores              |
| `--color-texto-principal`    | `#1A1D3B`         | Encabezados y celdas de tabla              |
| `--color-texto-secundario`   | `#6B7280`         | Labels, fechas, texto de apoyo             |
| `--color-borde`              | `#E5E7EB`         | Bordes de tabla y separadores              |

### Colores semánticos de prioridad (fijados por spec RF-04)

| Nivel   | Token fondo                  | Token texto                  | Hex fondo   | Hex texto   |
|---------|------------------------------|------------------------------|-------------|-------------|
| `alta`  | `--color-alta-fondo`         | `--color-alta-texto`         | `#FEE2E2`   | `#DC2626`   |
| `media` | `--color-media-fondo`        | `--color-media-texto`        | `#FEF3C7`   | `#D97706`   |
| `baja`  | `--color-baja-fondo`         | `--color-baja-texto`         | `#D1FAE5`   | `#059669`   |

### Color de etiqueta de categoría (un único tono para todos los valores)

| Token fondo                    | Token texto                    | Hex fondo   | Hex texto   |
|--------------------------------|--------------------------------|-------------|-------------|
| `--color-categoria-fondo`      | `--color-categoria-texto`      | `#EDE9FE`   | `#5B21B6`   |

### Colores de estado del ticket

| Valor     | Hex fondo   | Hex texto   |
|-----------|-------------|-------------|
| `abierto` | `#DBEAFE`   | `#1D4ED8`   |
| `cerrado` | `#F3F4F6`   | `#6B7280`   |

---

## Tipografía

Sin fuentes externas (restricción de stack vanilla). Stack de sistema:

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

| Elemento               | Tamaño | Peso | Color token                  |
|------------------------|--------|------|------------------------------|
| Título de página       | 22 px  | 700  | `--color-texto-principal`    |
| Cabecera de tabla      | 13 px  | 600  | `--color-texto-secundario`   |
| Celda de tabla         | 14 px  | 400  | `--color-texto-principal`    |
| Título del ticket      | 14 px  | 500  | `--color-texto-principal`    |
| Badge / etiqueta       | 12 px  | 500  | (según tabla semántica)      |
| Label de filtro        | 13 px  | 500  | `--color-texto-secundario`   |
| Nav del sidebar        | 14 px  | 500  | `rgba(255,255,255,0.85)`     |
| Nombre del sistema     | 16 px  | 700  | `#FFFFFF`                    |

---

## Especificación de componentes

### Sidebar

```
Ancho:         220 px fijo
Altura:        100 vh
Posición:      fixed, top 0, left 0
Fondo:         #4B3FA0
Padding top:   24 px
Z-index:       100
```

**Logo / nombre:**
- Icono "⊙" (o equivalente Unicode) + texto "Mini Service Desk"
- Color: blanco `#FFFFFF`, 16 px, weight 700
- Padding: 0 20px 32px 20px

**Ítem de navegación:**
- Padding: 10px 16px
- Border-radius: 8px
- Margen horizontal: 12px
- Estado activo: `background: rgba(255,255,255,0.15)`, texto blanco, borde-izquierdo `3px solid #FFFFFF`
- Estado inactivo: texto `rgba(255,255,255,0.7)`, sin borde
- Hover inactivo: `background: rgba(255,255,255,0.08)`
- Transición: `background 150ms ease`

---

### Barra de filtros

Ubicada sobre la tabla, en el área principal. Dos secciones en la misma
fila (se apilan si el viewport es estrecho):

```
Categoría:  [provisioning]  [fallo-tecnico]  [configuracion]  [incidente-seguridad]
Prioridad:  [alta]  [media]  [baja]
```

**Label de sección** ("Categoría:", "Prioridad:"): 13 px, weight 500,
`--color-texto-secundario`, margin-right 10px, vertical-align middle.

**Chip inactivo:**
```
border:        1.5px solid #4B3FA0
color:         #4B3FA0
background:    #FFFFFF
border-radius: 9999px
padding:       6px 14px
font-size:     13px
font-weight:   500
cursor:        pointer
transition:    background 150ms ease, color 150ms ease
```

**Chip activo:**
```
background:    #4B3FA0
color:         #FFFFFF
border-color:  #4B3FA0
```

**Chip hover (inactivo):** `background: rgba(75,63,160,0.08)`

Separación entre chips: `gap: 8px`. Separación entre secciones: `gap: 24px`.

---

### Tabla de tickets

**Contenedor:**
```
background:    #FFFFFF
border-radius: 12px
box-shadow:    0 1px 4px rgba(0,0,0,0.08)
overflow:      hidden
```

**Cabecera (`<thead>`):**
```
background:       #F4F5FB
color:            #6B7280
font-size:        13px
font-weight:      600
text-transform:   uppercase
letter-spacing:   0.05em
padding:          12px 16px
border-bottom:    1px solid #E5E7EB
```

**Fila (`<tr>`):**
```
min-height:      48px
border-bottom:   1px solid #E5E7EB
transition:      background 100ms ease
```
```
tr:hover { background: rgba(75,63,160,0.04); }
tr:last-child { border-bottom: none; }
```

**Celda (`<td>`):**
```
padding:    12px 16px
font-size:  14px
color:      #1A1D3B
```

**Orden de columnas** (izquierda a derecha):

| # | Campo        | Ancho aprox. | Notas                                  |
|---|-------------|-------------|----------------------------------------|
| 1 | Prioridad    | 90 px        | Badge semántico; columna de orden      |
| 2 | ID           | 90 px        | Monospace o normal                     |
| 3 | Título       | flexible     | `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` con `max-width` |
| 4 | Categoría    | 160 px       | Badge neutro morado                    |
| 5 | Zona         | 140 px       | Texto plano                            |
| 6 | Fecha        | 90 px        | Formato DD/MM/AA                       |
| 7 | Estado       | 80 px        | Badge semántico azul/gris              |

---

### Badges / etiquetas

Forma pill, aplicable a prioridad, categoría y estado:

```css
display:       inline-flex
align-items:   center
border-radius: 9999px
padding:       3px 10px
font-size:     12px
font-weight:   500
white-space:   nowrap
```

---

### Estado vacío (sin resultados)

Cuando los filtros activos no devuelven ningún ticket:

```
Área de la tabla (centrado vertical y horizontal):

    ◎
    Sin resultados para los filtros activos.
```

- Icono: carácter Unicode `◎` (o similar), 32px, `#D1D5DB`
- Texto: `"Sin resultados para los filtros activos."`, 15px, `#6B7280`
- Sin botón de reset automático (spec CL-09: el filtro no se resetea solo)

---

## Decisiones fuera de alcance en Fase 1

Las siguientes opciones fueron consideradas y descartadas
explícitamente para mantener el alcance del spec:

- Gráficas o visualizaciones de datos.
- Tarjetas KPI de conteo de tickets por prioridad.
- Panel lateral derecho (rankings u otro contenido).
- Modo oscuro.
- Diseño responsive para móvil (optimizado para escritorio).
- Animaciones más allá de `transition: 150ms ease` en hover.
- Paginación (60 tickets caben en scroll sin necesidad de paginar).
