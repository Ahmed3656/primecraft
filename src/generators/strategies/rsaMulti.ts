import os from 'os';
import { defaultEntropy } from '@/entropy';
import { MultiPrimeOptions, PrimeSet } from '@/types';
import { calculateMaxAttempts, isWeakForMultiRSA } from '@/utils';
import { createPrimeSet, getFilterCutoff, getMinRSAGap } from '@/helpers';
import { generatePrimeWorker } from '@/generators';

/**
 * Multi-prime RSA: Generate n primes for multi-prime RSA (faster decryption).
 */
export async function generateRSAMultiPrimes(
  options: MultiPrimeOptions,
  attempts: number
): Promise<PrimeSet> {
  const startTime = Date.now();
  const { count, bitLength, constraints = {}, entropy = defaultEntropy } = options;
  const { minGap = getMinRSAGap(bitLength, count), avoidWeak = true } = constraints;

  const primes: bigint[] = [];
  const targetBitLength = Math.floor(bitLength / count);
  const cutoff = getFilterCutoff(targetBitLength);
  const maxAttempts = calculateMaxAttempts(targetBitLength);
  const workers = os.cpus.length || 4;

  while (primes.length < count) {
    attempts++;

    const promises = Array(workers)
      .fill(null)
      .map(() =>
        generatePrimeWorker(
          targetBitLength,
          cutoff,
          entropy,
          Math.floor(maxAttempts / workers),
          true
        )
      );

    const results = await Promise.allSettled(promises);
    const candidates = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<bigint>).value);

    for (const candidate of candidates) {
      if (primes.length >= count) break;

      if (avoidWeak && isWeakForMultiRSA(candidate, primes)) continue;

      const validGaps = primes.every((p) => {
        const gap = candidate > p ? candidate - p : p - candidate;
        return gap >= minGap;
      });

      if (validGaps) {
        primes.push(candidate);
      }
    }
  }

  return createPrimeSet(primes, options.strategy, attempts, startTime);
}
