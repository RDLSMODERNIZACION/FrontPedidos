export function validarDatosGenerales(datos) {
  const usuario = datos.usuario || {};

  if (!usuario.nombre?.trim()) {
    return 'Debe completarse el nombre del solicitante.';
  }

  if (!usuario.secretaria?.trim()) {
    return 'Debe seleccionarse una secretaría.';
  }

  return null;
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
      return null;
  }
}

// 🧩 GENERAL
function validarModuloGeneral(datos) {
  if (!datos?.fechadesde?.trim()) {
    return 'Debe completarse la fecha de inicio.';
  }

  const vacíos = [
    datos.presupuesto,
    datos.presupuesto1,
    datos.presupuesto2,
    datos.fechaperiododesde,
    datos.fechaperiodohasta,
    datos.observacion
  ];

  if (vacíos.every(campo => !campo?.trim())) {
    return 'Debe completarse al menos un campo adicional (presupuesto, período u observación).';
  }

  // Validación cruzada de fechas del período
  const desde = parseFecha(datos.fechaperiododesde);
  const hasta = parseFecha(datos.fechaperiodohasta);

  if (desde && hasta && hasta < desde) {
    return 'La fecha final del período no puede ser anterior a la fecha de inicio.';
  }

  // Validación de presupuestos si fecha desde ≠ hoy
  const hoy = new Date();
  const fechaDesde = parseFecha(datos.fechadesde);
  const mismaFecha = fechaDesde &&
    fechaDesde.getDate() === hoy.getDate() &&
    fechaDesde.getMonth() === hoy.getMonth() &&
    fechaDesde.getFullYear() === hoy.getFullYear();

  if (!mismaFecha) {
    if (!datos.presupuesto1?.trim() || !datos.presupuesto2?.trim()) {
      return 'Cuando la fecha de inicio no es hoy, deben completarse dos presupuestos.';
    }
  }

  return null;
}

// 🧩 ALQUILER
function validarModuloAlquiler(datos) {
  if (!datos?.rubro) return 'Debe seleccionarse el rubro de alquiler.';

  const esVacio = Object.values(datos).every(v => !v || v === false || v?.trim?.() === '');

  if (esVacio) {
    return 'Debe completarse al menos un campo del módulo de alquiler.';
  }

  switch (datos.rubro) {
    case 'edificio':
      if (!datos.ubicacionEdificioAlquiler?.trim()) return 'Falta la ubicación del edificio.';
      if (!datos.usoEdificioAlquiler?.trim()) return 'Falta el uso del edificio.';
      break;
    case 'maquinaria':
      if (!datos.tipoMaquinariaAlquiler?.trim()) return 'Falta el tipo de maquinaria.';
      if (!datos.usoMaquinariaAlquiler?.trim()) return 'Falta el uso de la maquinaria.';
      break;
    case 'otros':
      if (!datos.detalleOtrosAlquiler?.trim()) return 'Debe describirse el alquiler solicitado.';
      break;
  }

  return null;
}

// 🧩 ADQUISICIÓN
function validarModuloAdquisicion(datos) {
  const campos = [
    datos?.detalleServicio,
    datos?.tipoCarga,
    datos?.contenidoCarga
  ];

  if (campos.every(campo => !campo?.trim())) {
    return 'Debe completarse al menos un campo en adquisición.';
  }

  if (!datos?.detalleServicio?.trim()) {
    return 'Debe completarse el detalle del servicio o bien.';
  }

  return null;
}

// 🧩 SERVICIOS
function validarModuloServicios(datos) {
  if (!datos?.detalleServicio?.trim()) {
    return 'Debe completarse la descripción del servicio solicitado.';
  }

  const campos = Object.values(datos || {});
  if (campos.every(v => !v || v?.trim?.() === '')) {
    return 'Debe completarse al menos un campo en servicios.';
  }

  return null;
}

// 🧩 MANTENIMIENTO
function validarModuloMantenimiento(datos) {
  if (!datos?.escuela?.trim()) {
    return 'Debe indicarse la escuela que requiere mantenimiento.';
  }
  if (!datos?.detalleMantenimiento?.trim()) {
    return 'Debe describirse el tipo de mantenimiento requerido.';
  }
  return null;
}

// 🧩 OBRAS
function validarModuloObras(datos) {
  if (!datos?.descripcionObra?.trim()) {
    return 'Debe completarse la descripción de la obra.';
  }
  return null;
}

// 🧩 PROFESIONALES
function validarModuloProfesionales(datos) {
  if (!datos?.detalleProfesional?.trim()) {
    return 'Debe completarse el detalle de la contratación profesional.';
  }
  return null;
}

// 🧠 Utilidad: convertir fecha DD/MM/YYYY a Date
function parseFecha(fechaStr) {
  if (!fechaStr || !fechaStr.includes('/')) return null;
  const [dia, mes, anio] = fechaStr.split('/');
  return new Date(`${anio}-${mes}-${dia}T00:00:00`);
}
