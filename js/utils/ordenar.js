const ORDEN_PRIORIDAD = { alta: 0, media: 1, baja: 2 };

function ordenarPorPrioridad(tickets) {
  return [...tickets].sort((a, b) => {
    const diff = ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad];
    if (diff !== 0) return diff;
    return b.fecha.localeCompare(a.fecha); // descendente: más reciente primero
  });
}

if (typeof module !== 'undefined') module.exports = { ordenarPorPrioridad };
