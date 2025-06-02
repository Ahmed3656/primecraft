/**
 * Returns the recommended number of Miller-Rabin rounds based on the candidate’s bit length.
 */
export function getMRRounds(bitLength: number): number {
  if (bitLength <= 256) return 16;
  if (bitLength <= 512) return 32;
  if (bitLength <= 1024) return 48;
  return 64;
}
