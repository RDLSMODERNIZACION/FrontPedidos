// ✅ Este archivo se encarga de inicializar el formulario dinámico
// Funciona tanto si entrás directo como si se carga por fetch dentro del Dashboard

document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializamos si existe el contenedor de módulos
    if (document.getElementById('contenedor-modulos')) {
      inicializarFormularioBase();
    }
  });
  
  function inicializarFormularioBase() {
    console.log("🚀 Inicializando formulario base dinámico...");
  
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
      console.error("❌ No hay usuario logueado en localStorage.");
      return;
    }
  
    fetch('../config/config_secretarias.json')
      .then(response => response.json())
      .then(config => {
        const modulos = config[usuario.secretaria]?.modulos || [];
  
        // Cargar siempre el módulo general
        cargarModuloFormulario('general');
  
        // Cargar módulos específicos de la secretaría
        modulos.forEach(modulo => cargarModuloFormulario(modulo));
      })
      .catch(error => {
        console.error('❌ Error cargando configuración de secretarías:', error);
      });
  }
  
  // 🚀 Carga individual de módulos HTML + JS
  async function cargarModuloFormulario(nombreModulo) {
    try {
      const html = await fetch(`../modulos/${nombreModulo}/${nombreModulo}.html`).then(r => r.text());
      document.getElementById('contenedor-modulos').insertAdjacentHTML('beforeend', html);
  
      const script = document.createElement('script');
      script.src = `../modulos/${nombreModulo}/${nombreModulo}.js`;
      script.defer = true;
      document.body.appendChild(script);
  
      console.log(`✅ Módulo formulario "${nombreModulo}" cargado.`);
    } catch (error) {
      console.error(`❌ Error cargando módulo "${nombreModulo}":`, error);
    }
  }
  