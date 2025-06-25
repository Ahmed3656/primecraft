import { generateRandomBits, isStrongPrime } from '@/core';
import { EntropySource } from '@/entropy';
import { getWheel } from '@/helpers';

/**
 * Worker function for parallel prime generation.
 */
export async function generatePrimeWorker(
  bitLength: number,
  cutoff: number,
  entropy: EntropySource,
  maxAttempts: number
): Promise<bigint> {
  const min = 1n << BigInt(bitLength - 1);
  const max = (1n << BigInt(bitLength)) - 1n;
  const { wheel, modulus } = getWheel(bitLength);

  let candidate = generateRandomBits(bitLength, entropy);
  if (candidate < min) candidate = min + (candidate % (max - min));
  if (candidate % 2n === 0n) candidate += 1n;
  if (candidate > max) candidate -= 2n;

  let base = candidate - (candidate % modulus);
  let wheelIndex = 0;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const offset = wheel[wheelIndex % wheel.length];
    candidate = base + offset;

    if (candidate > max) {
      base = min + ((base + modulus - min) % (max - min));
      candidate = base + wheel[wheelIndex % wheel.length];
    }

    if (isStrongPrime(candidate, bitLength, cutoff)) {
      return candidate;
    }

    wheelIndex++;
    if (wheelIndex % wheel.length === 0) base += modulus;
  }

  throw new Error(`Worker failed to generate prime after ${maxAttempts} attempts`);
}
