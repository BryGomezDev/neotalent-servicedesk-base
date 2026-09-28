const assert = require('assert');
const { classifyCategory } = require('../js/utils/classify');

function t(titulo, descripcion = '', sistema_afectado = '') {
  return { titulo, descripcion, sistema_afectado, zona: 'x', estado: 'abierto' };
}

// ── incidente-seguridad ──────────────────────────────────────────────────────
assert.strictEqual(classifyCategory(t('Alarma nocturna sin causa aparente')), 'incidente-seguridad');
assert.strictEqual(classifyCategory(t('Alarma de Oficinas centrales', 'salta sola sin que haya movimiento')), 'incidente-seguridad');
assert.strictEqual(classifyCategory(t('Tarjeta de baja sigue activa en Muelle de carga')), 'incidente-seguridad');

// ── fallo-tecnico ────────────────────────────────────────────────────────────
assert.strictEqual(classifyCategory(t('Alarma perimetral desactivada tras mantenimiento')), 'fallo-tecnico');
assert.strictEqual(classifyCategory(t('Cámara 8 sin grabar en Perímetro exterior')), 'fallo-tecnico');
assert.strictEqual(classifyCategory(t('Lector de tarjetas sin respuesta en Perímetro')), 'fallo-tecnico');
assert.strictEqual(classifyCategory(t('Lector biométrico lento en Recepción')), 'fallo-tecnico');
assert.strictEqual(classifyCategory(t('Checkpoint 10 no registrado', 'la app no registra el checkpoint')), 'fallo-tecnico');
assert.strictEqual(classifyCategory(t('Interfono no llega a centralita', 'no llega desde el cambio de turno')), 'fallo-tecnico');
assert.strictEqual(classifyCategory(t('Corte de grabación repetido en cámara 3')), 'fallo-tecnico');
assert.strictEqual(classifyCategory(t('Puerta de emergencia abierta sin alarma')), 'fallo-tecnico');
assert.strictEqual(classifyCategory(t('Doble fichaje detectado', 'aparece en dos puestos a la vez')), 'fallo-tecnico');

// ── provisioning ─────────────────────────────────────────────────────────────
assert.strictEqual(classifyCategory(t('Guardia nuevo sin perfil de acceso')), 'provisioning');
assert.strictEqual(classifyCategory(t('Acceso temporal de proveedor a Sala de servidores')), 'provisioning');

// ── configuracion ────────────────────────────────────────────────────────────
assert.strictEqual(classifyCategory(t('Cuadrante de Almacén Norte sin sincronizar')), 'configuracion');
assert.strictEqual(classifyCategory(t('Solicitud de histórico de accesos')), 'configuracion');

// ── precedencia: incidente-seguridad > fallo-tecnico ────────────────────────
// "alarma sin causa" también incluye "desactivada" — gana incidente-seguridad
assert.strictEqual(
  classifyCategory(t('Alarma sin causa aparente también desactivada')),
  'incidente-seguridad'
);

// ── baja sigue activa > provisioning ─────────────────────────────────────────
// La baja con credencial activa es incidente, no mera tarea de provisioning
assert.strictEqual(
  classifyCategory(t('Tarjeta de baja sigue activa en Sala de servidores')),
  'incidente-seguridad'
);

console.log('✓ classify: todos los tests pasan');
