import { mostrarModalError } from './modalExito.js'; // o './modal.js' si lo unificaste

export function validarDatosGenerales(datos) {
  const usuario = datos.usuario || {};

  if (!usuario.nombre?.trim()) {
    mostrarModalError('Debe completarse el nombre del solicitante.');
    return false;
  }

  if (!usuario.secretaria?.trim()) {
    mostrarModalError('Debe seleccionarse una secretaría.');
    return false;
  }

  return true;
}

export function validarModuloEspecifico(modulo, datos) {
  switch (modulo) {
    case 'general':
      return validarModuloGeneral(datos.modulo_general);
    case 'alquiler':
      return validarModuloAlquiler(datos.modulo_alquiler);
    case 'adquisicion':
      return validarModuloAdquisicion(datos.modulo_adquisicion);
    case 'servicios':
      return validarModuloServicios(datos.modulo_servicios);
    case 'mantenimiento':
      return validarModuloMantenimiento(datos.modulo_mantenimiento);
    case 'obras':
      return validarModuloObras(datos.modulo_obras);
    case 'profesionales':
      return validarModuloProfesionales(datos.modulo_profesionales);
    default:
      return true;
  }
}

// 🧩 GENERAL
function validarModuloGeneral(datos) {
  // Validación 1: fecha de inicio obligatoria
  if (!datos?.fechadesde?.trim()) {
    mostrarModalError('Debe completarse la fecha de inicio.');
    return false;
  }

  // Validación 2: presupuesto obligatorio
  if (!datos.presupuesto?.trim()) {
    mostrarModalError('Debe completarse el campo "presupuesto".');
    return false;
  }

  // Validación 3: período obligatorio
  if (!datos.fechaperiododesde?.trim() || !datos.fechaperiodohasta?.trim()) {
    mostrarModalError('Debe completarse el período: fecha desde y hasta.');
    return false;
  }

  // Validación 4: coherencia de período
  const desde = parseFecha(datos.fechaperiododesde);
  const hasta = parseFecha(datos.fechaperiodohasta);
  if (desde && hasta && hasta < desde) {
    mostrarModalError('La fecha final del período no puede ser anterior a la fecha de inicio del período.');
    return false;
  }

  // Validación 5: si fecha de inicio no es hoy, deben completarse presupuesto1 y 2
  const hoy = new Date();
  const fechaDesde = parseFecha(datos.fechadesde);
  const mismaFecha = fechaDesde &&
    fechaDesde.getDate() === hoy.getDate() &&
    fechaDesde.getMonth() === hoy.getMonth() &&
    fechaDesde.getFullYear() === hoy.getFullYear();

  if (!mismaFecha) {
    if (!datos.presupuesto1?.trim() || !datos.presupuesto2?.trim()) {
      mostrarModalError('Cuando la fecha de inicio no es hoy, deben completarse los dos presupuestos adicionales.');
      return false;
    }
  }

  // Observación es opcional
  return true;
}


  function validarModuloAlquiler(datos) {
  if (!datos?.rubro) {
    mostrarModalError('Debe seleccionarse el rubro de alquiler.');
    return false;
  }

  const rubro = datos.rubro;

  if (!datos.detalleUso?.trim()) {
    mostrarModalError('Debe completarse el uso del alquiler.');
    return false;
  }

  if (!datos.objeto?.trim()) {
    mostrarModalError('Debe completarse el objeto del alquiler.');
    return false;
  }

  switch (rubro) {
    case 'edificio':
      // Ya se validaron los dos únicos campos obligatorios arriba
      break;

    case 'maquinaria':
      if (!datos.cronogramaDesde?.trim()) {
        mostrarModalError('Debe completarse la fecha de inicio del cronograma.');
        return false;
      }

      if (!datos.cronogramaHasta?.trim()) {
        mostrarModalError('Debe completarse la fecha de finalización del cronograma.');
        return false;
      }

      if (!datos.cronogramaHoras?.trim() || datos.cronogramaHoras === '0') {
        mostrarModalError('Debe completarse la cantidad de horas del cronograma.');
        return false;
      }

      // requiereCombustible y requiereChofer pueden ser false, no hace falta validarlos
      break;

    case 'otros':
      // Ya se validaron detalleUso y objeto arriba
      break;

    default:
      mostrarModalError('El rubro seleccionado no es válido.');
      return false;
  }

  return true;
}

