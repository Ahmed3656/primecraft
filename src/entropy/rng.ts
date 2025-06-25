import { randomBytes } from 'crypto';

/**
 * Type definition for an entropy source that generates a BigInt of given bit length.
 */
// eslint-disable-next-line no-unused-vars
export type EntropySource = (bits: number) => bigint;

/**
 * Default entropy source using Node's crypto module.
 * Ensures exact bit length and cryptographic security.
 */
export const defaultEntropy: EntropySource = (bits: number): bigint => {
  if (bits < 2) throw new Error('Bit length must be at least 2');

  const byteLength = Math.ceil(bits / 8);
  const buffer = randomBytes(byteLength);

  const excessBits = 8 * byteLength - bits;
  buffer[0] &= 0xff >>> excessBits;

  buffer[0] |= 1 << (7 - excessBits);

  return BigInt('0x' + buffer.toString('hex'));
};
