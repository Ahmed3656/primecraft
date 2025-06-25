import { generateRSAMultiPrimes } from '@/generators';
import { MultiPrimeOptions, PrimeSet } from '@/types/generation';

/**
 * Generates cryptographically strong prime sets for advanced use cases
 */
export async function generatePrimeSet(options: MultiPrimeOptions): Promise<PrimeSet> {
  let totalAttempts = 0;

  switch (options.strategy) {
    case 'rsa-multi':
      return await generateRSAMultiPrimes(options, totalAttempts);
    default:
      throw new Error(`Unknown strategy: ${options.strategy}`);
  }
}
