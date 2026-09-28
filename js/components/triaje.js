function renderizarTriaje(tickets) {
  const grid = document.getElementById('grid-triaje');
  const estadoVacio = document.getElementById('estado-vacio');

  grid.innerHTML = '';

  if (tickets.length === 0) {
    estadoVacio.classList.add('visible');
    return;
  }

  estadoVacio.classList.remove('visible');

  tickets.forEach((t) => {
    const card = document.createElement('article');
    card.className = `card-triaje card-triaje--${_esc(t.prioridad)}`;
    card.innerHTML = `
      <div class="card-triaje__header">
        <span class="badge badge-${_esc(t.prioridad)}">${_esc(t.prioridad)}</span>
        <span class="card-triaje__id">${_esc(t.id)}</span>
        <span class="badge badge-${_esc(t.estado)}">${_esc(t.estado)}</span>
      </div>
      <h2 class="card-triaje__titulo">${_esc(t.titulo)}</h2>
      <p class="card-triaje__descripcion">${_esc(t.descripcion)}</p>
      <span class="card-triaje__sistema">${_esc(t.sistema_afectado)}</span>
      <div class="card-triaje__footer">
        <span class="badge badge-categoria">${_esc(t.categoria)}</span>
        <span class="card-triaje__meta">${_esc(t.zona)}</span>
        <span class="card-triaje__meta">${formatearFecha(t.fecha)}</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

function _esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