function validarModuloReparacion(datos) {
  if (!datos?.rubro) {
    mostrarModalError('Debe seleccionarse el rubro de reparación.');
    return false;
  }

  if (datos.rubro === 'maquinaria' || datos.rubro === 'otros') {
    // Validar objeto como JSON con al menos una unidad válida
    let unidades = [];

    try {
      unidades = JSON.parse(datos.objeto);
    } catch (e) {
      mostrarModalError('La lista de unidades a reparar no está en un formato válido.');
      return false;
    }

    const hayUnidadValida = Array.isArray(unidades) && unidades.some(u =>
      u.unidad?.trim() && u.detalle?.trim()
    );

    if (!hayUnidadValida) {
      mostrarModalError('Debe incluir al menos una unidad válida a reparar.');
      return false;
    }

    if (!datos.detalleReparacion?.trim()) {
      mostrarModalError('Debe describirse el detalle de la reparación.');
      return false;
    }
  } else {
    mostrarModalError('El rubro seleccionado no es válido para reparación.');
    return false;
  }

  return true;
}



function validarModuloAdquisicion(datos) {
  if (!datos?.detalleServicio?.trim()) {
    mostrarModalError('Debe completarse el detalle del servicio o bien.');
    return false;
  }

  if (!datos?.tipoCarga) {
    mostrarModalError('Debe seleccionarse el tipo de carga (manual o archivo).');
    return false;
  }

  // Validar contenido según tipo de carga
  if (datos.tipoCarga === 'MANUAL') {
    let contenido = [];

    try {
      contenido = JSON.parse(datos.contenidoCarga);
    } catch (e) {
      mostrarModalError('El contenido ingresado no es un JSON válido.');
      return false;
    }

    const hayItemValido = Array.isArray(contenido) && contenido.some(item =>
      item.descripcion?.trim() &&
      item.cantidad?.trim() &&
      item.unidad?.trim()
    );

    if (!hayItemValido) {
      mostrarModalError('Debe completarse al menos un ítem válido en la tabla de carga manual.');
      return false;
    }

  } else if (datos.tipoCarga === 'ARCHIVO') {
    if (datos.contenidoCarga === '[Sin archivo]') {
      mostrarModalError('Debe adjuntarse un archivo si seleccionó "archivo" como tipo de carga.');
      return false;
    }
  } else {
    mostrarModalError('El tipo de carga seleccionado no es válido.');
    return false;
  }

  return true;
}


// 🧩 SERVICIOS
function validarModuloServicios(datos) {
  if (!datos?.detalleServicio?.trim()) {
    mostrarModalError('Debe completarse la descripción del servicio solicitado.');
    return false;
  }

  const campos = Object.values(datos || {});
  if (campos.every(v => !v || v?.trim?.() === '')) {
    mostrarModalError('Debe completarse al menos un campo en servicios.');
    return false;
  }

  return true;
}

// 🧩 MANTENIMIENTO
function validarModuloMantenimiento(datos) {
  if (!datos?.escuela?.trim()) {
    mostrarModalError('Debe indicarse la escuela que requiere mantenimiento.');
    return false;
  }
  if (!datos?.detalleMantenimiento?.trim()) {
    mostrarModalError('Debe describirse el tipo de mantenimiento requerido.');
    return false;
  }
  return true;
}

// 🧩 OBRAS
function validarModuloObras(datos) {
  if (!datos?.descripcionObra?.trim()) {
    mostrarModalError('Debe completarse la descripción de la obra.');
    return false;
  }
  return true;
}

// 🧩 PROFESIONALES
function validarModuloProfesionales(datos) {
  if (!datos?.detalleProfesional?.trim()) {
    mostrarModalError('Debe completarse el detalle de la contratación profesional.');
    return false;
  }
  return true;
}

// 🧠 Utilidad: convertir fecha DD/MM/YYYY a Date
function parseFecha(fechaStr) {
  if (!fechaStr || !fechaStr.includes('/')) return null;
  const [dia, mes, anio] = fechaStr.split('/');
  return new Date(`${anio}-${mes}-${dia}T00:00:00`);
}
