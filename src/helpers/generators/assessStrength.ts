export function assessStrength(primes: bigint[]): 'weak' | 'good' | 'strong' | 'exceptional' {
  const minBits = Math.min(...primes.map((p) => p.toString(2).length));
  const hasGoodSpacing = primes.every((p, i) => i === 0 || p - primes[i - 1] > 1000n);

  if (minBits < 64) return 'weak';
  if (minBits < 128 || !hasGoodSpacing) return 'good';
  if (minBits < 256) return 'strong';
  return 'exceptional';
}
