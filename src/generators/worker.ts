import { generateRandomBits, isProbablyPrime, isStrongPrime } from '@/core';
import { EntropySource } from '@/entropy';
import { getWheel, normalizeCandidate, primeFilter } from '@/helpers';

/**
 * Worker function for parallel prime generation.
 */
export async function generatePrimeWorker(
  bitLength: number,
  cutoff: number,
  entropy: EntropySource,
  maxAttempts: number,
  generateStrongPrime: boolean
): Promise<bigint> {
  const min = 1n << BigInt(bitLength - 1);
  const max = (1n << BigInt(bitLength)) - 1n;
  const { wheel, modulus } = getWheel(bitLength);

  let candidate = normalizeCandidate(generateRandomBits(bitLength, entropy), min, max);

  let base = candidate - (candidate % modulus);
  let wheelIndex = 0;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    candidate = base + wheel[wheelIndex];

    if (candidate > max) {
      base = min + ((base + modulus - min) % (max - min + 1n));
      wheelIndex = 0;
      continue;
    }

    if (candidate >= min && primeFilter(candidate, cutoff)) {
      const isPrime = generateStrongPrime
        ? isStrongPrime(candidate, bitLength)
        : isProbablyPrime(candidate, bitLength);

      if (isPrime) return candidate;
    }

    wheelIndex = (wheelIndex + 1) % wheel.length;
    if (wheelIndex === 0) base += modulus;
  }

  const type = generateStrongPrime ? 'strong' : 'normal';
  throw new Error(`Failed to generate ${type} prime after ${maxAttempts} attempts`);
}
