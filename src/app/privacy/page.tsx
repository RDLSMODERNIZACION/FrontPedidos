export const dynamic = "force-static";

export default function Privacy() {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <main className="min-h-screen px-6 py-10 prose">
      <h1>Política de Privacidad</h1>
      <p>Esta política describe cómo Dirac Energía trata datos personales en el marco de su plataforma (SCADA y expedientes).</p>

      <h2>Datos tratados</h2>
      <ul>
        <li>Datos de contacto (nombre, email, teléfono) y metadatos de soporte.</li>
        <li>Datos operativos mínimos para prestar el servicio.</li>
      </ul>

      <h2>Finalidades</h2>
      <p>Brindar soporte, operar y mejorar los servicios, cumplir obligaciones legales y seguridad.</p>

      <h2>Derechos</h2>
      <p>Podés ejercer derechos escribiendo a <a href="mailto:privacidad@tudominio.com">privacidad@tudominio.com</a>.</p>

      <p>Última actualización: {today}.</p>
    </main>
  );
}
