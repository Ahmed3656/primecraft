/**
 * Analyzes the spacing between sorted primes to measure:
 * - Uniformity: 1 means evenly spaced, lower is more irregular.
 * - Clustering: true if many gaps are much smaller than average.
 */
export function analyzeDistribution(primes: bigint[]): { uniformity: number; clustering: boolean } {
  if (primes.length < 3) return { uniformity: 1, clustering: false };

  const sorted = [...primes].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const gaps = [];

  for (let i = 1; i < sorted.length; i++) {
    gaps.push(Number(sorted[i] - sorted[i - 1]));
  }

  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;
  const uniformity = avgGap > 0 ? 1 / (1 + Math.sqrt(variance) / avgGap) : 0;

  const smallGaps = gaps.filter((gap) => gap < avgGap * 0.1).length;
  const clustering = smallGaps > gaps.length * 0.3;

  return { uniformity, clustering };
}
