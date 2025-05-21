export function limpiarFormulario() {
    const inputs = document.querySelectorAll('#contenedor-modulos input, #contenedor-modulos select, #contenedor-modulos textarea');
    inputs.forEach(input => {
      if (input.type === 'checkbox' || input.type === 'radio') {
        input.checked = false;
      } else {
        input.value = '';
      }
    });
  }
  