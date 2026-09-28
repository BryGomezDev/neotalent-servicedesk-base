function formatearFecha(isoStr) {
  const [anio, mes, dia] = isoStr.split('-');
  return `${dia}/${mes}/${anio.slice(2)}`;
}

if (typeof module !== 'undefined') module.exports = { formatearFecha };
