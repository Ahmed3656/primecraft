/**
 * Calculates the minimum gap between RSA primes to avoid close-prime attacks.
 */
export function getMinRSAGap(bitLength: number, count: number): bigint {
  if (bitLength < 512)
    console.warn(`[primecraft] Warning: RSA bitLength < 512 is not considered secure.`);

  const primeBitLength = Math.floor(bitLength / count);
  const minGapBits = Math.floor(primeBitLength / 2);

  return 1n << BigInt(minGapBits);
}
