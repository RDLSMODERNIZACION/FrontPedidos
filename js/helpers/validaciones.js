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
    case 'reparacion':
      return validarModuloReparacion(datos.modulo_reparacion); // ✅ FALTA ESTA LÍNEA
    case 'mantenimientodeescuelas':
      return validarModuloMantenimientoDeEscuelas(datos.modulo_mantenimientodeescuelas);

    default:
      return true; // o `false` si querés que módulos desconocidos no pasen
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

  const fechaDesdeTramite = parseFecha(datos.fechadesde);
  const fechaInicioPeriodo = parseFecha(datos.fechaperiododesde);
  const fechaFinPeriodo = parseFecha(datos.fechaperiodohasta);

  // ✅ NUEVA VALIDACIÓN agregada
  if (fechaDesdeTramite && fechaInicioPeriodo && fechaDesdeTramite > fechaInicioPeriodo) {
    mostrarModalError('La fecha de inicio del trámite no puede ser posterior al inicio del período solicitado.');
    return false;
  }

  // Validación 4: coherencia de período
  if (fechaInicioPeriodo && fechaFinPeriodo && fechaFinPeriodo < fechaInicioPeriodo) {
    mostrarModalError('La fecha final del período no puede ser anterior a la fecha de inicio del período.');
    return false;
  }

  // Validación 5: si fecha de inicio no es hoy, deben completarse presupuesto1 y 2
  const hoy = new Date();
  const mismaFecha = fechaDesdeTramite &&
    fechaDesdeTramite.getDate() === hoy.getDate() &&
    fechaDesdeTramite.getMonth() === hoy.getMonth() &&
    fechaDesdeTramite.getFullYear() === hoy.getFullYear();

  if (!mismaFecha) {
    if (!datos.presupuesto1?.trim() || !datos.presupuesto2?.trim()) {
      mostrarModalError('Cuando la fecha de inicio no es hoy, deben completarse los dos presupuestos adicionales.');
      return false;
    }
  }

  // Observación es opcional
  return true;
}




 // ALQUILER

  function validarModuloAlquiler(datos) {
  if (!datos?.rubro) {
    mostrarModalError('Debe seleccionarse el rubro de alquiler.');
    return false;
  }

  const { rubro, detalleUso, objeto, cronogramaDesde, cronogramaHasta, cronogramaHoras } = datos;

  if (!detalleUso?.trim()) {
    mostrarModalError('Debe completarse el uso del alquiler.');
    return false;
  }

  if (!objeto?.trim()) {
    mostrarModalError('Debe completarse el objeto del alquiler.');
    return false;
  }

  switch (rubro) {
    case 'edificio':
      // Sin validaciones adicionales
      break;

    case 'maquinaria':
      if (!cronogramaDesde?.trim()) {
        mostrarModalError('Debe completarse la fecha de inicio del cronograma.');
        return false;
      }

      if (!cronogramaHasta?.trim()) {
        mostrarModalError('Debe completarse la fecha de finalización del cronograma.');
        return false;
      }

      if (!cronogramaHoras?.trim() || cronogramaHoras === '0') {
        mostrarModalError('Debe completarse la cantidad de horas del cronograma.');
        return false;
      }
      break;

    case 'otros':
      // Validaciones específicas para "otros", si hay que agregar alguna
      // Si no hay ninguna nueva, al menos lo dejamos explícito
      break;

    default:
      mostrarModalError('El rubro seleccionado no es válido.');
      return false;
  }

  return true;
}


 // REPARACION

function validarModuloReparacion(datos) {
  if (!datos?.rubro) {
    mostrarModalError('Debe seleccionarse el rubro de reparación.');
    return false;
  }

  if (datos.rubro === 'maquinaria') {
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

    // NO se exige detalleReparacion en maquinaria

  } else if (datos.rubro === 'otros') {
    if (!datos.objeto?.trim()) {
      mostrarModalError('Debe especificarse qué objeto se va a reparar.');
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

  let items = [];

  try {
    items = JSON.parse(datos.contenidoCarga);
  } catch (e) {
    mostrarModalError('El contenido de la carga no es un JSON válido.');
    return false;
  }

  if (!Array.isArray(items) || items.length === 0) {
    mostrarModalError('Debe agregarse al menos un ítem en la carga.');
    return false;
  }

  const hayItemValido = items.some(item =>
    item.descripcion?.trim() &&
    item.cantidad?.toString().trim() &&
    item.unidad?.trim()
  );

  if (!hayItemValido) {
    mostrarModalError('Debe completarse al menos un ítem válido con descripción, cantidad y unidad.');
    return false;
  }

  return true;
}




// 🧩 SERVICIOS
function validarModuloServicios(datos) {
  if (!datos?.rubro) {
    mostrarModalError('Debe seleccionarse el rubro del servicio.');
    return false;
  }

  const rubro = datos.rubro;

  switch (rubro) {
    case 'mantenimiento':
      if (!datos.detalleMantenimiento?.trim()) {
        mostrarModalError('Debe completarse el detalle del mantenimiento.');
        return false;
      }
      break;

    case 'profesionales':
      if (!datos.tipo?.trim()) {
        mostrarModalError('Debe indicarse el tipo de servicio profesional.');
        return false;
      }

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
      break;

    case 'otros':
      if (!datos.detalleMantenimiento?.trim()) {
        mostrarModalError('Debe completarse la descripción del servicio.');
        return false;
      }
      break;

    default:
      mostrarModalError('El rubro seleccionado no es válido.');
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
  const { tipo, obra, anexo } = datos || {};

  if (!tipo) {
    mostrarModalError('Debe seleccionarse el tipo de obra.');
    return false;
  }

  switch (tipo) {
    case 'nueva':
      if (!anexo?.trim?.() || !anexo.toLowerCase().endsWith('.pdf')) {
        mostrarModalError('Debe cargarse un archivo PDF como anexo para la obra nueva.');
        return false;
      }
      break;

    case 'existente':
    case 'otra':
      if (!obra?.trim()) {
        mostrarModalError('Debe seleccionarse o indicarse la obra existente.');
        return false;
      }
      break;

    default:
      mostrarModalError('El tipo de obra seleccionado no es válido.');
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

// MANTENIMIENTO DE ESCUELA

function validarModuloMantenimientoDeEscuelas(datos) {
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
