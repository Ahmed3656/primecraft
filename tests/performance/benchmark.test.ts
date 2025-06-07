import { generatePrimeSet } from '@/generators';

describe('Performance Benchmarks', () => {
  test('RSA multi-prime generation time', () => {
    const start = Date.now();
    
    const result = generatePrimeSet({
      count: 3,
      bitLength: 1024,
      strategy: 'rsa-multi'
    });
    
    const elapsed = Date.now() - start;
    
    expect(elapsed).toBeLessThan(10000);
    expect(result.metadata.generationTime).toBeLessThan(elapsed);
  });

  test('handles large bit lengths', () => {
    const result = generatePrimeSet({
      count: 2,
      bitLength: 1024,
      strategy: 'rsa-multi'
    });

    result.primes.forEach(p => {
      const bitLength = p.toString(2).length;
      expect(bitLength).toBeGreaterThan(340);
    });
  }, 30000);
});
