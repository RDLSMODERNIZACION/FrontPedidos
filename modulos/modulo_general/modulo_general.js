"use strict";

console.log('✅ modulo_general.js cargado');

/**
 * Inicializa los campos del Módulo General.
 * - Los <input type="date"> se rellenan con la fecha actual si están vacíos
 *   y se establece el atributo `min` a la fecha actual.
 * - El input #rangoFechas se configura con daterangepicker cuando la librería
 *   y jQuery están disponibles. Si ya posee un valor, se respeta como rango
 *   inicial. Si no están disponibles las dependencias se avisa por consola.
 */
function inicializarModuloGeneral() {
  console.log('🚀 Ejecutando inicializarModuloGeneral()');

  const hoy = new Date();
  const hoyISO = hoy.toISOString().split('T')[0]; // Formato YYYY-MM-DD

  // 👉 Inicializar todos los <input type="date">
  document.querySelectorAll('input[type="date"]').forEach(input => {
    if (!input.value) input.value = hoyISO; // sólo si no tiene valor
    if (!input.min) input.min = hoyISO;     // establecer mínimo si no existe
  });

  // 👉 Configurar el rango de fechas si el elemento existe
  const rango = document.getElementById('rangoFechas');
  if (!rango) {
    console.warn('⚠️ No se encontró el input #rangoFechas en el DOM');
    return;
  }

  // Comprobar la presencia de jQuery y de daterangepicker
  if (!window.$ || !$.fn?.daterangepicker) {
    console.warn('⚠️ No se pudo inicializar #rangoFechas: faltan jQuery o daterangepicker');
    return;
  }

  // Evitar múltiples inicializaciones si ya está configurado
  if ($(rango).data('daterangepicker')) {
    console.log('ℹ️ #rangoFechas ya estaba inicializado');
    return;
  }

  const opciones = {
    autoUpdateInput: false,
    locale: {
      format: 'DD/MM/YYYY',
      separator: ' - ',
      cancelLabel: 'Limpiar',
      applyLabel: 'Aplicar'
    },
    startDate: hoy,
    endDate: hoy
  };

  if (rango.value) {
    const [inicio, fin] = rango.value.split(' - ');
    if (inicio && fin) {
      opciones.startDate = inicio;
      opciones.endDate = fin;
      opciones.autoUpdateInput = true;
    }
  }

  $(rango).daterangepicker(opciones);

  // Actualizar el valor del input al aplicar el rango
  $(rango).on('apply.daterangepicker', function (ev, picker) {
    this.value = picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD');
  });

  // Limpiar el valor al cancelar
  $(rango).on('cancel.daterangepicker', function () {
    this.value = '';
  });

  console.log('✅ Rango de fechas inicializado');
}

// Hacer la función accesible desde el exterior
window.inicializarModuloGeneral = inicializarModuloGeneral;
