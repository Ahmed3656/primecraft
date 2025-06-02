import { randomBytes } from 'crypto';

/**
 * Returns a cryptographically secure random bigint between min and max (inclusive).
 */
export function generateRandomBetween(min: bigint, max: bigint): bigint {
  const range = max - min + 1n;
  const bits = range.toString(2).length;

  let rnd: bigint;
  do {
    const bytes = randomBytes(Math.ceil(bits / 8));
    rnd = BigInt('0x' + bytes.toString('hex'));
  } while (rnd >= range);

  return min + rnd;
}
