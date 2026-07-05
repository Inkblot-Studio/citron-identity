import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface GridCanvasProps {
  className?: string;
  /** Grid spacing in px. */
  spacing?: number;
}

/**
 * A calm engineered dot-grid on white paper. Static by default; on pointer
 * move nearby dots soften slightly for a restrained sense of depth.
 */
export const GridCanvas: React.FC<GridCanvasProps> = ({
  className,
  spacing = 32,
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
    let dots: { bx: number; by: number }[] = [];
    let raf = 0;
    let running = true;

    const pointer = { x: -9999, y: -9999 };
    const R = 72;
    const R2 = R * R;
    const BASE = 0.1;
    const DOT = 1.1;

    const seed = () => {
      dots = [];
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({ bx: c * spacing, by: r * spacing });
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
      ctx.fillStyle = `rgba(29, 28, 25, ${BASE})`;
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.bx, d.by, DOT, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const frame = () => {
      ctx.clearRect(0, 0, width, height);
      const px = pointer.x;
      const py = pointer.y;

      for (const d of dots) {
        const dx = d.bx - px;
        const dy = d.by - py;
        const dist2 = dx * dx + dy * dy;
        const near = dist2 < R2;
        const alpha = near
          ? BASE + (1 - Math.sqrt(dist2) / R) * 0.06
          : BASE;
        ctx.fillStyle = `rgba(29, 28, 25, ${alpha})`;
        ctx.beginPath();
        ctx.arc(d.bx, d.by, DOT, 0, Math.PI * 2);
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
    };
    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    resize();
    window.addEventListener('resize', resize);

    if (reducedMotion) {
      drawStatic();
    } else {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerleave', onPointerLeave);
      raf = requestAnimationFrame(loop);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [reducedMotion, spacing]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};
