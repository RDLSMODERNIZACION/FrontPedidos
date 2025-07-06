function doPost(e) {
  const hoja = SpreadsheetApp.openById("ID_DE_TU_SHEET").getSheetByName("Respuestas");
  const datos = JSON.parse(e.postData.contents);
  const fila = [];
  fila.push(new Date());
  fila.push(datos.nombre || "");
  fila.push(datos.secretaria || "");
  fila.push(datos.fecha || "");
  hoja.appendRow(fila);
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
    .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
}

function doOptions() {
  return ContentService
    .createTextOutput('')
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
    .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
}
