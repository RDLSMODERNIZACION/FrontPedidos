const diasOrdenados = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

window.inicializarComponenteCronograma = function () {
  console.log("📅 inicializarComponenteCronograma ejecutada");

  const desde = document.getElementById('cronogramaDesde');
  const hasta = document.getElementById('cronogramaHasta');
  const horas = document.getElementById('cronogramaHoras');

  if (!desde || !hasta || !horas) {
    console.warn("⚠️ Faltan campos del cronograma.");
    return;
  }

  // Esto es opcional, por si querés validar o hacer algo al cambiar
  [desde, hasta, horas].forEach(el => {
    el.addEventListener('change', () => {
      console.log('📝 Cronograma actualizado:', {
        desde: desde.value,
        hasta: hasta.value,
        horas: horas.value
      });
    });
  });
};
