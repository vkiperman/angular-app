export interface WeightData {
  x: Date;
  y: number;
  filledIn?: boolean;
}

/**
 * Linearly fills missing daily points between known dates.
 *
 * - Input can be unsorted and may have gaps of multiple days.
 * - For each consecutive pair of known points, it inserts daily points
 *   (exclusive of the left end, inclusive of the right end) with y interpolated linearly.
 * - No extrapolation beyond the earliest/latest known x.
 *
 * @param data Sparse array of {x: ISO string, y: number}
 * @param decimals Optional: round to this many decimals (default 1). Pass null to skip rounding.
 * @returns Dense, sorted array with daily points filled in.
 */
export function fillLinearDaily(
  data: WeightData[],
  decimals = 1,
): WeightData[] {
  if (!Array.isArray(data) || data.length === 0) return [];

  const DAY_MS = 24 * 60 * 60 * 1000;
  // const _out: Point[] = [];

  const roundMaybe = (v: number) =>
    decimals === null ? v : +v.toFixed(decimals);

  // Normalize & sort by time ascending
  const out = [...data]
    .filter((p) => Number.isFinite(+p.x))
    .sort((a, b) => +a.x - +b.x)
    .reduce((acc, cur, i, sorted) => {
      // Always push the first point (or the segment's right endpoint inside the loop)
      if (i === 0) {
        acc.push({ x: new Date(cur.x), y: roundMaybe(cur.y) });
        return acc;
      }

      const prev = sorted[i - 1];

      // Compute whole-day gap between prev and cur (by milliseconds)
      const gapDays = Math.round((+cur.x - +prev.x) / DAY_MS);

      if (gapDays < 1) {
        // Same day or out-of-order duplicate -> keep the latest point for that day
        acc[acc.length - 1] = { x: new Date(cur.x), y: roundMaybe(cur.y) };
        return acc;
      }

      // If exactly next day, just push the current point (no interpolation needed)
      if (gapDays === 1) {
        acc.push({ x: new Date(cur.x), y: roundMaybe(cur.y) });
        return acc;
      }

      // Interpolate days strictly between prev and cur
      for (let d = 1; d < gapDays; d++) {
        const ratio = d / gapDays;
        const x = new Date(+prev.x + d * DAY_MS);
        const y = roundMaybe(prev.y + (cur.y - prev.y) * ratio);
        const filledIn = true;
        acc.push({ x, y, filledIn });
      }

      // Finally push the right endpoint
      acc.push({ x: new Date(cur.x), y: roundMaybe(cur.y) });
      return acc;
    }, [] as WeightData[]);

  // Ensure strictly sorted & unique by x (in case of rounding quirks)
  // (Not strictly necessary, but defensive.)
  const seen = new Set<number>();
  return out.filter((p) => {
    if (seen.has(+p.x)) return false;
    seen.add(+p.x);
    return true;
  });
}
