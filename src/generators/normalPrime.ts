import { EntropySource, defaultEntropy } from '@/entropy';
import { getFilterCutoff } from '@/helpers';
import { calculateMaxAttempts } from '@/utils';
import { generatePrimeWorker } from '@/generators';

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
  return generatePrimeWorker(bitLength, cutoff, entropy, maxAttempts, false);
}

/**
 * Generates a random probable prime of the specified bit length.
 */
export async function generateNormalPrime(
  bitLength: number,
  entropy: EntropySource = defaultEntropy,
  maxAttempts: number = calculateMaxAttempts(bitLength)
): Promise<bigint> {
  const cutoff = getFilterCutoff(bitLength);
  return generateNormalPrimeInternal(bitLength, cutoff, entropy, maxAttempts);
}
