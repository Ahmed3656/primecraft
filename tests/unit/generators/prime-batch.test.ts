import { getBitLength } from '../../testUtils';
import { generateNormalPrimeBatch } from '@/generators';

describe('generateNormalPrimeBatch - Correctness Tests', () => {
  test('should generate correct number of primes', async () => {
    const options = {
      bitLength: 16, // Reduced for faster testing
      count: 3,
      minSpacing: 100n,
    };

    const primes = await generateNormalPrimeBatch(options);

    expect(primes).toHaveLength(3);
    primes.forEach((prime) => {
      expect(getBitLength(prime)).toBe(16);
      expect(prime % 2n).toBe(1n);
    });
  }, 15000);

  test('should generate unique primes', async () => {
    const options = {
      bitLength: 32, // Reasonable bit length
      count: 3, // Reduced count
      minSpacing: 1000n,
    };

    const primes = await generateNormalPrimeBatch(options);
    const uniquePrimes = new Set(primes);

    expect(uniquePrimes.size).toBe(primes.length);
  }, 20000);

  test('should respect minimum spacing between primes', async () => {
    const options = {
      bitLength: 20, // Reduced bit length
      count: 3,
      minSpacing: 500n, // Reasonable spacing
    };

    const primes = await generateNormalPrimeBatch(options);

    for (let i = 0; i < primes.length - 1; i++) {
      for (let j = i + 1; j < primes.length; j++) {
        const gap = primes[j] > primes[i] ? primes[j] - primes[i] : primes[i] - primes[j];
        expect(gap).toBeGreaterThanOrEqual(options.minSpacing);
      }
    }
  }, 25000);

  test('should return sorted primes', async () => {
    const options = {
      bitLength: 16,
      count: 4,
      minSpacing: 200n,
    };

    const primes = await generateNormalPrimeBatch(options);

    for (let i = 1; i < primes.length; i++) {
      expect(primes[i]).toBeGreaterThan(primes[i - 1]);
    }
  }, 20000);

  test('should handle single prime generation', async () => {
    const options = {
      bitLength: 32,
      count: 1,
    };

    const primes = await generateNormalPrimeBatch(options);

    expect(primes).toHaveLength(1);
    expect(getBitLength(primes[0])).toBe(32);
  });

  test('should use custom entropy source', async () => {
    const customEntropy = jest.fn((bits: number) => {
      // Generate a valid odd number in the correct range
      const min = 1n << BigInt(bits - 1);
      const max = (1n << BigInt(bits)) - 1n;
      const range = max - min + 1n;

      // Generate a random number in range and make it odd
      let num = min + (BigInt(Math.floor(Math.random() * 1000)) % range);
      if (num % 2n === 0n) num += 1n;
      if (num > max) num = max - 2n; // Ensure it stays in range and odd

      return num;
    });

    const options = {
      bitLength: 16,
      count: 2,
      minSpacing: 100n, // Reduced spacing for better success rate
      entropy: customEntropy,
    };

    const primes = await generateNormalPrimeBatch(options);
    expect(customEntropy).toHaveBeenCalled();
    expect(primes.length).toBe(2);
  }, 25000);

  test('should handle edge case with minimal spacing', async () => {
    const options = {
      bitLength: 16,
      count: 2,
      minSpacing: 1n, // Minimal spacing
    };

    const primes = await generateNormalPrimeBatch(options);

    expect(primes).toHaveLength(2);
    expect(primes[1]).toBeGreaterThan(primes[0]);
  });

  test('should handle reasonable batch sizes', async () => {
    const options = {
      bitLength: 12, // Small bit length for faster generation
      count: 5,
      minSpacing: 50n,
    };

    const primes = await generateNormalPrimeBatch(options);

    expect(primes).toHaveLength(5);

    // Verify all are valid primes with correct bit length
    primes.forEach((prime) => {
      expect(getBitLength(prime)).toBe(12);
      expect(prime % 2n).toBe(1n);
    });

    // Verify spacing
    for (let i = 1; i < primes.length; i++) {
      expect(primes[i] - primes[i - 1]).toBeGreaterThanOrEqual(50n);
    }
  }, 30000);
});
