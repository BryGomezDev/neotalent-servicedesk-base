function filtrarTickets(tickets, { categorias, prioridades }) {
  return tickets.filter((t) => {
    const pasaCategoria = categorias.length === 0 || categorias.includes(t.categoria);
    const pasaPrioridad = prioridades.length === 0 || prioridades.includes(t.prioridad);
    return pasaCategoria && pasaPrioridad;
  });
}

if (typeof module !== 'undefined') module.exports = { filtrarTickets };
