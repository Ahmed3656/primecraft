import { generatePrimeSet } from '@/generators';

describe('Performance Benchmarks', () => {
  test('RSA multi-prime generation time (parallel)', async () => {
    const start = Date.now();

    const result = await generatePrimeSet({
      count: 3,
      bitLength: 1024,
      strategy: 'rsa-multi',
    });

    const elapsed = Date.now() - start;

    console.log(
      'Generated primes:',
      result.primes.map((p) => p.toString())
    );

    expect(elapsed).toBeLessThan(10000);
  });

  test('handles large bit lengths (parallel)', async () => {
    const result = await generatePrimeSet({
      count: 2,
      bitLength: 1024,
      strategy: 'rsa-multi',
    });

    result.primes.forEach((p) => {
      const bitLength = p.toString(2).length;
      expect(bitLength).toBeGreaterThan(340);
    });
  }, 30000);
});
