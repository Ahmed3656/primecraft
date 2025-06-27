import { GCD_SCALING_FACTOR, MAX_ALLOWED_GCD } from '@/constants';
import { gcd } from '@/utils';

/**
 * Checks if a candidate prime weakly overlaps with existing primes in multi-prime RSA.
 * Rejects if GCD(p−1, q−1) is too large or if modulus collisions are likely.
 */
export function isWeakForMultiRSA(candidate: bigint, existingPrimes: bigint[]): boolean {
  for (const p of existingPrimes) {
    const threshold = getDynamicGCDThreshold(p);
    if (gcd(candidate - 1n, p - 1n) > threshold) return true;
    if (candidate % p === 1n || p % candidate === 1n) return true;
  }
  return false;
}

/**
 * Computes a dynamic GCD threshold based on bit length to tighten multi-prime RSA checks.
 */
function getDynamicGCDThreshold(p: bigint): bigint {
  const fixed = MAX_ALLOWED_GCD;
  const dynamic = (p - 1n) / GCD_SCALING_FACTOR;
  return dynamic && dynamic < fixed ? dynamic : fixed;
}
