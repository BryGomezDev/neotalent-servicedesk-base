# Implementación Fase 3 — Mini Service Desk

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar la bandeja de incidencias completa: clasificar los 60 tickets, validarlos, construir las utilidades de filtrado/ordenación con TDD, aplicar el diseño visual de `docs/diseno.md`, y entregar una interfaz funcional en HTML/CSS/JS vanilla servida desde un servidor HTTP local.

**Architecture:** `data/tickets.json` (fuente de verdad) → `js/app.js` (estado + coordinación) → `js/components/` (renderizado DOM) + `js/utils/` (funciones puras). Sin bundler ni framework; scripts cargados en orden con `<script>` en `index.html`. Tests en `tests/` ejecutados con `node` y `assert` nativo.

**Tech Stack:** HTML5, CSS3 (custom properties), JavaScript ES6+ vanilla. Node.js nativo (`assert`) para tests, sin npm.

**Spec:** `docs/spec.md` (fuente de verdad funcional) + `docs/diseno.md` (decisiones visuales)

## Global Constraints

- Sin frameworks, sin librerías de terceros, sin bundler, sin npm — sólo archivos estáticos
- Todo el código, ids DOM, variables y mensajes al operador en **español**, salvo palabras reservadas del lenguaje o términos sin traducción (`fetch`, `JSON`, `provisioning`)
- `js/components/` y `css/` solo **leen** `categoria` y `prioridad`; no los calculan
- El código de clasificación no importa nada de `js/components/` ni `css/`
- Tests: `node tests/<archivo>.test.js` — sólo módulo `assert` nativo, sin paquetes externos
- Toda función de `js/utils/` tiene test en verde **antes** de cerrar la tarea
- Si la tarea toca `data/tickets.json` → el script de validación debe terminar sin errores antes de cerrarla
- `data/tickets.json` es el único origen de datos

---

### Tarea 1: Clasificar los 60 tickets

**Archivos:**
- Modificar: `data/tickets.json`

**Interfaces:**
- Produce: campo `categoria` ∈ `{provisioning, fallo-tecnico, configuracion, incidente-seguridad}` y campo `prioridad` ∈ `{alta, media, baja}` en cada objeto del array

**Reglas de clasificación (de `docs/spec.md`):**

Precedencia de categoría: `incidente-seguridad` > `fallo-tecnico` > `provisioning` > `configuracion`

| Categoría | Cuándo |
|-----------|--------|
| `incidente-seguridad` | Acceso no autorizado, intrusión, alarma activa sin causa conocida, credencial comprometida o uso indebido |
| `fallo-tecnico` | Componente HW/SW dejó de funcionar (alarma desactivada, lector inoperativo, cámara caída, barrera bloqueada) |
| `provisioning` | Alta, baja o modificación de perfil/credencial/acceso de una persona |
| `configuracion` | Sincronización de cuadrantes, actualización de parámetros, histórico o auditoría — sin fallo técnico ni provisioning de persona |

Zona **perimetral** si `zona` contiene (insensible a mayúsculas): `Perímetro`, `Acceso`, `Entrada`, `Vehículos`, `Barrera`, `Valla`, `Puerta principal`, `Control de acceso`. Si no → **interior**.

| Categoría | Condición | Prioridad |
|-----------|-----------|-----------|
| `incidente-seguridad` | cualquier zona | `alta` |
| `fallo-tecnico` | zona perimetral | `alta` |
| `fallo-tecnico` | zona interior | `media` |
| `provisioning` | abierto + persona no puede acceder ahora | `media` |
| `provisioning` | abierto planificable o cerrado | `baja` |
| `configuracion` | abierto + sistema no cumple función ahora | `media` |
| `configuracion` | abierto sin impacto operativo o cerrado | `baja` |

- [ ] **Paso 1: Leer y analizar los 60 tickets**

