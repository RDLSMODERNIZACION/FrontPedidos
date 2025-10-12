"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function pill(active: boolean) {
  return [
    "px-4 py-2 rounded-2xl border transition",
    active
      ? "bg-violet-600 text-white border-violet-500"
      : "bg-transparent text-white border-white/15 hover:bg-white/10",
  ].join(" ");
}

export default function NavLink({
  href,
  exact = false,
  children,
}: {
  href: string;
  exact?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={pill(active)}
      aria-current={active ? "page" : undefined}
      prefetch
    >
      {children}
    </Link>
  );
}
