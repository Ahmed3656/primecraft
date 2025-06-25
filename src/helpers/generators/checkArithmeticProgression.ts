/**
 * Checks if the given prime numbers form a perfect arithmetic progression.
 *
 * Requires at least 3 primes to confirm progression.
 */
export function checkArithmeticProgression(primes: bigint[]): boolean {
  if (primes.length < 3) return false;

  const sorted = [...primes].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const diff = sorted[1] - sorted[0];

  for (let i = 2; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] !== diff) return false;
  }

  return true;
}
