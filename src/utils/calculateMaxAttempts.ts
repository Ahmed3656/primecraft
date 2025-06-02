/**
 * Calculates the maximum number of allowed attempts to generate a strong prime,
 * dynamically scaling based on the requested bit length.
 */
export function calculateMaxAttempts(bits: number): number {
  return Math.floor(100 * Math.pow(bits, 1.4));
}
