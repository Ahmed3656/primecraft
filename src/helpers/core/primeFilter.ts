import { SMALL_PRIMES } from '@/constants';

/**
 * Filters out numbers divisible by small known primes.
 * Useful for quickly eliminating obvious composites before full primality tests.
 */
export function primeFilter(prime: bigint, cutoff: number): boolean {
  for (let i = 0; i < cutoff; i++) {
    if (prime === SMALL_PRIMES[i]) continue;
    if (prime % SMALL_PRIMES[i] === 0n) return false;
  }
  return true;
}

/**
 * Returns the largest index i such that SMALL_PRIMES[i] ≤ 2^(bitLength/2), ensuring we only test primes
 * up to the theoretical √n bound.
 */
export function getFilterCutoff(bitLength: number): number {
  const maxPrimeValue = 2 ** (bitLength / 2);
  let low = 0, high = SMALL_PRIMES.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (SMALL_PRIMES[mid] <= maxPrimeValue) low = mid + 1;
    else high = mid;
  }
  return low;
}
