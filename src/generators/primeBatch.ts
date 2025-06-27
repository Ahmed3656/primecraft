import { defaultEntropy } from '@/entropy';
import { GenerationOptions } from '@/types';
import { generateNormalPrimeInternal } from '@/generators';
import { getFilterCutoff } from '@/helpers';
import { calculateMaxAttempts } from '@/utils';

/**
 * Generates a batch of unique probable primes with optional spacing between them.
 *
 * It uses optimized single-prime generation and rejects candidates that are too close to existing ones.
 * Throws an error if it can't generate the required number of primes within the attempt limit.
 */
export async function generateNormalPrimeBatch(options: GenerationOptions): Promise<bigint[]> {
  const { bitLength, count = 1, minSpacing = 1000n, entropy = defaultEntropy } = options;

  const primeSet = new Set<bigint>();
  const cutoff = getFilterCutoff(bitLength);
  const maxAttempts = calculateMaxAttempts(bitLength);

  let totalAttempts = 0;

  while (primeSet.size < count && totalAttempts < maxAttempts) {
    try {
      const candidate = await generateNormalPrimeInternal(bitLength, cutoff, entropy, maxAttempts);
      totalAttempts++;

      if (primeSet.has(candidate)) continue;

      const validSpacing = [...primeSet].every((existing) => {
        const gap = candidate > existing ? candidate - existing : existing - candidate;
        return gap >= minSpacing;
      });

      if (validSpacing) {
        primeSet.add(candidate);
      }
    } catch (error) {
      console.log('Prime batch error: ' + error);
      totalAttempts += 50;
    }
  }

  if (primeSet.size < count) {
    throw new Error(
      `Only generated ${primeSet.size}/${count} primes after ${totalAttempts} attempts`
    );
  }

  return [...primeSet].sort((a, b) => (a < b ? -1 : 1));
}
