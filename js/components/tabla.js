function renderizarTabla(tickets) {
  const tbody = document.getElementById('tabla-tickets');
  const estadoVacio = document.getElementById('estado-vacio');

  tbody.innerHTML = '';

  if (tickets.length === 0) {
    estadoVacio.classList.add('visible');
    return;
  }

  estadoVacio.classList.remove('visible');

  const estados = JSON.parse(localStorage.getItem('tickets-estado') || '{}');

  tickets.forEach((t) => {
    const estadoActual = (estados[t.id] && estados[t.id].estado) || t.estado;
    const badgeEstado = estadoActual.replace(/\s/g, '-');
    const tr = document.createElement('tr');
    tr.className = 'clickable';
    tr.title = 'Ver detalle';
    tr.addEventListener('click', () => {
      window.location.href = `detalle-ticket.html?id=${encodeURIComponent(t.id)}`;
    });
    tr.innerHTML = `
      <td><span class="badge badge-${_escapar(t.prioridad)}">${_escapar(t.prioridad)}</span></td>
      <td class="col-id">${_escapar(t.id)}</td>
      <td class="col-titulo" title="${_escapar(t.titulo)}">${_escapar(t.titulo)}</td>
      <td><span class="badge badge-categoria">${_escapar(t.categoria)}</span></td>
      <td>${_escapar(t.zona)}</td>
      <td>${formatearFecha(t.fecha)}</td>
      <td><span class="badge badge-${_escapar(badgeEstado)}">${_escapar(estadoActual)}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function _escapar(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
