import { defaultEntropy } from '@/entropy';
import { generateNormalPrimeInternal } from '@/generators';
import { getFilterCutoff } from '@/helpers';
import { logger } from '@/logger';
import { GenerationOptions } from '@/types';
import { calculateMaxAttempts } from '@/utils';

/**
 * Generates a batch of unique probable primes with optional spacing between them.
 *
 * It uses optimized single-prime generation and rejects candidates that are too close to existing ones.
 * Throws an error if it can't generate the required number of primes within the attempt limit.
 */
export async function generateNormalPrimeBatch(options: GenerationOptions): Promise<bigint[]> {
  const startTime = Date.now();
  const id = `batch-${startTime}`;
  const { bitLength, count = 1, minSpacing = 1000n, entropy = defaultEntropy } = options;

  logger.startOperation(id, {
    operation: 'Prime batch',
    bitLength,
    count,
  });

  const primeSet = new Set<bigint>();
  const cutoff = getFilterCutoff(bitLength);
  const maxAttempts = calculateMaxAttempts(bitLength);
  let totalAttempts = 0;

  try {
    while (primeSet.size < count && totalAttempts < maxAttempts) {
      logger.updateProgress(id, {
        current: primeSet.size,
        total: count,
        phase: 'Generating primes',
        details: `${totalAttempts} attempts, spacing: ${minSpacing}`,
      });

      try {
        const candidate = await generateNormalPrimeInternal(
          bitLength,
          cutoff,
          entropy,
          maxAttempts
        );
        totalAttempts++;

        if (primeSet.has(candidate)) continue;

        const validSpacing = [...primeSet].every((existing) => {
          const gap = candidate > existing ? candidate - existing : existing - candidate;
          return gap >= minSpacing;
        });

        if (validSpacing) {
          primeSet.add(candidate);
          logger.verbose(`Added prime ${primeSet.size}/${count}`, {
            prime: candidate.toString(16).substring(0, 16) + '...',
            totalAttempts,
          });

          logger.updateProgress(id, {
            current: primeSet.size,
            total: count,
            phase: 'Generating primes',
            details: `spacing: ${minSpacing}`,
          });
        }
      } catch (error) {
        logger.verbose(`Attempt ${totalAttempts} failed: ${(error as Error).message}`);
        totalAttempts += 50;
      }
    }

    if (primeSet.size < count) {
      throw new Error(
        `Only generated ${primeSet.size}/${count} primes after ${totalAttempts} attempts`
      );
    }

    logger.success(id, { generated: primeSet.size, requested: count });
    logger.summary({
      generated: primeSet.size,
      requested: count,
      totalTime: Date.now() - startTime,
    });

    return [...primeSet].sort((a, b) => (a < b ? -1 : 1));
  } catch (error) {
    logger.error(id, error as Error, {
      operation: 'Generate prime batch',
      bitLength,
      count,
      attempts: totalAttempts,
    });
    throw error;
  }
}