Lee `data/tickets.json` y clasifica cada ticket aplicando las reglas anteriores. Lee `titulo`, `descripcion` y `sistema_afectado`; usa `zona` como señal de ajuste. Cuando la señal sea ambigua, aplica el nivel más conservador (más alto entre los posibles).

- [ ] **Paso 2: Escribir la clasificación**

Añadir `categoria` y `prioridad` a cada objeto de `data/tickets.json`. Mantener todos los campos originales intactos. El archivo resultante debe ser JSON válido.

Estructura de cada objeto tras la modificación:
```json
{
  "id": "SVD-4100",
  "titulo": "...",
  "descripcion": "...",
  "sistema_afectado": "...",
  "reportado_por": "...",
  "zona": "...",
  "fecha": "...",
  "estado": "cerrado",
  "categoria": "provisioning",
  "prioridad": "baja"
}
```

- [ ] **Paso 3: Commit**

```bash
git add data/tickets.json
git commit -m "datos: clasificar 60 tickets con categoria y prioridad"
```

---

### Tarea 2: Script de validación del dataset

**Archivos:**
- Crear: `tests/validar-dataset.test.js`

**Interfaces:**
- Consume: `data/tickets.json` (vía `require('../data/tickets.json')`)
- Produce: salida de consola con errores detallados; proceso termina con `code 1` si algún ticket falla

- [ ] **Paso 1: Crear el directorio tests si no existe**

```bash
mkdir tests
```

- [ ] **Paso 2: Escribir el script**

Crear `tests/validar-dataset.test.js`:

```javascript
const assert = require('assert');
const tickets = require('../data/tickets.json');

const CATEGORIAS_VALIDAS = ['provisioning', 'fallo-tecnico', 'configuracion', 'incidente-seguridad'];
const PRIORIDADES_VALIDAS = ['alta', 'media', 'baja'];

let errores = [];

assert.strictEqual(tickets.length, 60, `Se esperaban 60 tickets, hay ${tickets.length}`);

tickets.forEach((t) => {
  if (!CATEGORIAS_VALIDAS.includes(t.categoria)) {
    errores.push(`${t.id}: categoria inválida → "${t.categoria}"`);
  }
  if (!PRIORIDADES_VALIDAS.includes(t.prioridad)) {
    errores.push(`${t.id}: prioridad inválida → "${t.prioridad}"`);
  }
});

if (errores.length > 0) {
  console.error('Validación fallida:');
  errores.forEach((e) => console.error(' ', e));
  process.exit(1);
}

console.log(`✓ ${tickets.length} tickets validados — todos tienen categoria y prioridad correctas`);
```

- [ ] **Paso 3: Ejecutar la validación**

```bash
node tests/validar-dataset.test.js
```

Salida esperada: `✓ 60 tickets validados — todos tienen categoria y prioridad correctas`

Si falla: corregir los tickets listados en `data/tickets.json` y volver al paso 3.

- [ ] **Paso 4: Commit**

```bash
git add tests/validar-dataset.test.js
git commit -m "tests: script de validacion del dataset (CA-01, CA-02)"
```

---

### Tarea 3: Utilidades puras con TDD

**Archivos:**
- Crear: `js/utils/filtrar.js`
- Crear: `js/utils/ordenar.js`
- Crear: `js/utils/formato.js`
- Crear: `tests/utils.test.js`

**Interfaces:**
- `filtrarTickets(tickets, { categorias, prioridades })` → array filtrado
  - `categorias` y `prioridades` son arrays de strings. Array vacío = sin filtro para esa dimensión.
  - OR dentro de cada dimensión, AND entre dimensiones
- `ordenarPorPrioridad(tickets)` → nuevo array ordenado (no muta el original)
  - Order: alta → media → baja; empate → `fecha` descendente (string ISO: sort lexicográfico basta)
- `formatearFecha(isoStr)` → string `DD/MM/AA`
  - `'2026-09-04'` → `'04/09/26'`
- Todos exportan con guard: `if (typeof module !== 'undefined') module.exports = { fn };`

- [ ] **Paso 1: Escribir el test completo primero**

