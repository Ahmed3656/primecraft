import { isStrongPrime } from '@/core';
import { defaultEntropy } from '@/config';
import { generateStrongPrime } from '@/generators';
import { getFilterCutoff } from '@/helpers';

describe('Core Prime Generation', () => {
  test('generates prime of correct bit length', () => {
    const bitLength = 128;
    const cutoff = getFilterCutoff(bitLength);
    const prime = generateStrongPrime(bitLength, cutoff, defaultEntropy);
    // console.log('128-bit prime:', prime.toString());

    expect(prime).toBeGreaterThan(2n ** 127n); // At least 128 bits
    expect(prime).toBeLessThan(2n ** 128n); // Not more than 128 bits
    expect(isStrongPrime(prime, bitLength, cutoff)).toBe(true);
  });

  test('generates different primes each time', () => {
    const cutoff = getFilterCutoff(64);

    const prime1 = generateStrongPrime(64, cutoff, defaultEntropy);
    const prime2 = generateStrongPrime(64, cutoff, defaultEntropy);

    // console.log('64-bit prime 1:', prime1.toString());
    // console.log('64-bit prime 2:', prime2.toString());

    expect(prime1).not.toBe(prime2);
  });

  test('handles small bit lengths', () => {
    const cutoff = getFilterCutoff(8);

    const prime = generateStrongPrime(8, cutoff, defaultEntropy);
    // console.log('8-bit prime:', prime.toString());

    expect(prime).toBeGreaterThan(127n); // 2^7
    expect(prime).toBeLessThan(256n); // 2^8
  });
});
