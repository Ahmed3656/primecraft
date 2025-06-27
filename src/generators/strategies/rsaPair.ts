import os from 'os';
import { generatePrimeWorker } from '../worker';
import { areValidRSAPrimes } from '@/core';
import { EntropySource, defaultEntropy } from '@/entropy';
import { getFilterCutoff } from '@/helpers';
import { calculateMaxAttempts } from '@/utils';

/**
 * Generates a pair of primes suitable for RSA key generation.
 */
export async function generateRSAPrimePair(
  bitLength: number,
  entropy: EntropySource = defaultEntropy
): Promise<{ p: bigint; q: bigint }> {
  const maxAttempts = calculateMaxAttempts(bitLength);
  const cutoff = getFilterCutoff(bitLength);
  const workers = os.cpus.length || 4;

  for (let round = 0; round < Math.ceil(maxAttempts / workers); round++) {
    const promises = Array(workers)
      .fill(null)
      .map(() => generatePrimeWorker(bitLength, cutoff, entropy, workers, true));

    const candidates = await Promise.allSettled(promises);
    const validPrimes = candidates
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<bigint>).value);

    for (let i = 0; i < validPrimes.length; i++) {
      for (let j = i + 1; j < validPrimes.length; j++) {
        const [p, q] = [validPrimes[i], validPrimes[j]];
        if (areValidRSAPrimes(p, q, bitLength)) {
          return { p, q };
        }
      }
    }
  }

  throw new Error('Failed to generate valid RSA prime pair');
}