Crear `tests/utils.test.js`:

```javascript
const assert = require('assert');
const { filtrarTickets } = require('../js/utils/filtrar');
const { ordenarPorPrioridad } = require('../js/utils/ordenar');
const { formatearFecha } = require('../js/utils/formato');

// ── filtrarTickets ──────────────────────────────────────────────────────────

const TICKETS = [
  { id: 'T1', categoria: 'provisioning',        prioridad: 'alta',  fecha: '2026-01-01', estado: 'abierto' },
  { id: 'T2', categoria: 'fallo-tecnico',        prioridad: 'media', fecha: '2026-01-02', estado: 'abierto' },
  { id: 'T3', categoria: 'configuracion',        prioridad: 'baja',  fecha: '2026-01-03', estado: 'cerrado' },
  { id: 'T4', categoria: 'incidente-seguridad',  prioridad: 'alta',  fecha: '2026-01-04', estado: 'abierto' },
  { id: 'T5', categoria: 'fallo-tecnico',        prioridad: 'alta',  fecha: '2026-01-05', estado: 'cerrado' },
];

// Sin filtros activos → todos
let res = filtrarTickets(TICKETS, { categorias: [], prioridades: [] });
assert.strictEqual(res.length, 5, 'sin filtros debe devolver todos');

// Filtro por una categoría
res = filtrarTickets(TICKETS, { categorias: ['fallo-tecnico'], prioridades: [] });
assert.strictEqual(res.length, 2);
assert.ok(res.every(t => t.categoria === 'fallo-tecnico'));

// Filtro por dos categorías (OR)
res = filtrarTickets(TICKETS, { categorias: ['provisioning', 'configuracion'], prioridades: [] });
assert.strictEqual(res.length, 2);

// Filtro por prioridad
res = filtrarTickets(TICKETS, { categorias: [], prioridades: ['alta'] });
assert.strictEqual(res.length, 3);

// AND entre dimensiones
res = filtrarTickets(TICKETS, { categorias: ['fallo-tecnico'], prioridades: ['alta'] });
assert.strictEqual(res.length, 1);
assert.strictEqual(res[0].id, 'T5');

// Combinación sin resultados
res = filtrarTickets(TICKETS, { categorias: ['configuracion'], prioridades: ['alta'] });
assert.strictEqual(res.length, 0);

// ── ordenarPorPrioridad ─────────────────────────────────────────────────────

const DESORDENADOS = [
  { id: 'A', prioridad: 'baja',  fecha: '2026-03-01' },
  { id: 'B', prioridad: 'alta',  fecha: '2026-01-01' },
  { id: 'C', prioridad: 'media', fecha: '2026-02-01' },
  { id: 'D', prioridad: 'alta',  fecha: '2026-02-01' },
];

const ordenados = ordenarPorPrioridad(DESORDENADOS);
assert.strictEqual(ordenados[0].prioridad, 'alta');
assert.strictEqual(ordenados[1].prioridad, 'alta');
assert.strictEqual(ordenados[2].prioridad, 'media');
assert.strictEqual(ordenados[3].prioridad, 'baja');

// Empate de prioridad → fecha descendente (D antes que B)
assert.strictEqual(ordenados[0].id, 'D', 'empate alta: fecha más reciente primero');
assert.strictEqual(ordenados[1].id, 'B');

// No muta el original
assert.strictEqual(DESORDENADOS[0].id, 'A', 'no debe mutar el array original');

// ── formatearFecha ──────────────────────────────────────────────────────────

assert.strictEqual(formatearFecha('2026-09-04'), '04/09/26');
assert.strictEqual(formatearFecha('2026-12-31'), '31/12/26');
assert.strictEqual(formatearFecha('2026-01-05'), '05/01/26');

console.log('✓ Todos los tests de utilidades pasan');
```

- [ ] **Paso 2: Ejecutar y verificar que falla**

```bash
node tests/utils.test.js
```

