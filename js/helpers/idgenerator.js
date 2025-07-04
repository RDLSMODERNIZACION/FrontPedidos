export function generarIDTramite(datos = {}) {
  console.log("📥 Función generarIDTramite recibió:", datos);

  // 🔹 Obtener secretaría desde los datos o desde localStorage
  let secretaria = datos?.usuario?.secretaria || null;

  if (!secretaria) {
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      secretaria = usuario?.secretaria || 'SIN-SECRETARIA';
    } catch (e) {
      console.warn('⚠️ No se pudo leer secretaría desde localStorage:', e);
      secretaria = 'SIN-SECRETARIA';
    }
  }

  console.log("🏛 Secretaría original:", secretaria);

  // 🔤 Sigla de la secretaría (ej: Juzgado de Faltas → JDF)
  const siglaSecretaria = secretaria
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase();

  console.log("🔠 Sigla de secretaría:", siglaSecretaria);

  // 🕒 Fecha y hora actual
  const ahora = new Date();
  const yyyy = ahora.getFullYear();
  const mm = String(ahora.getMonth() + 1).padStart(2, '0');
  const dd = String(ahora.getDate()).padStart(2, '0');
  const hh = String(ahora.getHours()).padStart(2, '0');
  const min = String(ahora.getMinutes()).padStart(2, '0');
  const ss = String(ahora.getSeconds()).padStart(2, '0');

  const id = `${siglaSecretaria}-${yyyy}${mm}${dd}-${hh}${min}${ss}`;
  console.log("🆔 ID generado sin módulo:", id);
  return id;
}
