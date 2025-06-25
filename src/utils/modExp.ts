/**
 * Computes (base ^ exponent) % modulus using optimized square-and-multiply algorithm.
 * Efficient for large numbers with bitwise operations and early exit optimizations.
 */
export function modExp(base: bigint, exponent: bigint, modulus: bigint): bigint {
  if (modulus === 1n) return 0n;
  if (exponent === 0n) return 1n;
  if (exponent === 1n) return base % modulus;

  if (exponent < 0n) {
    throw new Error('Negative exponents not supported');
  }

  let result = 1n;
  base = base % modulus;

  if (base === 0n) return 0n;
  if (base === 1n) return 1n;

  while (exponent > 0n) {
    if (exponent & 1n) {
      result = (result * base) % modulus;
    }
    exponent >>= 1n;
    base = (base * base) % modulus;
  }

  return result;
}
