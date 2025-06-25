import { isStrongPrime } from '@/core';
import { generateRSAMultiPrimes } from '@/generators';
import { MultiPrimeOptions } from '@/types/generation';
import { getFilterCutoff } from '@/helpers';

describe('RSA Multi-Prime Strategy', () => {
  const baseOptions: MultiPrimeOptions = {
    count: 3,
    bitLength: 192,
    strategy: 'rsa-multi',
    constraints: {
      minGap: 100n,
      avoidWeak: true,
    },
  };

  const cutoff = getFilterCutoff(baseOptions.bitLength);

  test('generates correct number of primes (parallel)', async () => {
    const result = await generateRSAMultiPrimes(baseOptions, 0);
    console.log(
      'Generated primes:',
      result.primes.map((p) => p.toString())
    );
    // console.log('Strategy used:', result.metadata.strategy);

    expect(result.primes).toHaveLength(3);
    expect(result.metadata.strategy).toBe('rsa-multi');
  });

  test('respects gap constraints (parallel)', async () => {
    const result = await generateRSAMultiPrimes(baseOptions, 0);
    const primes = result.primes.sort((a, b) => (a < b ? -1 : 1));

    // console.log(
    //   'Sorted primes (for gap check):',
    //   primes.map((p) => p.toString())
    // );

    for (let i = 1; i < primes.length; i++) {
      const gap = primes[i] - primes[i - 1];
      // console.log(`Gap between prime[${i - 1}] and prime[${i}]:`, gap.toString());
      expect(gap).toBeGreaterThanOrEqual(100n);
    }
  });

  test('primes are suitable for RSA (parallel)', async () => {
    const result = await generateRSAMultiPrimes(baseOptions, 0);

    // eslint-disable-next-line no-unused-vars
    result.primes.forEach((p, i) => {
      // console.log(`Prime[${i}]:`, p.toString(), 'Strong:', isStrongPrime(p, baseOptions.bitLength, cutoff));
      expect(isStrongPrime(p, baseOptions.bitLength, cutoff)).toBe(true);
    });

    // console.log('Prime product:', result.properties.product.toString());

    expect(result.properties.product).toBeGreaterThan(0n);
  });
});
