import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface GridCanvasProps {
  className?: string;
  /** Distance in px around the cursor where the grid dissolves. */
  radius?: number;
  /** Grid spacing in px. */
  spacing?: number;
}

interface Dot {
  bx: number;
  by: number;
  ox: number;
  oy: number;
  seed: number;
}

/**
 * An engineered notebook dot-grid rendered on a single canvas. It stays
 * perfectly still until the cursor approaches — then nearby dots scatter into
 * tiny particles ("disintegrate") and immediately spring back into formation
 * once the cursor moves on. Everything is transform-only math on a 2D canvas,
 * so it stays buttery even on large viewports. Renders one static frame when
 * the user prefers reduced motion.
 */
export const GridCanvas: React.FC<GridCanvasProps> = ({
  className,
  radius = 128,
  spacing = 34,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dots: Dot[] = [];
    let raf = 0;
    let running = true;

    // Cursor position + a smoothed follower so the dissolve field glides
    // instead of snapping between frames.
    const pointer = { x: -9999, y: -9999 };
    const follow = { x: -9999, y: -9999 };

    const R = radius;
    const R2 = R * R;
    const MAX_PUSH = 16;
    const BASE = 0.15; // base dot alpha (very light gray, almost invisible)
    const DOT = 1.3; // base dot radius

    const seed = () => {
      dots = [];
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({
            bx: c * spacing,
            by: r * spacing,
            ox: 0,
            oy: 0,
            seed: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = `rgba(17, 24, 39, ${BASE})`;
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.bx, d.by, DOT, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const frame = () => {
      ctx.clearRect(0, 0, width, height);

      // Ease the follower toward the real cursor.
      follow.x += (pointer.x - follow.x) * 0.2;
      follow.y += (pointer.y - follow.y) * 0.2;

      const px = follow.x;
      const py = follow.y;

      // Fast path for the calm grid: one fillStyle for every settled dot.
      ctx.fillStyle = `rgba(17, 24, 39, ${BASE})`;

      const active: Dot[] = [];

      for (const d of dots) {
        const dx = d.bx - px;
        const dy = d.by - py;
        const inField = dx * dx + dy * dy < R2;

        if (inField || d.ox !== 0 || d.oy !== 0) {
          if (inField) {
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
            const force = (R - dist) / R; // 0..1
            const push = force * force * MAX_PUSH;
            // Target: shove away from the cursor with a touch of swirl so it
            // reads as scattering particles rather than a clean ripple.
            const swirl = Math.sin(d.seed + dist * 0.05) * force * 4;
            const tx = (dx / dist) * push - (dy / dist) * swirl;
            const ty = (dy / dist) * push + (dx / dist) * swirl;
            d.ox += (tx - d.ox) * 0.25;
            d.oy += (ty - d.oy) * 0.25;
          } else {
            // Reconstruct: spring back into the lattice, then snap to rest.
            d.ox *= 0.82;
            d.oy *= 0.82;
            if (Math.abs(d.ox) < 0.05 && Math.abs(d.oy) < 0.05) {
              d.ox = 0;
              d.oy = 0;
            }
          }
          active.push(d);
          continue;
        }

        // Settled dot — draw immediately in the shared style.
        ctx.beginPath();
        ctx.arc(d.bx, d.by, DOT, 0, Math.PI * 2);
        ctx.fill();
      }

      // Disturbed dots read as brighter, slightly larger citron-tinted motes.
      for (const d of active) {
        const disp = Math.min(1, Math.hypot(d.ox, d.oy) / MAX_PUSH);
        const a = Math.min(0.85, BASE + disp * 0.5);
        const size = DOT + disp * 1.6;
        // Blend toward citron as it scatters.
        const rC = Math.round(17 + disp * 200);
        const gC = Math.round(24 + disp * 170);
        const bC = Math.round(39 + disp * 20);
        ctx.fillStyle = `rgba(${rC}, ${gC}, ${bC}, ${a})`;
        ctx.beginPath();
        ctx.arc(d.bx + d.ox, d.by + d.oy, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      if (!running) return;
      frame();
      raf = requestAnimationFrame(loop);
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      // Seed the follower on first move so it doesn't dart in from off-screen.
      if (follow.x < -9000) {
        follow.x = e.clientX;
        follow.y = e.clientY;
      }
    };
    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const onVisibility = () => {
      running = !document.hidden;
      if (running) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    if (reducedMotion) {
      drawStatic();
    } else {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerleave', onPointerLeave);
      document.addEventListener('visibilitychange', onVisibility);
      raf = requestAnimationFrame(loop);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reducedMotion, radius, spacing]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};
