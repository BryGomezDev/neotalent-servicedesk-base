let ticketsBase = [];
let todosLosTickets = [];

function ticketsLocales() {
  return JSON.parse(localStorage.getItem('tickets-locales') || '[]');
}

function siguienteIdLocal() {
  const nums = ticketsLocales()
    .map(t => parseInt(t.id.replace('LOCAL-', ''), 10))
    .filter(n => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return 'LOCAL-' + String(max + 1).padStart(4, '0');
}

function fusionar() {
  todosLosTickets = [...ticketsBase, ...ticketsLocales()];
}

function actualizarVista() {
  const filtros = obtenerFiltrosActivos();
  const filtrados = filtrarTickets(todosLosTickets, filtros);
  const ordenados = ordenarPorPrioridad(filtrados);
  renderizarTabla(ordenados);
}

fetch('data/tickets.json')
  .then((r) => r.json())
  .then((base) => {
    ticketsBase = base;
    fusionar();
    renderizarFiltros(actualizarVista);
    actualizarVista();
  })
  .catch(() => {
    const main = document.querySelector('main');
    if (main) main.innerHTML =
      '<p class="error-carga">Error: no se pudo cargar data/tickets.json. Sirve desde un servidor HTTP.</p>';
  });
