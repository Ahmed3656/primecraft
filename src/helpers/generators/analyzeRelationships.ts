import { gcd } from '@/utils';

export function analyzeRelationships(primes: bigint[]): string[] {
  const relationships: string[] = [];

  for (let i = 0; i < primes.length - 1; i++) {
    const p1 = primes[i];
    const p2 = primes[i + 1];

    if (p2 - p1 === 2n) relationships.push(`Twin primes: ${p1}, ${p2}`);
    if (p2 === 2n * p1 + 1n) relationships.push(`Sophie Germain: ${p1} → ${p2}`);
    if (gcd(p1 - 1n, p2 - 1n) === 2n) relationships.push(`Coprime φ values: ${p1}, ${p2}`);
  }

  return relationships;
}
