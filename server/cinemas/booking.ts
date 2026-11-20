export function calculateBookingQuote(bundleSizes: number[], groupSize: number) {
  const minBundles = new Array<number>(groupSize + 1).fill(Infinity);
  const lastBundle = new Array<number>(groupSize + 1).fill(0);
  minBundles[0] = 0;

  // The best way to fill a total ends with one bundle plus the best smaller total.
  for (let seats = 1; seats <= groupSize; seats++) {
    for (const size of bundleSizes) {
      if (size > seats) continue;
      const count = minBundles[seats - size] + 1;
      if (count < minBundles[seats]) {
        minBundles[seats] = count;
        lastBundle[seats] = size;
      }
    }
  }

  if (!Number.isFinite(minBundles[groupSize])) return { possible: false } as const;

  const quantities = new Map<number, number>();
  for (let seats = groupSize; seats > 0; seats -= lastBundle[seats]) {
    const size = lastBundle[seats];
    quantities.set(size, (quantities.get(size) ?? 0) + 1);
  }

  const bundles = [...quantities]
    .sort(([a], [b]) => b - a)
    .map(([size, quantity]) => ({ size, quantity }));
  return { possible: true, bundleCount: minBundles[groupSize], bundles } as const;
}
