const CATEGORIAS = ['provisioning', 'fallo-tecnico', 'configuracion', 'incidente-seguridad'];
const PRIORIDADES = ['alta', 'media', 'baja'];

const estadoFiltros = { categorias: [], prioridades: [] };

function renderizarFiltros(onCambio) {
  _renderizarGrupo('filtros-categoria', CATEGORIAS, estadoFiltros.categorias, onCambio);
  _renderizarGrupo('filtros-prioridad', PRIORIDADES, estadoFiltros.prioridades, onCambio);
}

function _renderizarGrupo(idContenedor, valores, activos, onCambio) {
  const contenedor = document.getElementById(idContenedor);
  contenedor.innerHTML = '';

  valores.forEach((valor) => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (activos.includes(valor) ? ' chip-activo' : '');
    btn.textContent = valor;
    btn.addEventListener('click', () => {
      const idx = activos.indexOf(valor);
      if (idx === -1) activos.push(valor);
      else activos.splice(idx, 1);
      btn.classList.toggle('chip-activo');
      onCambio();
    });
    contenedor.appendChild(btn);
  });
}

function obtenerFiltrosActivos() {
  return {
    categorias: [...estadoFiltros.categorias],
    prioridades: [...estadoFiltros.prioridades],
  };
}
