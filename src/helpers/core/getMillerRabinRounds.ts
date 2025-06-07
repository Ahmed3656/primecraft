/**
 * Returns the recommended number of Miller-Rabin rounds based on the candidate’s bit length.
 */
export function getMRRounds(bitLength: number): number {
  if (bitLength <= 64) return 7;
  if (bitLength <= 128) return 8;
  if (bitLength <= 256) return 9;
  if (bitLength <= 512) return 10;
  if (bitLength <= 1024) return 12;
  if (bitLength <= 2048) return 15;
  return 20;
}
