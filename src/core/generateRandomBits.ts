import { EntropySource, defaultEntropy } from '@/config';

/**
 * Generates a random BigInt with a specified bit length using the provided entropy source.
 */
export function generateRandomBits(
  bitLength: number,
  entropy: EntropySource = defaultEntropy
): bigint {
  if (bitLength < 2) throw new Error('Bit length must be >= 2');

  let n = entropy(bitLength);

  const msb = BigInt(1) << BigInt(bitLength - 1);
  n |= msb;

  n |= BigInt(1);

  return n;
}
