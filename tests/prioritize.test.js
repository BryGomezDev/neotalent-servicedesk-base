const assert = require('assert');
const { ZONAS_CONOCIDAS, mapZoneToImpact, inferUrgency, classifyPriority } = require('../js/utils/prioritize');

// ── ZONAS_CONOCIDAS ──────────────────────────────────────────────────────────
assert.ok(Array.isArray(ZONAS_CONOCIDAS), 'ZONAS_CONOCIDAS debe ser un array');
assert.ok(ZONAS_CONOCIDAS.length > 0, 'ZONAS_CONOCIDAS no puede estar vacío');

// ── mapZoneToImpact ──────────────────────────────────────────────────────────
assert.strictEqual(mapZoneToImpact('Perímetro exterior'),        'alto');
assert.strictEqual(mapZoneToImpact('Acceso peatonal Este'),      'alto');
assert.strictEqual(mapZoneToImpact('Entrada de vehículos'),      'alto');
assert.strictEqual(mapZoneToImpact('Control de acceso norte'),   'alto');
assert.strictEqual(mapZoneToImpact('Oficinas centrales'),        'bajo');
assert.strictEqual(mapZoneToImpact('Almacén Norte'),             'bajo');
assert.strictEqual(mapZoneToImpact('Aparcamiento -1'),           'bajo');
assert.strictEqual(mapZoneToImpact('Sala de servidores'),        'bajo');
assert.strictEqual(mapZoneToImpact('Vestuarios de personal'),    'bajo');

// ── inferUrgency ─────────────────────────────────────────────────────────────
function ticket(titulo, descripcion, estado) {
  return { titulo, descripcion, estado };
}

// critica
assert.strictEqual(inferUrgency(ticket('Alarma nocturna sin causa aparente', '', 'abierto')), 'critica');
assert.strictEqual(inferUrgency(ticket('Alarma de Torre de control', 'sin que haya movimiento', 'abierto')), 'critica');
assert.strictEqual(inferUrgency(ticket('Tarjeta de baja sigue activa', '', 'abierto')), 'critica');

// alta
assert.strictEqual(inferUrgency(ticket('Lector de tarjetas sin respuesta', '', 'abierto')), 'alta');
assert.strictEqual(inferUrgency(ticket('Cámara 8 sin grabar', '', 'abierto')), 'alta');
assert.strictEqual(inferUrgency(ticket('Alarma perimetral desactivada', '', 'abierto')), 'alta');
assert.strictEqual(inferUrgency(ticket('Puerta de emergencia abierta sin alarma', '', 'abierto')), 'alta');
assert.strictEqual(inferUrgency(ticket('Corte de grabación repetido', '', 'cerrado')), 'alta');

// media
assert.strictEqual(inferUrgency(ticket('Guardia nuevo sin perfil de acceso', '', 'abierto')), 'media');
assert.strictEqual(inferUrgency(ticket('Cuadrante sin sincronizar', 'dos guardias sin asignar', 'abierto')), 'media');

// baja — ticket cerrado aunque tenga sin-perfil
assert.strictEqual(inferUrgency(ticket('Guardia nuevo sin perfil de acceso', '', 'cerrado')), 'baja');
// baja — acceso planificable futuro
assert.strictEqual(inferUrgency(ticket('Acceso temporal de proveedor', 'caduca en 9 días', 'abierto')), 'baja');
// baja — solicitud de histórico
assert.strictEqual(inferUrgency(ticket('Solicitud de histórico de accesos', '', 'abierto')), 'baja');

// ── classifyPriority ─────────────────────────────────────────────────────────
// critica → siempre alta, sin importar zona
assert.strictEqual(classifyPriority('critica', 'bajo',  'incidente-seguridad'), 'alta');
assert.strictEqual(classifyPriority('critica', 'alto',  'incidente-seguridad'), 'alta');

// alta + perimetral → alta
assert.strictEqual(classifyPriority('alta', 'alto',  'fallo-tecnico'), 'alta');
// alta + interior  → media
assert.strictEqual(classifyPriority('alta', 'bajo',  'fallo-tecnico'), 'media');

// media → media independientemente de zona
assert.strictEqual(classifyPriority('media', 'alto', 'provisioning'),  'media');
assert.strictEqual(classifyPriority('media', 'bajo', 'configuracion'), 'media');

// baja → baja independientemente de zona
assert.strictEqual(classifyPriority('baja', 'alto', 'provisioning'),   'baja');
assert.strictEqual(classifyPriority('baja', 'bajo', 'configuracion'),  'baja');

console.log('✓ prioritize: todos los tests pasan');
