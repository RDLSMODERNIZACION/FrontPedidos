export async function archivoAObjetoBase64(inputFile) {
    return new Promise((resolve) => {
      const archivo = inputFile?.files?.[0];
      if (!archivo) return resolve(null);
  
      const lector = new FileReader();
      lector.onload = () => {
        const base64 = lector.result.split(',')[1]; // quitar encabezado
        resolve({ nombre: archivo.name, base64: base64 });
      };
      lector.onerror = () => resolve(null);
      lector.readAsDataURL(archivo);
    });
  }
  