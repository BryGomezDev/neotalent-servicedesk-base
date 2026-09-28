// classifyCategory(ticket) → 'incidente-seguridad' | 'fallo-tecnico' | 'provisioning' | 'configuracion' | 'Sin clasificar'
// Precedencia: incidente-seguridad > fallo-tecnico > provisioning > configuracion
function classifyCategory(ticket) {
  const texto = [ticket.titulo, ticket.descripcion, ticket.sistema_afectado]
    .join(' ')
    .toLowerCase();

  // incidente-seguridad: alarma activa sin causa, credencial de baja activa, acceso indebido
  if (
    (texto.includes('alarma') && (texto.includes('sin causa') || texto.includes('sin que haya'))) ||
    texto.includes('baja sigue activa') ||
    texto.includes('acceso no autorizado') ||
    texto.includes('intrusión') ||
    texto.includes('credencial comprometida') ||
    texto.includes('uso indebido')
  ) {
    return 'incidente-seguridad';
  }

  // fallo-tecnico: componente HW/SW que dejó de funcionar
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
    return 'fallo-tecnico';
  }

  // provisioning: alta/baja/modificación de perfil o acceso de una persona
  if (
    texto.includes('sin perfil') ||
    texto.includes('acceso temporal') ||
    texto.includes('acceso caducado')
  ) {
    return 'provisioning';
  }

  // configuracion: sincronización de cuadrantes, histórico, auditoría, parámetros
  if (
    texto.includes('sin sincronizar') ||
    texto.includes('histórico') ||
    texto.includes('cuadrante')
  ) {
    return 'configuracion';
  }

  return 'Sin clasificar';
}

if (typeof module !== 'undefined') module.exports = { classifyCategory };
