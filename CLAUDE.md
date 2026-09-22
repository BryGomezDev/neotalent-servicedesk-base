# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Cómo ejecutar el proyecto

No hay build ni dependencias. El único requisito es servir los archivos desde un servidor HTTP local (el `fetch()` en `app.js` falla si se abre el HTML como `file://`):

```bash
# Python (suele venir instalado)
python -m http.server 8080

# Node.js
npx serve .
```

Luego abre `http://localhost:8080` en el navegador.

## Arquitectura

Proyecto de una sola página, HTML/CSS/JS plano, sin frameworks ni bundler.

**Flujo de datos:**
`data/tickets.json` → `js/app.js` (fetch) → `js/components/` (renderizado) → DOM de `index.html`

**Responsabilidades por capa:**

- `js/app.js` — punto de entrada JS: carga el dataset, gestiona estado (filtros activos, ticket seleccionado), y coordina componentes y utilidades.
- `js/components/` — piezas de UI reutilizables (fila de ticket, ficha de detalle, filtro); reciben datos, escriben en el DOM, no tocan `tickets.json` directamente.
- `js/utils/` — funciones puras sin estado: filtrado, formateo de fechas, agrupaciones por zona/sistema. Las usan tanto `app.js` como los componentes.
- `data/tickets.json` — dataset de 60 incidencias de seguridad física. Campos actuales: `id`, `titulo`, `descripcion`, `sistema_afectado`, `reportado_por`, `zona`, `fecha`, `estado`. Faltan `prioridad` y `categoria` — se añaden mediante clasificación siguiendo los criterios de `docs/spec.md`.

## Clasificación de tickets con Claude

La clasificación de `prioridad` y `categoria` **la hace Claude Code sobre el repo, no el navegador**. El flujo esperado es:

1. Claude Code lee `data/tickets.json`.
2. Infiere `prioridad` (p.ej. alta/media/baja) y `categoria` a partir de `titulo`, `descripcion` y `sistema_afectado`.
3. Escribe los campos de vuelta en el JSON (o genera un archivo nuevo).

No se necesita ninguna API key en el proyecto: Claude Code opera localmente sobre los archivos.

## Documentos de referencia

- `docs/spec.md` — especificación funcional (Fase 1). Fuente de verdad de qué construir; entrada de la Fase 3 (Desarrollo).
- `docs/diseno.md` — decisiones de diseño y wireframes (Fase 2). Pendiente de redactar.

Cuando estén rellenos, `spec.md` es la fuente de verdad para las funcionalidades a implementar.
