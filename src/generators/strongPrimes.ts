import os from 'os';
import { defaultEntropy } from '@/entropy';
import { generatePrimeWorker } from '@/generators';
import { getFilterCutoff } from '@/helpers';
import { logger } from '@/logger';
import { GenerationOptions } from '@/types';
import { calculateMaxAttempts } from '@/utils';

/**
 * Generates multiple strong primes with specified constraints.
 */
export async function generateStrongPrimes(options: GenerationOptions): Promise<bigint[]> {
  const startTime = Date.now();
  const id = `strong-${startTime}`;
  const { bitLength, count = 1, minSpacing = 1000n, entropy = defaultEntropy } = options;

  logger.startOperation(id, {
    operation: 'Strong prime' + (count > 1 ? 's' : ''),
    bitLength,
    count,
  });

  const cutoff = getFilterCutoff(bitLength);
  const maxAttempts = calculateMaxAttempts(bitLength);
  const workers = os.cpus().length || 4;

  const primes: bigint[] = [];
  let totalAttempts = 0;

  try {
    const promises = Array(workers)
      .fill(null)
      .map((_, index) => {
        logger.updateProgress(id, {
          current: index,
          total: workers,
          phase: 'Generating prime' + (count > 1 ? 's' : ''),
          details: `${workers} workers`,
        });
        return generatePrimeWorker(
          bitLength,
          cutoff,
          entropy,
          Math.floor(maxAttempts / workers),
          true
        );
      });

    const candidates = await Promise.allSettled(promises);
    totalAttempts += workers;

    for (const result of candidates) {
      if (result.status === 'fulfilled' && primes.length < count) {
        const candidate = result.value;

        const validSpacing = primes.every((existing) => {
          const gap = candidate > existing ? candidate - existing : existing - candidate;
          return gap >= minSpacing;
        });

        if (validSpacing) {
          primes.push(candidate);
          logger.verbose(`Added strong prime ${primes.length}/${count}`, {
            prime: candidate.toString(16).substring(0, 16) + '...',
            totalAttempts,
          });
        }
      }
    }
    if (totalAttempts >= maxAttempts && primes.length < count) {
      throw new Error(
        `Only generated ${primes.length}/${count} strong primes after ${totalAttempts} attempts`
      );
    }

    logger.success(id, { generated: primes.length, requested: count });
    logger.summary({
      generated: primes.length,
      requested: count,
      totalTime: Date.now() - startTime,
    });
    return primes.sort((a, b) => (a < b ? -1 : 1));
  } catch (error) {
    logger.error(id, error as Error, {
      operation: 'Generate strong primes',
      bitLength,
      count,
      attempts: totalAttempts,
    });
    throw error;
  }
}
