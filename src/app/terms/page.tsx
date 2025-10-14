export const dynamic = "force-static";

export default function Terms() {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <main className="min-h-screen px-6 py-10 prose">
      <h1>Términos y Condiciones</h1>
      <p>El uso de nuestros servicios implica la aceptación de estos términos. Los servicios pueden actualizarse.</p>

      <h2>Uso permitido</h2>
      <p>El usuario se compromete a usar los servicios conforme a la ley y estas condiciones.</p>

      <h2>Responsabilidad</h2>
      <p>Sin responsabilidad por daños indirectos en la medida permitida por ley.</p>

      <p>Vigente desde: {today}.</p>
    </main>
  );
}
