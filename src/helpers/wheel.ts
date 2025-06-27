import { WHEEL_30, WHEEL_210 } from '@/constants';

/*
 * Selects the optimal wheel configuration based on the desired bit length.
 */
export function getWheel(bitLength: number): { wheel: bigint[]; modulus: bigint } {
  return bitLength >= 128 && bitLength <= 1024
    ? { wheel: WHEEL_210, modulus: 210n }
    : bitLength <= 6
      ? { wheel: [1n], modulus: 2n }
      : { wheel: WHEEL_30, modulus: 30n };
}
