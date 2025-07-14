import { inicializarFormulario } from '../formulario';

(async () => {
  console.log('🚀 formulario-loader iniciado');

  // Esperá a que el botón esté en el DOM
  const esperarElemento = selector => new Promise(resolve => {
    const check = () => {
      if (document.querySelector(selector)) {
        resolve();
      } else {
        requestAnimationFrame(check);
      }
    };
    check();
  });

  await esperarElemento('#btnEnviarFormulario');
  inicializarFormulario();

  console.log('✅ formulario inicializado');
})();
