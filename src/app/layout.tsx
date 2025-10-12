import type { Metadata } from "next";
import "./globals.css";
import Image from "next/image";
import { AuthProvider } from "@/contexts/AuthContext";
import HeaderNav from "@/components/HeaderNav";
import HeaderSession from "@/components/HeaderSession";

export const metadata: Metadata = {
  title: "Dirac Energía · Contrataciones",
  description: "Demo UI migrada a Next.js + TS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <header className="sticky top-0 z-50 border-b border-[#161a29] bg-black/60 backdrop-blur-md">
            <div className="container flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="Dirac" width={28} height={28} />
                <h1 className="text-base font-semibold tracking-wide">Contrataciones</h1>
              </div>
              <nav className="flex items-center gap-2">
                <HeaderNav />
                <HeaderSession />
              </nav>
            </div>
          </header>

          <main className="container my-6">{children}</main>

          <footer className="container my-12 text-center text-sm text-[#9aa3b2]">
            SECRETARIA DE TECNOLOGIA E INNOVACION
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
