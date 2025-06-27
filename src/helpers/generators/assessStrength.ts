import { COMMON_RSA_EXPONENT } from '@/constants';
import { isStrongPrime } from '@/core';
import { StrengthLevel } from '@/types';
import {
  analyzeDistribution,
  calculateAverageGap,
  checkArithmeticProgression,
  checkWeakGCDPatterns,
} from '@/helpers';

/**
 * Estimates the cryptographic strength level of a set of primes.
 *
 * Strength is evaluated based on a combination of criteria:
 * - Minimum bit length of primes (128 bits required at minimum).
 * - Presence of arithmetic progressions or weak GCD patterns (disqualify immediately).
 * - Proportion of strong primes according to RSA-safe criteria.
 * - Gap distribution uniformity and absence of clustering.
 * - Average gap size compared to expected spacing for the bit length.
 * - Bit-length consistency across all primes.
 */
export function assessStrength(primes: bigint[]): StrengthLevel {
  if (primes.length === 0) return 'weak';

  const bitLengths = primes.map((p) => p.toString(2).length);
  const minBits = Math.min(...bitLengths);
  const maxBits = Math.max(...bitLengths);

  // Check for obvious weaknesses
  if (minBits < 128) return 'weak';
  if (checkArithmeticProgression(primes)) return 'weak';
  if (checkWeakGCDPatterns(primes)) return 'weak';

  // Count strong primes (fixed function call)
  const strongCount = primes.filter((p) =>
    isStrongPrime(p, p.toString(2).length, COMMON_RSA_EXPONENT)
  ).length;
  const strongRatio = strongCount / primes.length;

  const { uniformity, clustering } = analyzeDistribution(primes);
  if (clustering) return 'weak';

  const avgGap = calculateAverageGap(primes);
  const expectedGap = 2n ** BigInt(Math.floor(minBits / 2));
  const gapRatio = Number(avgGap) / Number(expectedGap);

  // Strength assessment based on multiple criteria
  let score = 0;

  // Bit length scoring
  if (minBits >= 1024) score += 3;
  else if (minBits >= 512) score += 2;
  else if (minBits >= 256) score += 1;

  // Strong prime ratio scoring
  if (strongRatio >= 0.9) score += 3;
  else if (strongRatio >= 0.7) score += 2;
  else if (strongRatio >= 0.5) score += 1;

  // Distribution scoring
  if (uniformity >= 0.8) score += 2;
  else if (uniformity >= 0.6) score += 1;

  // Gap scoring
  if (gapRatio >= 1.0) score += 2;
  else if (gapRatio >= 0.5) score += 1;

  // Size consistency scoring
  const bitSpread = maxBits - minBits;
  if (bitSpread <= minBits * 0.1) score += 1;

  if (score >= 8) return 'exceptional';
  if (score >= 6) return 'strong';
  if (score >= 3) return 'good';
  return 'weak';
}
