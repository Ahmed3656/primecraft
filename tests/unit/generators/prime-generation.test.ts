import { isStrongPrime } from '@/core';
import { defaultEntropy } from '@/entropy';
import { generateStrongPrimes } from '@/generators';

describe('Core Prime Generation', () => {
  test('generates prime of correct bit length (parallel)', async () => {
    const bitLength = 128;
    const primes = await generateStrongPrimes({
      bitLength,
      count: 1,
      entropy: defaultEntropy,
    });
    const prime = primes[0];
    // console.log('128-bit prime:', prime.toString());

    expect(prime).toBeGreaterThan(2n ** 127n); // At least 128 bits
    expect(prime).toBeLessThan(2n ** 128n); // Not more than 128 bits
    expect(isStrongPrime(prime, bitLength)).toBe(true);
  });

  test('generates different primes each time (parallel)', async () => {
    const primes1 = await generateStrongPrimes({
      bitLength: 64,
      count: 1,
      entropy: defaultEntropy,
    });
    const primes2 = await generateStrongPrimes({
      bitLength: 64,
      count: 1,
      entropy: defaultEntropy,
    });

    const prime1 = primes1[0];
    const prime2 = primes2[0];

    // console.log('64-bit prime 1:', prime1.toString());
    // console.log('64-bit prime 2:', prime2.toString());

    expect(prime1).not.toBe(prime2);
  });

  test('handles small bit lengths (parallel)', async () => {
    const primes = await generateStrongPrimes({
      bitLength: 8,
      count: 1,
      entropy: defaultEntropy,
    });
    const prime = primes[0];
    // console.log('8-bit prime:', prime.toString());

    expect(prime).toBeGreaterThan(127n); // 2^7
    expect(prime).toBeLessThan(256n); // 2^8
  });
});
