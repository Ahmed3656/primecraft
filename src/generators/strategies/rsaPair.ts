import os from 'os';
import { areValidRSAPrimes } from '@/core';
import { EntropySource, defaultEntropy } from '@/entropy';
import { generatePrimeWorker } from '@/generators';
import { getFilterCutoff } from '@/helpers';
import { logger } from '@/logger';
import { calculateMaxAttempts } from '@/utils';

/**
 * Generates a pair of primes suitable for RSA key generation.
 */
export async function generateRSAPrimePair(
  bitLength: number,
  entropy: EntropySource = defaultEntropy
): Promise<{ p: bigint; q: bigint }> {
  const startTime = Date.now();
  const id = `rsa-pair-${startTime}`;

  logger.startOperation(id, {
    operation: 'RSA prime pair',
    bitLength,
    count: 2,
    strategy: 'rsa-pair',
  });

  const maxAttempts = calculateMaxAttempts(bitLength);
  const cutoff = getFilterCutoff(bitLength);
  const workers = os.cpus.length || 4;
  let totalAttempts = 0;

  const primes: bigint[] = [];
  const targetCount = 2;

  try {
    totalAttempts++;

    const promises = Array(workers)
      .fill(null)
      .map((_, index) => {
        logger.updateProgress(id, {
          current: index,
          total: workers,
          phase: 'Generating primes',
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

    const results = await Promise.allSettled(promises);
    const candidates = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<bigint>).value);

    for (const candidate of candidates) {
      if (primes.length >= targetCount) break;

      let isValid = true;

      if (primes.length > 0) {
        isValid = areValidRSAPrimes(primes[0], candidate, bitLength);
      }

      if (isValid) {
        primes.push(candidate);
        logger.verbose(`Added RSA prime ${primes.length}/${targetCount}`, {
          prime: candidate.toString(16).substring(0, 16) + '...',
          totalAttempts,
        });
      }
    }

    logger.success(id, { generated: primes.length, requested: targetCount });
    logger.summary({
      generated: primes.length,
      requested: targetCount,
      totalTime: Date.now() - startTime,
      strategy: 'rsa-pair',
    });

    return { p: primes[0], q: primes[1] };
  } catch (error) {
    logger.error(id, error as Error, {
      operation: 'Generate RSA prime pair',
      bitLength,
      count: 2,
      attempts: totalAttempts,
      strategy: 'rsa-pair',
    });
    throw error;
  }
}
