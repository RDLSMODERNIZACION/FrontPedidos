import AnimatedLogo from "@/components/AnimatedLogo";

export default function Page() {
  return (
    <div className="grid gap-4">
      <section className="card">
        <AnimatedLogo src="/rincon-logo.png" width={1100} height={380} gap={5} dot={2.5} />
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold mb-2">Bienvenido</h2>
        <p className="text-[#cfd6e6]">
          Esta es una demo <b>Node/Next.js + TypeScript</b>. Podés navegar a la lista de pedidos
          para ver filtros, tabla y detalle.
        </p>
      </section>
    </div>
  );
}
