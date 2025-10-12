"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStatus } from "@/hooks/useAuthStatus";

export default function HeaderSession() {
  const router = useRouter();
  const { ready, isAuthenticated, logout } = useAuthStatus();

  if (!ready) return <span className="btn-ghost invisible">Ingresar</span>;

  return isAuthenticated ? (
    <button
      onClick={async () => {
        await logout();
        router.replace("/login");
        router.refresh();
      }}
      className="btn-ghost"
      aria-label="Cerrar sesión"
    >
      Salir
    </button>
  ) : (
    <Link className="btn-ghost" href="/login">
      Ingresar
    </Link>
  );
}
