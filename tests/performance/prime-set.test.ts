import { generatePrimeSet } from '@/generators';

describe('generatePrimeSet - Performance Tests', () => {
  test('RSA multi-prime generation time', async () => {
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

    console.log(`Total generation time: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(10000);
  });

  test('handles large bit lengths', async () => {
    const genStart = Date.now();

    const result = await generatePrimeSet({
      count: 2,
      bitLength: 1024,
      strategy: 'rsa-multi',
    });

    const genTime = Date.now() - genStart;
    console.log(`Prime generation time: ${genTime}ms`);

    const bitStart = Date.now();

    result.primes.forEach((p, i) => {
      const bitLength = p.toString(2).length;
      console.log(`Prime ${i + 1} bit length: ${bitLength}`);
      expect(bitLength).toBeGreaterThan(340);
    });

    const bitCheckTime = Date.now() - bitStart;
    console.log(`Bit length check time: ${bitCheckTime}ms`);
  }, 30000);
});
