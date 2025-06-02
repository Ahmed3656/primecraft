import { generateRSAMultiPrimes } from '@/generators';
import { MultiPrimeOptions, PrimeSet } from '@/generators/types';

/**
 * Generates cryptographically strong prime sets for advanced use cases
 */
export function generatePrimeSet(options: MultiPrimeOptions): PrimeSet {
  let totalAttempts = 0;

  switch (options.strategy) {
    case 'rsa-multi':
      return generateRSAMultiPrimes(options, totalAttempts);
    default:
      throw new Error(`Unknown strategy: ${options.strategy}`);
  }
}
