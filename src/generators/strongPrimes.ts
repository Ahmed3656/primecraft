import os from 'os';
import { generatePrimeWorker } from './worker';
import { GenerationOptions } from '@/types';
import { defaultEntropy } from '@/entropy';
import { getFilterCutoff } from '@/helpers';
import { calculateMaxAttempts } from '@/utils';

/**
 * Generates multiple strong primes with specified constraints.
 */
export async function generateStrongPrimes(options: GenerationOptions): Promise<bigint[]> {
  const { bitLength, count = 1, minSpacing = 1000n, entropy = defaultEntropy } = options;
  const cutoff = getFilterCutoff(bitLength);
  const maxAttempts = calculateMaxAttempts(bitLength);
  const workers = Math.min(count * 2, os.cpus().length || 4);

  const primes: bigint[] = [];

  while (primes.length < count) {
    const promises = Array(workers)
      .fill(null)
      .map(() =>
        generatePrimeWorker(bitLength, cutoff, entropy, Math.floor(maxAttempts / workers))
      );

    const candidates = await Promise.allSettled(promises);

    for (const result of candidates) {
      if (result.status === 'fulfilled' && primes.length < count) {
        const candidate = result.value;

        const validSpacing = primes.every((existing) => {
          const gap = candidate > existing ? candidate - existing : existing - candidate;
          return gap >= minSpacing;
        });

        if (validSpacing) {
          primes.push(candidate);
        }
      }
    }
  }

  return primes.sort((a, b) => (a < b ? -1 : 1));
}