Esperado: error de módulo no encontrado (`Cannot find module '../js/utils/filtrar'`).

- [ ] **Paso 3: Implementar `js/utils/filtrar.js`**

```javascript
function filtrarTickets(tickets, { categorias, prioridades }) {
  return tickets.filter((t) => {
    const pasaCategoria = categorias.length === 0 || categorias.includes(t.categoria);
    const pasaPrioridad = prioridades.length === 0 || prioridades.includes(t.prioridad);
    return pasaCategoria && pasaPrioridad;
  });
}

if (typeof module !== 'undefined') module.exports = { filtrarTickets };
```

- [ ] **Paso 4: Implementar `js/utils/ordenar.js`**

```javascript
const ORDEN_PRIORIDAD = { alta: 0, media: 1, baja: 2 };

function ordenarPorPrioridad(tickets) {
  return [...tickets].sort((a, b) => {
    const diff = ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad];
    if (diff !== 0) return diff;
    return b.fecha.localeCompare(a.fecha); // descendente: más reciente primero
  });
}

if (typeof module !== 'undefined') module.exports = { ordenarPorPrioridad };
```

- [ ] **Paso 5: Implementar `js/utils/formato.js`**

```javascript
function formatearFecha(isoStr) {
  const [anio, mes, dia] = isoStr.split('-');
  return `${dia}/${mes}/${anio.slice(2)}`;
}

if (typeof module !== 'undefined') module.exports = { formatearFecha };
```

- [ ] **Paso 6: Ejecutar y verificar que pasa**

```bash
node tests/utils.test.js
```

Esperado: `✓ Todos los tests de utilidades pasan`

- [ ] **Paso 7: Commit**

```bash
git add js/utils/filtrar.js js/utils/ordenar.js js/utils/formato.js tests/utils.test.js
git commit -m "feat: utilidades puras con tests (filtrar, ordenar, formato)"
```

---

### Tarea 4: CSS y estructura HTML

**Archivos:**
- Reescribir: `css/styles.css`
- Reescribir: `index.html`

**Interfaces:**
- Produce: sidebar fijo 220px + área principal con margin-left:220px
- Produce: todos los tokens CSS según `docs/diseno.md`
- Produce: ids y clases DOM que consumen las tareas 5 y 6:
  - `#sidebar` — aside fijo
  - `#area-principal` — main content
  - `#filtros-categoria` — contenedor chips de categoría
  - `#filtros-prioridad` — contenedor chips de prioridad
  - `#tabla-tickets` — tbody donde se renderizan las filas
  - `#estado-vacio` — elemento oculto por defecto; visible cuando no hay resultados

- [ ] **Paso 1: Reescribir `css/styles.css`**

