import { getBitLength } from '../testUtils';
import { generateNormalPrime } from '@/generators';

describe('generateNormalPrime - Performance Tests', () => {
  test('should generate 1024-bit prime within reasonable time', async () => {
    const startTime = performance.now();
    const prime = await generateNormalPrime(1024);
    const endTime = performance.now();
    const elapsed = endTime - startTime;

    expect(elapsed).toBeLessThan(2000);
    expect(getBitLength(prime)).toBe(1024);
  }, 30000);

  test('should generate 2048-bit prime within reasonable time', async () => {
    const startTime = performance.now();
    const prime = await generateNormalPrime(2048);
    const endTime = performance.now();
    const elapsed = endTime - startTime;

    expect(elapsed).toBeLessThan(30000);
    expect(getBitLength(prime)).toBe(2048);
  }, 120000);

  test('should generate smaller primes quickly', async () => {
    const bitLengths = [128, 256, 512];

    for (const bitLength of bitLengths) {
      const startTime = performance.now();
      const prime = await generateNormalPrime(bitLength);
      const endTime = performance.now();
      const elapsed = endTime - startTime;

      expect(elapsed).toBeLessThan(1000);
      expect(getBitLength(prime)).toBe(bitLength);
    }
  }, 15000);

  test('should show performance scaling with bit length', async () => {
    const bitLengths = [256, 512, 1024];
    const times: { bitLength: number; time: number }[] = [];

    for (const bitLength of bitLengths) {
      const startTime = performance.now();
      await generateNormalPrime(bitLength);
      const endTime = performance.now();
      const elapsed = endTime - startTime;

      times.push({ bitLength, time: elapsed });
    }

    expect(times[0].time).toBeLessThan(1000);
    expect(times[1].time).toBeLessThan(5000);
    expect(times[2].time).toBeLessThan(10000);
  }, 60000);

  test('should maintain acceptable performance variance', async () => {
    const bitLength = 512; // Use moderate bit length for consistent testing
    const times: number[] = [];
    const iterations = 3; // Reduced iterations for practical testing

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      await generateNormalPrime(bitLength);
      const endTime = performance.now();
      times.push(endTime - startTime);
    }

    const avgTime = times.reduce((a, b) => a + b) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);

    expect(avgTime).toBeLessThan(5000); // Average should be reasonable
    expect(maxTime).toBeLessThan(15000); // No single run should be extremely slow

    // Variance shouldn't be too extreme (max shouldn't be more than 10x min)
    expect(maxTime / minTime).toBeLessThan(10);
  }, 60000);

  // Benchmark test (doesn't fail, just reports performance)
  test('performance benchmark - reports actual timings', async () => {
    const testCases = [
      { bitLength: 128, expectedRange: '1-50ms' },
      { bitLength: 256, expectedRange: '5-200ms' },
      { bitLength: 512, expectedRange: '50-1000ms' },
      { bitLength: 1024, expectedRange: '200-5000ms' },
      { bitLength: 2048, expectedRange: '500-10000ms' },
      // { bitLength: 3072, expectedRange: '20000-60000ms' },
      // { bitLength: 4096, expectedRange: '60000-100000ms' },
    ];

    console.log('\n=== Prime Generation Performance Benchmark ===');

    for (const testCase of testCases) {
      const startTime = performance.now();
      const prime = await generateNormalPrime(testCase.bitLength);
      const endTime = performance.now();
      const elapsed = endTime - startTime;

      console.log(
        `${testCase.bitLength}-bit: ${elapsed.toFixed(2)}ms (expected: ${testCase.expectedRange})`
      );

      expect(getBitLength(prime)).toBe(testCase.bitLength);
    }
  }, 60000);
});
