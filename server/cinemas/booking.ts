export function calculateBookingQuote(bundleSizes: number[], groupSize: number) {
  const best = Array.from({ length: groupSize + 1 }, () => ({ count: Infinity, lastSize: 0 }));
  best[0].count = 0;

  // The best way to fill a total ends with one bundle plus the best smaller total.
  for (let seats = 1; seats <= groupSize; seats++) {
    for (const size of bundleSizes) {
      if (size > seats) continue;
      const count = best[seats - size].count + 1;
      if (count < best[seats].count) best[seats] = { count, lastSize: size };
    }
  }

  const bundleCount = best[groupSize].count;
  if (!Number.isFinite(bundleCount)) return { possible: false } as const;

  const quantities = new Map<number, number>();
  for (let seats = groupSize; seats > 0;) {
    const size = best[seats].lastSize;
    quantities.set(size, (quantities.get(size) ?? 0) + 1);
    seats -= size;
  }

  const bundles = [...quantities]
    .sort(([a], [b]) => b - a)
    .map(([size, quantity]) => ({ size, quantity }));
  return { possible: true, bundleCount, bundles } as const;
}
