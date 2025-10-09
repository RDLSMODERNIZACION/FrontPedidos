'use client';
import { useEffect } from "react";

export default function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  return (
    <aside className={open ? "drawer" : "drawer hidden"} aria-hidden={!open}>
      <div className="drawer-body">
        <header className="drawer-header">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </header>
        <div className="drawer-content">{children}</div>
      </div>
      <div className="backdrop" onClick={onClose} />
    </aside>
  );
}
