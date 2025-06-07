/**
 * Calculates the minimum gap between RSA primes to avoid close-prime attacks.
 */
export function getMinRSAGap(bitLength: number): bigint {
  if (bitLength < 512) console.warn(`[primecraft] Warning: RSA bitLength < 512 is not considered secure.`);
  
  const primeBitLength = bitLength / 2;
  const minGapBits = Math.max(10, Math.floor(primeBitLength - 50));

  return 1n << BigInt(minGapBits);
}
