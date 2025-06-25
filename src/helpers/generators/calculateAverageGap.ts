/**
 * Calculates the average gap between sorted primes in the list.
 *
 * Returns 0n if fewer than 2 primes are given.
 */
export function calculateAverageGap(primes: bigint[]): bigint {
  if (primes.length < 2) return 0n;

  const sortedPrimes = [...primes].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  let totalGap = 0n;

  for (let i = 1; i < sortedPrimes.length; i++) {
    totalGap += sortedPrimes[i] - sortedPrimes[i - 1];
  }

  return totalGap / BigInt(sortedPrimes.length - 1);
}
