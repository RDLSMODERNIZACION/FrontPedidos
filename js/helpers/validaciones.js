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


// 🧩 ALQUILER
function validarModuloAlquiler(datos) {
  if (!datos?.rubro) {
    mostrarModalError('Debe seleccionarse el rubro de alquiler.');
    return false;
  }

  const esVacio = Object.values(datos).every(v => !v || v === false || v?.trim?.() === '');

  if (esVacio) {
    mostrarModalError('Debe completarse al menos un campo del módulo de alquiler.');
    return false;
  }

  switch (datos.rubro) {
    case 'edificio':
      if (!datos.ubicacionEdificioAlquiler?.trim()) {
        mostrarModalError('Falta la ubicación del edificio.');
        return false;
      }
      if (!datos.usoEdificioAlquiler?.trim()) {
        mostrarModalError('Falta el uso del edificio.');
        return false;
      }
      break;
    case 'maquinaria':
      if (!datos.tipoMaquinariaAlquiler?.trim()) {
        mostrarModalError('Falta el tipo de maquinaria.');
        return false;
      }
      if (!datos.usoMaquinariaAlquiler?.trim()) {
        mostrarModalError('Falta el uso de la maquinaria.');
        return false;
      }
      break;
    case 'otros':
      if (!datos.detalleOtrosAlquiler?.trim()) {
        mostrarModalError('Debe describirse el alquiler solicitado.');
        return false;
      }
      break;
  }

  return true;
}

// 🧩 ADQUISICIÓN
function validarModuloAdquisicion(datos) {
  const campos = [
    datos?.detalleServicio,
    datos?.tipoCarga,
    datos?.contenidoCarga
  ];

  if (campos.every(campo => !campo?.trim())) {
    mostrarModalError('Debe completarse al menos un campo en adquisición.');
    return false;
  }

  if (!datos?.detalleServicio?.trim()) {
    mostrarModalError('Debe completarse el detalle del servicio o bien.');
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
