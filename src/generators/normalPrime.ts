import { EntropySource, defaultEntropy } from '@/entropy';
import { generatePrimeWorker } from '@/generators';
import { getFilterCutoff } from '@/helpers';
import { logger } from '@/logger';
import { calculateMaxAttempts } from '@/utils';

/**
 * Internal function for generating a probable prime with custom parameters.
 * Allows passing a precomputed cutoff for optimized batch generation.
 */
export async function generateNormalPrimeInternal(
  bitLength: number,
  cutoff: number = getFilterCutoff(bitLength),
  entropy: EntropySource = defaultEntropy,
  maxAttempts: number = calculateMaxAttempts(bitLength)
): Promise<bigint> {
  try {
    return generatePrimeWorker(bitLength, cutoff, entropy, maxAttempts, false);
  } catch (error) {
    logger.verbose(`Internal prime generation failed: ${(error as Error).message}`, {
      bitLength,
      maxAttempts,
    });
    throw error;
  }
}

/**
 * Generates a random probable prime of the specified bit length.
 */
export async function generateNormalPrime(
  bitLength: number,
  entropy: EntropySource = defaultEntropy,
  maxAttempts: number = calculateMaxAttempts(bitLength)
): Promise<bigint> {
  const id = `normal-${Date.now()}`;

  logger.startOperation(id, {
    operation: 'Generating normal prime',
    bitLength,
    count: 1,
  });

  try {
    const cutoff = getFilterCutoff(bitLength);
    const result = await generateNormalPrimeInternal(bitLength, cutoff, entropy, maxAttempts);

    logger.success(id, { generated: 1, requested: 1 });

    return result;
  } catch (error) {
    logger.error(id, error as Error, {
      operation: 'Generate normal prime',
      bitLength,
      count: 1,
    });
    throw error;
  }
}
