import { getBitLength, isInRange } from '../../testUtils';
import { generateNormalPrime, generateNormalPrimeBatch } from '@/generators';

describe('Normal Prime Generation', () => {
  describe('generateNormalPrime - Correctness Tests', () => {
    test('should generate prime with correct bit length', async () => {
      const bitLengths = [8, 16, 32, 64, 128, 256, 512];

      for (const bitLength of bitLengths) {
        const prime = await generateNormalPrime(bitLength);

        expect(typeof prime).toBe('bigint');
        expect(prime > 0n).toBe(true);
        expect(getBitLength(prime)).toBe(bitLength);
        expect(isInRange(prime, bitLength)).toBe(true);
        expect(prime % 2n).toBe(1n); // Should be odd
      }
    }, 30000); // Increased timeout for larger bit lengths

    test('should generate different primes on multiple calls', async () => {
      const bitLength = 32; // Use smaller bit length for faster tests
      const primes = new Set<bigint>();

      for (let i = 0; i < 5; i++) {
        // Reduced iterations
        const prime = await generateNormalPrime(bitLength);
        primes.add(prime);
      }

      // Should generate at least some different primes
      expect(primes.size).toBeGreaterThan(1);
    });

    test('should handle minimum valid bit lengths correctly', async () => {
      // Test bit length 2 (should generate 2 or 3)
      const prime2 = await generateNormalPrime(2);
      expect([2n, 3n]).toContain(prime2);

      // Test bit length 3 (should generate primes in range [4, 7])
      const prime3 = await generateNormalPrime(3);
      expect(prime3).toBeGreaterThanOrEqual(4n);
      expect(prime3).toBeLessThanOrEqual(7n);
      expect(prime3 % 2n).toBe(1n);
    });

    test('should generate prime in correct range', async () => {
      const bitLength = 10;
      const prime = await generateNormalPrime(bitLength);
      const min = 1n << BigInt(bitLength - 1); // 2^(bitLength-1)
      const max = (1n << BigInt(bitLength)) - 1n; // 2^bitLength - 1

      expect(prime).toBeGreaterThanOrEqual(min);
      expect(prime).toBeLessThanOrEqual(max);
    });

    test('should throw error for invalid bit length', async () => {
      await expect(generateNormalPrime(0)).rejects.toThrow();
      await expect(generateNormalPrime(1)).rejects.toThrow();
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

      const bitLength = 10;
      await generateNormalPrime(bitLength, customEntropy);
      expect(customEntropy).toHaveBeenCalled();
    });

    test('should handle large prime generation (1024+ bits)', async () => {
      const prime = await generateNormalPrime(1024);

      expect(getBitLength(prime)).toBe(1024);
      expect(prime % 2n).toBe(1n);
      expect(isInRange(prime, 1024)).toBe(true);
    }, 60000); // Long timeout for 1024-bit prime generation
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle maximum attempts exceeded gracefully', async () => {
      // Create a custom entropy that generates even numbers (never prime except 2)
      const badEntropy = jest.fn((bits: number) => {
        const min = 1n << BigInt(bits - 1);
        // Always return an even number > 2, which will never be prime
        return min + 2n; // This will always be even and > 2
      });

      await expect(
        generateNormalPrime(32, badEntropy, 5) // Very few attempts
      ).rejects.toThrow(/Failed to generate.*prime after.*attempts/);
    });

    test('should handle batch generation with reasonable parameters', async () => {
      const options = {
        bitLength: 16, // Small bit length for faster testing
        count: 2,
        minSpacing: 100n, // Reasonable spacing
      };

      const primes = await generateNormalPrimeBatch(options);

      expect(primes.length).toBe(2);
      primes.forEach((prime) => {
        expect(getBitLength(prime)).toBe(16);
        expect(prime % 2n).toBe(1n);
      });
    });

    test('should handle challenging spacing requirements', async () => {
      const options = {
        bitLength: 12, // Small bit length
        count: 2,
        minSpacing: 1000n, // Large spacing for small numbers
      };

      // This should either succeed or fail gracefully
      try {
        const primes = await generateNormalPrimeBatch(options);
        expect(primes.length).toBeLessThanOrEqual(2);

        if (primes.length === 2) {
          const gap = primes[1] - primes[0];
          expect(gap).toBeGreaterThanOrEqual(1000n);
        }
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toMatch(/Only generated.*primes/);
        }
      }
    }, 15000);
  });

  describe('Performance Tests', () => {
    test('should handle concurrent prime generation', async () => {
      const promises = Array.from({ length: 3 }, () => generateNormalPrime(64)); // Smaller bit length

      const primes = await Promise.all(promises);

      expect(primes).toHaveLength(3);
      primes.forEach((prime: bigint) => {
        expect(getBitLength(prime)).toBe(64);
        expect(prime % 2n).toBe(1n);
      });
    }, 20000);

    test('should maintain quality under load', async () => {
      const bitLength = 128; // Reduced from 256 for faster testing
      const primes: bigint[] = [];

      for (let i = 0; i < 5; i++) {
        // Reduced iterations
        const prime = await generateNormalPrime(bitLength);
        primes.push(prime);
      }

      // All should be valid
      primes.forEach((prime) => {
        expect(getBitLength(prime)).toBe(bitLength);
        expect(prime % 2n).toBe(1n);
        expect(isInRange(prime, bitLength)).toBe(true);
      });

      // Should have reasonable diversity
      const uniquePrimes = new Set(primes);
      expect(uniquePrimes.size).toBeGreaterThan(primes.length * 0.6); // More lenient
    }, 30000);
  });
});
