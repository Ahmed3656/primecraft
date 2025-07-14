import os from 'os';
import { defaultEntropy } from '@/entropy';
import { generatePrimeWorker } from '@/generators';
import { createPrimeSet, getFilterCutoff, getMinRSAGap } from '@/helpers';
import { logger } from '@/logger';
import { MultiPrimeOptions, PrimeSet } from '@/types';
import { absBigInt, calculateMaxAttempts, isWeakForMultiRSA } from '@/utils';

/**
 * Multi-prime RSA: Generate n primes for multi-prime RSA (faster decryption).
 */
export async function generateRSAMultiPrimes(
  options: MultiPrimeOptions,
  attempts: number
): Promise<PrimeSet> {
  const startTime = Date.now();
  const id = `rsa-multi-${startTime}`;
  const { count, bitLength, constraints = {}, entropy = defaultEntropy } = options;
  const { minGap = getMinRSAGap(bitLength, count), avoidWeak = true } = constraints;

  logger.startOperation(id, {
    operation: 'RSA multi-primes',
    bitLength,
    count,
    strategy: options.strategy,
  });

  const primes: bigint[] = [];
  const targetBitLength = Math.floor(bitLength / count);
  const cutoff = getFilterCutoff(targetBitLength);
  const maxAttempts = calculateMaxAttempts(targetBitLength);
  const workers = os.cpus.length || 4;

  let totalAttempts = attempts;

  try {
    while (primes.length < count) {
      totalAttempts++;

      const promises = Array(workers)
        .fill(null)
        .map((_, index): Promise<bigint> => {
          logger.updateProgress(id, {
            current: index,
            total: workers,
            phase: 'Generating primes',
            details: `${workers} workers`,
          });
          return generatePrimeWorker(
            targetBitLength,
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
        if (primes.length >= count) break;

        if (avoidWeak && isWeakForMultiRSA(candidate, primes)) {
          logger.verbose('Rejected weak prime for multi-RSA', {
            prime: candidate.toString(16).substring(0, 16) + '...',
            reason: 'weak for multi-RSA',
          });
          continue;
        }

        const validGaps = primes.every((p) => {
          const gap = absBigInt(candidate - p);
          return gap >= minGap;
        });

        if (validGaps) {
          primes.push(candidate);
          logger.verbose(`Added RSA prime ${primes.length}/${count}`, {
            prime: candidate.toString(16).substring(0, 16) + '...',
            totalAttempts,
          });
        }
      }
    }

    logger.success(id, { generated: primes.length, requested: count });
    logger.summary({
      generated: primes.length,
      requested: count,
      totalTime: Date.now() - startTime,
      strategy: options.strategy,
    });

    return createPrimeSet(primes, options.strategy, totalAttempts, startTime);
  } catch (error) {
    logger.error(id, error as Error, {
      operation: 'Generate RSA multi-primes',
      bitLength,
      count,
      attempts: totalAttempts,
      strategy: options.strategy,
    });
    throw error;
  }
}
