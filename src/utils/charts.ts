export const pct = (num: number, den: number): number =>
  den === 0 ? 0 : Math.round((num / den) * 100);

export const clamp = (v: number, min = 0, max = 100): number =>
  Math.max(min, Math.min(max, v));