```css
/* ── Tokens ───────────────────────────────────────────────────── */
:root {
  --color-primario:            #4B3FA0;
  --color-primario-hover:      rgba(75, 63, 160, 0.12);
  --color-fondo:               #F4F5FB;
  --color-superficie:          #FFFFFF;
  --color-texto-principal:     #1A1D3B;
  --color-texto-secundario:    #6B7280;
  --color-borde:               #E5E7EB;

  --color-alta-fondo:          #FEE2E2;
  --color-alta-texto:          #DC2626;
  --color-media-fondo:         #FEF3C7;
  --color-media-texto:         #D97706;
  --color-baja-fondo:          #D1FAE5;
  --color-baja-texto:          #059669;

  --color-categoria-fondo:     #EDE9FE;
  --color-categoria-texto:     #5B21B6;

  --color-abierto-fondo:       #DBEAFE;
  --color-abierto-texto:       #1D4ED8;
  --color-cerrado-fondo:       #F3F4F6;
  --color-cerrado-texto:       #6B7280;
}

/* ── Reset mínimo ─────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--color-fondo);
  color: var(--color-texto-principal);
}

/* ── Sidebar ──────────────────────────────────────────────────── */
#sidebar {
  width: 220px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: var(--color-primario);
  padding-top: 24px;
  z-index: 100;
}

.sidebar-logo {
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  padding: 0 20px 32px;
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin: 0 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: background 150ms ease;
  border-left: 3px solid transparent;
  text-decoration: none;
}

.sidebar-nav-item.activo {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border-left-color: #fff;
}

.sidebar-nav-item:not(.activo):hover {
  background: rgba(255, 255, 255, 0.08);
}

/* ── Área principal ───────────────────────────────────────────── */
#area-principal {
  margin-left: 220px;
  padding: 32px 28px;
  min-height: 100vh;
}

.titulo-pagina {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-texto-principal);
  margin-bottom: 24px;
}

/* ── Barra de filtros ─────────────────────────────────────────── */
.barra-filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 20px;
}

.grupo-filtro {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.filtro-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-texto-secundario);
  margin-right: 2px;
}

.chip {
  border: 1.5px solid var(--color-primario);
  color: var(--color-primario);
  background: var(--color-superficie);
  border-radius: 9999px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
}

.chip:hover:not(.chip-activo) {
  background: rgba(75, 63, 160, 0.08);
}

.chip-activo {
  background: var(--color-primario);
  color: #fff;
  border-color: var(--color-primario);
}

/* ── Tabla ────────────────────────────────────────────────────── */
.contenedor-tabla {
  background: var(--color-superficie);
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--color-fondo);
}

thead th {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-texto-secundario);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-borde);
  text-align: left;
}

tbody tr {
  border-bottom: 1px solid var(--color-borde);
  transition: background 100ms ease;
}

tbody tr:last-child { border-bottom: none; }

tbody tr:hover { background: rgba(75, 63, 160, 0.04); }

tbody td {
  padding: 12px 16px;
  font-size: 14px;
  color: var(--color-texto-principal);
}

.col-titulo {
  max-width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

/* ── Badges ───────────────────────────────────────────────────── */
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.badge-alta    { background: var(--color-alta-fondo);     color: var(--color-alta-texto); }
.badge-media   { background: var(--color-media-fondo);    color: var(--color-media-texto); }
.badge-baja    { background: var(--color-baja-fondo);     color: var(--color-baja-texto); }

.badge-categoria { background: var(--color-categoria-fondo); color: var(--color-categoria-texto); }

.badge-abierto { background: var(--color-abierto-fondo);  color: var(--color-abierto-texto); }
.badge-cerrado { background: var(--color-cerrado-fondo);  color: var(--color-cerrado-texto); }

/* ── Estado vacío ─────────────────────────────────────────────── */
#estado-vacio {
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  gap: 12px;
}

#estado-vacio.visible { display: flex; }

.icono-vacio {
  font-size: 32px;
  color: #D1D5DB;
}

.texto-vacio {
  font-size: 15px;
  color: var(--color-texto-secundario);
}
```

- [ ] **Paso 2: Reescribir `index.html`**

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mini Service Desk</title>
  <link rel="stylesheet" href="css/styles.css" />
</head>
<body>

  <!-- Sidebar -->
  <aside id="sidebar">
    <div class="sidebar-logo">⊙ Mini Service Desk</div>
    <nav>
      <a class="sidebar-nav-item activo">▦ Bandeja</a>
    </nav>
  </aside>

  <!-- Área principal -->
  <main id="area-principal">
    <h1 class="titulo-pagina">Bandeja de incidencias</h1>

    <!-- Filtros -->
    <div class="barra-filtros">
      <div class="grupo-filtro">
        <span class="filtro-label">Categoría:</span>
        <div id="filtros-categoria"></div>
      </div>
      <div class="grupo-filtro">
        <span class="filtro-label">Prioridad:</span>
        <div id="filtros-prioridad"></div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="contenedor-tabla">
      <table>
        <thead>
          <tr>
            <th style="width:100px">Prioridad</th>
            <th style="width:90px">ID</th>
            <th>Título</th>
            <th style="width:170px">Categoría</th>
            <th style="width:150px">Zona</th>
            <th style="width:90px">Fecha</th>
            <th style="width:90px">Estado</th>
          </tr>
        </thead>
        <tbody id="tabla-tickets"></tbody>
      </table>
      <div id="estado-vacio">
        <span class="icono-vacio">◎</span>
        <span class="texto-vacio">Sin resultados para los filtros activos.</span>
      </div>
    </div>
  </main>

  <!-- Scripts: utils → components → app -->
  <script src="js/utils/filtrar.js"></script>
  <script src="js/utils/ordenar.js"></script>
  <script src="js/utils/formato.js"></script>
  <script src="js/components/filtros.js"></script>
  <script src="js/components/tabla.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Paso 3: Commit**

