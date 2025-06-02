import { defaultEntropy } from '@/config';
import { MultiPrimeOptions, PrimeSet } from '@/generators/types';
import { generateStrongPrime } from '@/generators';
import { isWeakForMultiRSA } from '@/utils';
import { createPrimeSet, getFilterCutoff } from '@/helpers';
import { MIN_RSA_GAP } from '@/constants';

/**
 * Multi-prime RSA: Generate n primes for multi-prime RSA (faster decryption)
 */
export function generateRSAMultiPrimes(
  options: MultiPrimeOptions,
  attempts: number,
  startTime: number = Date.now()
): PrimeSet {
  const { count, bitLength, constraints = {}, entropy = defaultEntropy } = options;
  const { minGap = MIN_RSA_GAP, avoidWeak = true } = constraints;

  const primes: bigint[] = [];
  const targetBitLength = Math.floor(bitLength / count);
  const cutoff = getFilterCutoff(bitLength);

  while (primes.length < count) {
    attempts++;
    const candidate = generateStrongPrime(targetBitLength, cutoff, entropy);

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
