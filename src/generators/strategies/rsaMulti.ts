import { defaultEntropy } from '@/config';
import { MultiPrimeOptions, PrimeSet } from '@/generators/types';
import { generateStrongPrime } from '@/generators';
import { isWeakForMultiRSA } from '@/utils';
import { createPrimeSet, getFilterCutoff, getMinRSAGap } from '@/helpers';

/**
 * Multi-prime RSA: Generate n primes for multi-prime RSA (faster decryption)
 */
export function generateRSAMultiPrimes(
  options: MultiPrimeOptions,
  attempts: number,
): PrimeSet {
  const startTime = Date.now();

  const { count, bitLength, constraints = {}, entropy = defaultEntropy } = options;
  const { minGap = getMinRSAGap(bitLength), avoidWeak = true } = constraints;

  const primes: bigint[] = [];
  const cutoff = getFilterCutoff(bitLength);

  while (primes.length < count) {
    attempts++;
    const candidate = generateStrongPrime(bitLength, cutoff, entropy);

    if (avoidWeak && isWeakForMultiRSA(candidate, primes)) continue;

    const validGaps = primes.every((p) => {
      const gap = candidate > p ? candidate - p : p - candidate;
      return gap >= minGap;
    });

    if (validGaps) {
      primes.push(candidate);
    }
  }

  return createPrimeSet(primes, options.strategy, attempts, startTime);
}