```bash
git add css/styles.css index.html
git commit -m "feat: CSS con tokens de diseno y estructura HTML completa"
```

---

### Tarea 5: Componentes de UI

**Archivos:**
- Crear: `js/components/filtros.js`
- Crear: `js/components/tabla.js`

**Interfaces:**
- Consume (de utils): `filtrarTickets`, `ordenarPorPrioridad`, `formatearFecha` (disponibles como globales en el navegador porque los `<script>` se cargaron antes)
- `renderizarFiltros(onCambio)` — dibuja los chips en `#filtros-categoria` y `#filtros-prioridad`; llama `onCambio()` al togglear un chip
- `renderizarTabla(tickets)` — vacía `#tabla-tickets` y renderiza una fila por ticket; muestra/oculta `#estado-vacio`

- [ ] **Paso 1: Crear `js/components/filtros.js`**

```javascript
const CATEGORIAS = ['provisioning', 'fallo-tecnico', 'configuracion', 'incidente-seguridad'];
const PRIORIDADES = ['alta', 'media', 'baja'];

const estadoFiltros = { categorias: [], prioridades: [] };

function renderizarFiltros(onCambio) {
  _renderizarGrupo('filtros-categoria', CATEGORIAS, estadoFiltros.categorias, onCambio);
  _renderizarGrupo('filtros-prioridad', PRIORIDADES, estadoFiltros.prioridades, onCambio);
}

function _renderizarGrupo(idContenedor, valores, activos, onCambio) {
  const contenedor = document.getElementById(idContenedor);
  contenedor.innerHTML = '';
  contenedor.style.display = 'flex';
  contenedor.style.flexWrap = 'wrap';
  contenedor.style.gap = '8px';

  valores.forEach((valor) => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (activos.includes(valor) ? ' chip-activo' : '');
    btn.textContent = valor;
    btn.addEventListener('click', () => {
      const idx = activos.indexOf(valor);
      if (idx === -1) activos.push(valor);
      else activos.splice(idx, 1);
      btn.classList.toggle('chip-activo');
      onCambio();
    });
    contenedor.appendChild(btn);
  });
}

function obtenerFiltrosActivos() {
  return {
    categorias: [...estadoFiltros.categorias],
    prioridades: [...estadoFiltros.prioridades],
  };
}
```

- [ ] **Paso 2: Crear `js/components/tabla.js`**

```javascript
function renderizarTabla(tickets) {
  const tbody = document.getElementById('tabla-tickets');
  const estadoVacio = document.getElementById('estado-vacio');

  tbody.innerHTML = '';

  if (tickets.length === 0) {
    estadoVacio.classList.add('visible');
    return;
  }

  estadoVacio.classList.remove('visible');

  tickets.forEach((t) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="badge badge-${t.prioridad}">${t.prioridad}</span></td>
      <td>${t.id}</td>
      <td class="col-titulo" title="${_escapar(t.titulo)}">${_escapar(t.titulo)}</td>
      <td><span class="badge badge-categoria">${t.categoria}</span></td>
      <td>${_escapar(t.zona)}</td>
      <td>${formatearFecha(t.fecha)}</td>
      <td><span class="badge badge-${t.estado}">${t.estado}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function _escapar(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

- [ ] **Paso 3: Commit**

```bash
git add js/components/filtros.js js/components/tabla.js
git commit -m "feat: componentes de filtros y tabla"
```

---

### Tarea 6: Coordinador `js/app.js`

**Archivos:**
- Reescribir: `js/app.js`

**Interfaces:**
- Consume: `data/tickets.json` (vía `fetch`)
- Consume: `filtrarTickets`, `ordenarPorPrioridad` (utils), `renderizarFiltros`, `renderizarTabla`, `obtenerFiltrosActivos` (components)
- No exporta nada; es el punto de entrada

- [ ] **Paso 1: Reescribir `js/app.js`**

```javascript
let todosLosTickets = [];

