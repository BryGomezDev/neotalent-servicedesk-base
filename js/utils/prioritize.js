// Matriz de prioridad según docs/spec.md
// inferUrgency  → 'critica' | 'alta' | 'media' | 'baja'
// mapZoneToImpact → 'alto' | 'bajo'
// classifyPriority(urgencia, impacto, categoria) → 'alta' | 'media' | 'baja'

const ZONAS_CONOCIDAS = [
  'perímetro', 'acceso', 'entrada', 'vehículos',
  'barrera', 'valla', 'puerta principal', 'control de acceso',
];

function mapZoneToImpact(zona) {
  const z = zona.toLowerCase();
  return ZONAS_CONOCIDAS.some((kw) => z.includes(kw)) ? 'alto' : 'bajo';
}

function inferUrgency(ticket) {
  const texto = (ticket.titulo + ' ' + ticket.descripcion).toLowerCase();

  // critica: señales de incidente de seguridad activo
  if (
    (texto.includes('alarma') && (texto.includes('sin causa') || texto.includes('sin que haya'))) ||
    texto.includes('baja sigue activa') ||
    texto.includes('acceso no autorizado') ||
    texto.includes('intrusión') ||
    texto.includes('credencial comprometida') ||
    texto.includes('uso indebido')
  ) {
    return 'critica';
  }

  // alta: fallo de componente HW/SW
  if (
    texto.includes('desactivada') ||
    texto.includes('sin grabar') ||
    texto.includes('sin respuesta') ||
    texto.includes('lento') ||
    texto.includes('no registra') ||
    texto.includes('no llega') ||
    texto.includes('corte de grabación') ||
    texto.includes('abierta sin alarma') ||
    texto.includes('doble fichaje')
  ) {
    return 'alta';
  }

  // media: provisioning o configuracion que bloquea operación ahora mismo (ticket abierto)
  if (
    ticket.estado === 'abierto' &&
    (texto.includes('sin perfil') || texto.includes('sin asignar'))
  ) {
    return 'media';
  }

  return 'baja';
}

// urgencia: 'critica' → siempre alta
//           'alta'    → depende del impacto de zona
//           'media'   → media
//           'baja'    → baja
function classifyPriority(urgencia, impacto, categoria) { // eslint-disable-line no-unused-vars
  if (urgencia === 'critica') return 'alta';
  if (urgencia === 'alta') return impacto === 'alto' ? 'alta' : 'media';
  if (urgencia === 'media') return 'media';
  return 'baja';
}

if (typeof module !== 'undefined') module.exports = { ZONAS_CONOCIDAS, mapZoneToImpact, inferUrgency, classifyPriority };
