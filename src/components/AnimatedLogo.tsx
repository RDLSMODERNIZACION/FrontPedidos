'use client';

import { useEffect, useRef } from "react";

type Mode = "alpha" | "luma";

type Props = {
  src: string;           // ej: "/rincon-logo.png" (en /public)
  width?: number;        // px canvas interno (no CSS)
  height?: number;       // px
  gap?: number;          // densidad (menor = más puntos)
  dot?: number;          // radio del punto
  mode?: Mode;           // "alpha" (por defecto) o "luma"
  alphaThreshold?: number; // 0-255 (para mode="alpha")
  lumaMax?: number;        // 0-255 (para mode="luma"): pinta píxeles más oscuros que este valor
  debug?: boolean;       // muestra contador de partículas
};

export default function AnimatedLogo({
  src,
  width = 1100,
  height = 380,
  gap = 5,
  dot = 2.5,
  mode = "alpha",
  alphaThreshold = 80,
  lumaMax = 250,
  debug = false,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = width;
    canvas.height = height;

    const SPRING = 0.08;
    const FRICTION = 0.85;
    const REPEL_R = 90;
    const REPEL_F = 9;
    const SCATTER_V = 8;

    let W = canvas.width, H = canvas.height;
    let particles: Array<any> = [];
    const mouse = { x: -9999, y: -9999, inside: false };

    const rgb = (r:number,g:number,b:number,a=255) => `rgba(${r},${g},${b},${a/255})`;
    const fitContain = (iw:number, ih:number, mw:number, mh:number) => {
      const r = Math.min(mw/iw, mh/ih); const w = Math.floor(iw*r), h = Math.floor(ih*r);
      return { x: Math.floor((mw-w)/2), y: Math.floor((mh-h)/2), w, h };
    };

    const buildParticlesFromImage = (img: HTMLImageElement) => {
      const off = document.createElement("canvas");
      off.width = W; off.height = H;
      const octx = off.getContext("2d")!;
      const fit = fitContain(img.width, img.height, W, H);
      octx.clearRect(0,0,W,H);
      octx.drawImage(img, fit.x, fit.y, fit.w, fit.h);
      const data = octx.getImageData(0,0,W,H).data;
      const pts: any[] = [];

      for (let y=0; y<H; y+=gap) {
        for (let x=0; x<W; x+=gap) {
          const idx = (y*W + x)*4;
          const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];

          let keep = false;
          if (mode === "alpha") {
            keep = a > alphaThreshold;
          } else {
            // luminancia (evita fondos blancos)
            const luma = 0.2126*r + 0.7152*g + 0.0722*b;
            keep = a > 10 && luma < lumaMax;
          }

          if (keep) {
            pts.push({
              x: Math.random()*W, y: Math.random()*H, vx:0, vy:0,
              tx: x + (Math.random()-0.5)*0.8, ty: y + (Math.random()-0.5)*0.8,
              col: rgb(r,g,b,255),
            });
          }
        }
      }
      return pts;
    };

    const update = () => {
      ctx.clearRect(0,0,W,H);
      for (const p of particles) {
        // spring
        let dx = p.tx - p.x, dy = p.ty - p.y;
        p.vx += dx * SPRING; p.vy += dy * SPRING;

        // repel
        if (mouse.inside) {
          let mx = p.x - mouse.x, my = p.y - mouse.y;
          let d = Math.hypot(mx,my);
          if (d < REPEL_R && d > 0.001) {
            const f = (REPEL_R - d) / REPEL_R * REPEL_F;
            p.vx += (mx/d) * f; p.vy += (my/d) * f;
          }
        }

        p.vx *= FRICTION; p.vy *= FRICTION;
        p.x += p.vx; p.y += p.vy;

        ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.arc(p.x, p.y, dot, 0, Math.PI*2); ctx.fill();
      }
      requestAnimationFrame(update);
    };

    const scatter = () => {
      for (const p of particles) {
        const ang = Math.random()*Math.PI*2;
        const sp = SCATTER_V * (0.5 + Math.random());
        p.vx = Math.cos(ang)*sp; p.vy = Math.sin(ang)*sp;
      }
    };

    const onEnter = () => { mouse.inside = true; scatter(); };
    const onLeave = () => { mouse.inside = false; mouse.x = mouse.y = -9999; };
    const onMove  = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const sx = canvas.width / r.width, sy = canvas.height / r.height;
      mouse.x = (e.clientX - r.left) * sx; mouse.y = (e.clientY - r.top) * sy;
    };

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      particles = buildParticlesFromImage(img);
      if (overlayRef.current) {
        overlayRef.current.textContent = debug ? `· puntos: ${particles.length}` : "";
      }
      if (particles.length === 0 && overlayRef.current) {
        overlayRef.current.textContent = "⚠ No se detectaron píxeles. Probá mode='luma' o verificá el path del logo.";
      }
      update();
    };
    img.onerror = () => {
      if (overlayRef.current) overlayRef.current.textContent = "⚠ No se pudo cargar el logo (revisá /public y el nombre).";
    };
    img.src = src;

    canvas.addEventListener("mouseenter", onEnter);
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("mousemove", onMove);

    return () => {
      cancelled = true;
      canvas.removeEventListener("mouseenter", onEnter);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("mousemove", onMove);
    };
  }, [src, width, height, gap, dot, mode, alphaThreshold, lumaMax, debug]);

  return (
    <div className="relative">
      <canvas
        ref={ref}
        className="rounded-2xl border border-[#1b2132] shadow-card bg-[#0f1420] w-full h-auto"
        style={{ aspectRatio: `${width}/${height}` }}
      />
      <div ref={overlayRef} className="absolute left-3 top-3 text-xs text-[#9aa3b2]" />
    </div>
  );
}
