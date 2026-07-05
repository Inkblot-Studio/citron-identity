/** Shared easing curve for the auth card + mascot entrances. */
export const cardEase = [0.22, 0.9, 0.3, 1] as const;

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
