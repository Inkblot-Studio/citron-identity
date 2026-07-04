export const cardEase = [0.22, 0.9, 0.3, 1] as const;

export const MASCOT_SIZE = 190;
export const MASCOT_H = (MASCOT_SIZE * 108) / 130;
export const HALF_X = MASCOT_SIZE / 2;
export const HALF_Y = MASCOT_H / 2;
/** Circumradius of the mark (incl. spin + shadow). */
export const SAFE = 128;

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export interface BoundsRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export const pointInRect = (x: number, y: number, r: BoundsRect) =>
  x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;

export const clampToScreen = (x: number, y: number, w: number, h: number) => ({
  x: clamp(x, SAFE, w - SAFE),
  y: clamp(y, SAFE, h - SAFE),
});

export const pushOutsideKeepOut = (
  x: number,
  y: number,
  keepOut: BoundsRect,
  w: number,
  h: number
) => {
  if (!pointInRect(x, y, keepOut)) return clampToScreen(x, y, w, h);

  const candidates = [
    { x: keepOut.left, y: clamp(y, keepOut.top, keepOut.bottom) },
    { x: keepOut.right, y: clamp(y, keepOut.top, keepOut.bottom) },
    { x: clamp(x, keepOut.left, keepOut.right), y: keepOut.top },
    { x: clamp(x, keepOut.left, keepOut.right), y: keepOut.bottom },
  ];

  let best = candidates[0];
  let bestDist = Infinity;
  for (const c of candidates) {
    const d = (c.x - x) ** 2 + (c.y - y) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return clampToScreen(best.x, best.y, w, h);
};

export const randomValidPoint = (w: number, h: number, keepOut: BoundsRect) => {
  for (let i = 0; i < 40; i++) {
    const p = clampToScreen(
      SAFE + Math.random() * (w - SAFE * 2),
      SAFE + Math.random() * (h - SAFE * 2),
      w,
      h
    );
    if (!pointInRect(p.x, p.y, keepOut)) return p;
  }
  return clampToScreen(SAFE + 20, SAFE + 20, w, h);
};
