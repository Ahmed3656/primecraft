import { PrimeSet } from '@/generators/types';
import { analyzeRelationships, assessStrength } from '@/helpers';

export function createPrimeSet(
  primes: bigint[],
  strategy: string,
  attempts: number,
  startTime: number
): PrimeSet {
  const gaps = primes.slice(1).map((p, i) => p - primes[i]);
  const product = primes.reduce((acc, p) => acc * p, 1n);
  const bitLengths = primes.map((p) => p.toString(2).length);

  return {
    primes: primes.sort((a, b) => (a < b ? -1 : 1)),
    properties: {
      gaps,
      product,
      bitLengths,
      relationships: analyzeRelationships(primes),
      strength: assessStrength(primes),
    },
    metadata: {
      attempts,
      generationTime: Date.now() - startTime,
      strategy,
    },
  };
}
