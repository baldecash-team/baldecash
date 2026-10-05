'use client';

/**
 * Fondo de partículas + confeti de la encuesta (port del `<script>` del HTML).
 *
 * Dos canvas fijos: `bg` (partículas ambientales que huyen del cursor) y
 * `top` (pops al elegir una opción, lluvia de confeti al completar/enviar).
 * Con `prefers-reduced-motion` no se anima nada: las partículas quedan
 * estáticas y `pop`/`spawn`/`celebrate` son no-op.
 *
 * Todo vive dentro de un `useEffect` con cleanup (listeners + rAF) para que
 * un unmount no deje frames corriendo.
 */

import { useEffect, useRef, useState, type RefObject } from 'react';

const COLORS = ['#4850C8', '#12C8C0', '#2563EB'];

type Ambient = { x: number; y: number; r: number; vx: number; vy: number; c: string; a: number };
type Fx = {
  x: number; y: number; vx: number; vy: number; g: number; r: number; c: string;
  life: number; dl: number; rot: number; vr: number; rect: boolean;
};

export interface EncuestaFx {
  /** Pequeña explosión en un punto (al elegir una opción). */
  pop: (x: number, y: number) => void;
  /** Festejo al completar los obligatorios: brota desde abajo del footer. */
  spawnComplete: () => void;
  /** Lluvia de confeti (pantalla de gracias). */
  celebrate: () => void;
}

function hexA(h: string, a: number): string {
  const n = parseInt(h.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function pick(): string {
  return COLORS[(Math.random() * COLORS.length) | 0];
}

export function useEncuestaFx(
  bgRef: RefObject<HTMLCanvasElement | null>,
  topRef: RefObject<HTMLCanvasElement | null>,
): EncuestaFx {
  const api = useRef<EncuestaFx>({ pop: () => {}, spawnComplete: () => {}, celebrate: () => {} });

  useEffect(() => {
    const bg = bgRef.current;
    const tcv = topRef.current;
    if (!bg || !tcv) return;
    const bxMaybe = bg.getContext('2d');
    const txMaybe = tcv.getContext('2d');
    // jsdom (tests) no implementa canvas: sin contexto, sin efectos.
    if (!bxMaybe || !txMaybe) return;
    // Alias no-nulos: el narrowing del `if` no llega a los closures de abajo.
    const bx: CanvasRenderingContext2D = bxMaybe;
    const tx: CanvasRenderingContext2D = txMaybe;
    const capas: ReadonlyArray<readonly [HTMLCanvasElement, CanvasRenderingContext2D]> = [
      [bg, bx],
      [tcv, tx],
    ];

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let DPR = Math.min(window.devicePixelRatio || 1, 2);

    function size() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      for (const [cv, ctx] of capas) {
        cv.width = W * DPR;
        cv.height = H * DPR;
        cv.style.width = `${W}px`;
        cv.style.height = `${H}px`;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      }
    }
    size();
    window.addEventListener('resize', size);

    /* Partículas ambientales (reaccionan al cursor) */
    const count = reduce ? 14 : W < 768 ? 20 : 38;
    const ps: Ambient[] = [];
    for (let i = 0; i < count; i++) {
      ps.push({
        x: Math.random() * W, y: Math.random() * H, r: 6 + Math.random() * 22,
        vx: (Math.random() - 0.5) * 0.18, vy: -0.12 - Math.random() * 0.3,
        c: pick(), a: 0.08 + Math.random() * 0.12,
      });
    }
    let mx = -9999;
    let my = -9999;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const onLeave = () => { mx = -9999; my = -9999; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    let ambientRaf: number | null = null;
    function ambient() {
      bx.clearRect(0, 0, W, H);
      for (const p of ps) {
        p.x += p.vx;
        p.y += p.vy;
        const dx = p.x - mx;
        const dy = p.y - my;
        const R = 110;
        const d2 = dx * dx + dy * dy;
        if (d2 < R * R) {
          const d = Math.sqrt(d2) || 1;
          const f = ((R - d) / R) * 1.6;
          p.x += (dx / d) * f;
          p.y += (dy / d) * f;
        }
        if (p.y < -p.r) { p.y = H + p.r; p.x = Math.random() * W; }
        if (p.x < -p.r) p.x = W + p.r;
        if (p.x > W + p.r) p.x = -p.r;
        const g = bx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, hexA(p.c, p.a));
        g.addColorStop(1, hexA(p.c, 0));
        bx.fillStyle = g;
        bx.beginPath();
        bx.arc(p.x, p.y, p.r, 0, 6.2832);
        bx.fill();
      }
      if (!reduce) ambientRaf = requestAnimationFrame(ambient);
    }
    ambient();

    /* Capa superior: confeti / pops */
    const fx: Fx[] = [];
    let raf: number | null = null;
    function step() {
      tx.clearRect(0, 0, W, H);
      for (let i = fx.length - 1; i >= 0; i--) {
        const q = fx[i];
        q.vy += q.g; q.x += q.vx; q.y += q.vy; q.life -= q.dl; q.rot += q.vr;
        if (q.life <= 0 || q.y > H + 40) { fx.splice(i, 1); continue; }
        tx.save();
        tx.globalAlpha = Math.max(0, Math.min(1, q.life));
        tx.translate(q.x, q.y);
        tx.rotate(q.rot);
        tx.fillStyle = q.c;
        if (q.rect) tx.fillRect(-q.r / 2, -q.r / 2, q.r, q.r * 0.6);
        else { tx.beginPath(); tx.arc(0, 0, q.r / 2, 0, 6.2832); tx.fill(); }
        tx.restore();
      }
      raf = fx.length ? requestAnimationFrame(step) : null;
    }
    function run() { if (!raf) raf = requestAnimationFrame(step); }
    function spawn(x: number, y: number, n: number, up: number, spread: number, dl: number) {
      if (reduce) return;
      for (let i = 0; i < n; i++) {
        fx.push({
          x, y, vx: (Math.random() - 0.5) * spread, vy: Math.random() * -up - 1, g: 0.16,
          r: 5 + Math.random() * 5, c: pick(), life: 1, dl, rot: Math.random() * 6,
          vr: (Math.random() - 0.5) * 0.4, rect: Math.random() < 0.5,
        });
      }
      run();
    }

    api.current = {
      pop: (x, y) => spawn(x, y, 10, 4, 5, 0.02),
      spawnComplete: () => spawn(W / 2, H - 90, 44, 8, 6, 0.012),
      celebrate: () => {
        if (reduce) return;
        for (let i = 0; i < 150; i++) {
          fx.push({
            x: Math.random() * W, y: -20 - Math.random() * 60, vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * 2 + 1, g: 0.05, r: 6 + Math.random() * 6, c: pick(), life: 1,
            dl: 0.006, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, rect: true,
          });
        }
        run();
      },
    };

    return () => {
      window.removeEventListener('resize', size);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      if (ambientRaf !== null) cancelAnimationFrame(ambientRaf);
      if (raf !== null) cancelAnimationFrame(raf);
      api.current = { pop: () => {}, spawnComplete: () => {}, celebrate: () => {} };
    };
  }, [bgRef, topRef]);

  // Delegan al efecto vivo: el objeto que recibe el componente es estable
  // (useState con inicializador: se crea una sola vez y no lee refs en render).
  const [estable] = useState<EncuestaFx>(() => ({
    pop: (x, y) => api.current.pop(x, y),
    spawnComplete: () => api.current.spawnComplete(),
    celebrate: () => api.current.celebrate(),
  }));
  return estable;
}
