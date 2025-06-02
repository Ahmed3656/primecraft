import { gcd } from '@/utils';
import { COMMON_RSA_EXPONENT, MIN_RSA_GAP } from '@/constants';
import { primeFilter } from '@/helpers';
import { isProbablyPrime } from '@/core';

/**
 * Checks if a prime is cryptographically strong according to common standards.
 * A strong prime satisfies:
 * - n is prime
 * - (n-1)/2 is prime (safe prime)
 * - n ≢ 1 (mod e) for common RSA exponents
 */
export function isStrongPrime(
  n: bigint,
  bitLength: number,
  cutoff: number,
  exponent: bigint = COMMON_RSA_EXPONENT
): boolean {
  if (!primeFilter(n, cutoff)) return false;
  if (!isProbablyPrime(n, bitLength)) return false;

  const q = (n - 1n) / 2n;
  if (!isProbablyPrime(q, bitLength)) return false;
  if (n % exponent === 1n) return false;
  if (n % 3n === 1n) return false;

  return true;
}

/**
 * Checks if two primes are suitable for RSA key generation.
 * Ensures p and q are not too close and satisfy cryptographic requirements.
 */
export function areValidRSAPrimes(
  p: bigint,
  q: bigint,
  bitLength: number,
  cutoff: number,
  minGap: bigint = MIN_RSA_GAP
): boolean {
  if (!isStrongPrime(p, bitLength, cutoff) || !isStrongPrime(q, bitLength, cutoff)) return false;

  const gap = p > q ? p - q : q - p;
  if (gap < minGap) return false;

  const n = p * q;
  const phi = (p - 1n) * (q - 1n);

  if (gcd(COMMON_RSA_EXPONENT, phi) !== 1n) return false;

  return true;
}