function actualizarVista() {
  const filtros = obtenerFiltrosActivos();
  const filtrados = filtrarTickets(todosLosTickets, filtros);
  const ordenados = ordenarPorPrioridad(filtrados);
  renderizarTabla(ordenados);
}

fetch('data/tickets.json')
  .then((r) => r.json())
  .then((tickets) => {
    todosLosTickets = tickets;
    renderizarFiltros(actualizarVista);
    actualizarVista();
  })
  .catch(() => {
    document.getElementById('area-principal').innerHTML =
      '<p style="color:red;padding:20px">Error: no se pudo cargar data/tickets.json. Sirve desde un servidor HTTP.</p>';
  });
```

- [ ] **Paso 2: Commit**

```bash
git add js/app.js
git commit -m "feat: app.js coordinador — carga, filtrado y renderizado"
```

---

### Tarea 7: Verificación de criterios de aceptación

**Archivos:**
- Sin cambios de código (sólo verificación)

**Checklist CA-01..CA-11:**

- [ ] **CA-01/CA-02**: Ejecutar validación del dataset

```bash
node tests/validar-dataset.test.js
```
Esperado: `✓ 60 tickets validados`

- [ ] **CA-03**: Verificar que ningún campo original fue eliminado

```bash
node -e "const t = require('./data/tickets.json')[0]; console.log(Object.keys(t))"
```
Esperado: `[ 'id', 'titulo', 'descripcion', 'sistema_afectado', 'reportado_por', 'zona', 'fecha', 'estado', 'categoria', 'prioridad' ]`

- [ ] **CA-04/CA-05**: Abrir navegador y verificar visualmente

```bash
python -m http.server 8080
```
Navegar a `http://localhost:8080` y verificar:
- Los 7 campos aparecen para cada ticket
- Badges: alta=rojo, media=amarillo/naranja, baja=verde

- [ ] **CA-06**: Filtro por categoría

1. Click en `provisioning` solo → sólo aparecen tickets de provisioning
2. Click en `provisioning` + `fallo-tecnico` → aparecen tickets de cualquiera de las dos (OR)
3. Con `provisioning` activo, click en `alta` → sólo provisioning AND alta (AND entre dimensiones)

- [ ] **CA-07**: Filtro por prioridad (mismo patrón, dimensión prioridad)

- [ ] **CA-08**: Orden por defecto al cargar

Sin filtros: los tickets `alta` aparecen antes que `media`, `media` antes que `baja`. Dentro del mismo nivel, la fecha más reciente aparece primero.

- [ ] **CA-09**: Tests de utilidades en verde

```bash
node tests/utils.test.js
```
Esperado: `✓ Todos los tests de utilidades pasan`

- [ ] **CA-10**: Sin errores de consola

En DevTools → Console: sin errores en rojo al cargar `http://localhost:8080`.

- [ ] **CA-11**: Estado vacío sin resetear el filtro

Activar una combinación que no tenga resultados (ej. `incidente-seguridad` + `baja` si no hay tickets así). Verificar que aparece el mensaje "Sin resultados para los filtros activos." y que los chips siguen activos.

- [ ] **Paso final: Commit de cierre**

```bash
git add -A
git commit -m "verificacion: criterios de aceptacion CA-01..CA-11 en verde"
```
