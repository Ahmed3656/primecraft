import { GenerationOptions } from './types';
import { generateRandomBits, isStrongPrime, areValidRSAPrimes } from '@/core';
import { EntropySource, defaultEntropy } from '@/config';
import { calculateMaxAttempts } from '@/utils';
import { getFilterCutoff } from '@/helpers';

/**
 * Generates a single strong prime within specified bit length
 */
export function generateStrongPrime(
  bitLength: number,
  cutoff: number,
  entropy: EntropySource = defaultEntropy
): bigint {
  const min = 1n << BigInt(bitLength - 1);
  const max = (1n << BigInt(bitLength)) - 1n;
  const maxAttempts = calculateMaxAttempts(bitLength);

  let candidate = generateRandomBits(bitLength, entropy);
  if (candidate < min) candidate = min + (candidate % (max - min));
  if (candidate % 2n === 0n) candidate += 1n;
  if (candidate > max) candidate -= 2n;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (isStrongPrime(candidate, bitLength, cutoff)) {
      return candidate;
    }
    candidate += 2n;

    if (candidate > max) {
      candidate = min + (candidate - max - 2n);
      if (candidate % 2n === 0n) candidate += 1n;
    }
  }

  throw new Error(`Failed to generate strong prime after ${maxAttempts} attempts`);
}

/**
 * Generates multiple strong primes with specified constraints
 */
export function generateStrongPrimes(options: GenerationOptions): bigint[] {
  const { bitLength, count = 1, minSpacing = 1000n, entropy = defaultEntropy } = options;

  const cutoff = getFilterCutoff(bitLength);
  const primes: bigint[] = [];

  while (primes.length < count) {
    const candidate = generateStrongPrime(bitLength, cutoff, entropy);

    const validSpacing = primes.every((existing) => {
      const gap = candidate > existing ? candidate - existing : existing - candidate;
      return gap >= minSpacing;
    });

    if (validSpacing) {
      primes.push(candidate);
    }
  }

  return primes.sort((a, b) => (a < b ? -1 : 1));
}

/**
 * Generates a pair of primes suitable for RSA key generation
 */
export function generateRSAPrimePair(
  bitLength: number,
  entropy: EntropySource = defaultEntropy
): { p: bigint; q: bigint } {
  const maxAttempts = calculateMaxAttempts(bitLength);
  const cutoff = getFilterCutoff(bitLength);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const p = generateStrongPrime(bitLength, cutoff, entropy);
    const q = generateStrongPrime(bitLength, cutoff, entropy);

    if (areValidRSAPrimes(p, q, bitLength, cutoff)) {
      return { p, q };
    }
  }

  throw new Error('Failed to generate valid RSA prime pair');
}
