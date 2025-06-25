import { gcd } from '@/utils';

/**
 * Detects weak prime patterns:
 * - Divisibility by small common factors (excluding self).
 * - Non-coprime relationships (shared GCD > 1).
 *
 * Returns true if any weakness is found.
 */
export function checkWeakGCDPatterns(primes: bigint[]): boolean {
  const commonFactors = [3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n];

  for (const prime of primes) {
    for (const factor of commonFactors) {
      if (prime % factor === 0n && prime !== factor) return true;
    }
  }

  for (let i = 0; i < primes.length; i++) {
    for (let j = i + 1; j < primes.length; j++) {
      const g = gcd(primes[i], primes[j]);
      if (g > 1n) return true; // Primes should be coprime
    }
  }

  return false;
}
