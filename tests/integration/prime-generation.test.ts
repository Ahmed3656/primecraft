import { isStrongPrime, areValidRSAPrimes } from '@/core';
import { defaultEntropy } from '@/entropy';
import {
  generatePrimeSet,
  generateStrongPrimes,
  generateRSAPrimePair,
  generateRSAMultiPrimes,
} from '@/generators';
import { MultiPrimeOptions } from '@/types';
import { getMinRSAGap } from '@/helpers';
import { COMMON_RSA_EXPONENT, WHEEL_30 } from '@/constants';
import { gcd } from '@/utils';

describe('Prime Generation - Comprehensive Tests', () => {
  describe('Strong Prime Generation', () => {
    test('generates primes with exact bit length requirements', async () => {
      const testCases = [8, 16, 32, 64, 128, 256];

      for (const bitLength of testCases) {
        const primes = await generateStrongPrimes({
          bitLength,
          count: 1,
          entropy: defaultEntropy,
        });

        const prime = primes[0];
        const minValue = 1n << BigInt(bitLength - 1);
        const maxValue = (1n << BigInt(bitLength)) - 1n;

        expect(prime).toBeGreaterThanOrEqual(minValue);
        expect(prime).toBeLessThanOrEqual(maxValue);

        // Verify actual bit length
        const actualBitLength = prime.toString(2).length;
        expect(actualBitLength).toBe(bitLength);
      }
    });

    test('enforces minimum spacing constraints', async () => {
      const spacingTests = [10n, 100n, 1000n, 10000n];

      for (const minSpacing of spacingTests) {
        const primes = await generateStrongPrimes({
          bitLength: 128,
          count: 5,
          minSpacing,
          entropy: defaultEntropy,
        });

        // Sort primes to check gaps
        const sortedPrimes = primes.sort((a, b) => (a < b ? -1 : 1));

        for (let i = 1; i < sortedPrimes.length; i++) {
          const gap = sortedPrimes[i] - sortedPrimes[i - 1];
          expect(gap).toBeGreaterThanOrEqual(minSpacing);
        }
      }
    });

    test('generates cryptographically strong primes', async () => {
      const primes = await generateStrongPrimes({
        bitLength: 256,
        count: 3,
        entropy: defaultEntropy,
      });

      primes.forEach((prime) => {
        // Must be strong
        expect(isStrongPrime(prime, 256)).toBe(true);

        // Must be odd
        expect(prime % 2n).toBe(1n);

        // Must not be divisible by small primes (wheel should handle this)
        const smallPrimes = WHEEL_30;
        smallPrimes.forEach((p) => {
          expect(prime % p).not.toBe(0n);
        });
      });
    });

    test('handles edge case bit lengths', async () => {
      // Very small
      const small = await generateStrongPrimes({
        bitLength: 4,
        count: 1,
        entropy: defaultEntropy,
      });
      expect(small[0]).toBeGreaterThanOrEqual(8n); // 2^3
      expect(small[0]).toBeLessThan(16n); // 2^4

      // Large bit length
      const large = await generateStrongPrimes({
        bitLength: 512,
        count: 1,
        entropy: defaultEntropy,
      });
      const actualBits = large[0].toString(2).length;
      expect(actualBits).toBe(512);
    });

    test('maintains quality under stress (multiple runs)', async () => {
      const results = await Promise.all(
        Array(10)
          .fill(null)
          .map(() =>
            generateStrongPrimes({
              bitLength: 64,
              count: 2,
              minSpacing: 1000n,
              entropy: defaultEntropy,
            })
          )
      );

      const allPrimes = results.flat();
      const uniquePrimes = new Set(allPrimes.map((p) => p.toString()));

      // All primes should be unique
      expect(uniquePrimes.size).toBe(allPrimes.length);

      // All should be strong
      allPrimes.forEach((prime) => {
        expect(isStrongPrime(prime, 64)).toBe(true);
      });
    });
  });

  describe('RSA Prime Pair Generation', () => {
    test('generates valid RSA prime pairs', async () => {
      const bitLengths = [128, 256, 512];

      for (const bitLength of bitLengths) {
        const { p, q } = await generateRSAPrimePair(bitLength, defaultEntropy);

        // Both should be strong primes
        expect(isStrongPrime(p, bitLength)).toBe(true);
        expect(isStrongPrime(q, bitLength)).toBe(true);

        // Should be valid for RSA
        expect(areValidRSAPrimes(p, q, bitLength)).toBe(true);

        // Should be different
        expect(p).not.toBe(q);

        // Check bit lengths
        expect(p.toString(2).length).toBe(bitLength);
        expect(q.toString(2).length).toBe(bitLength);

        const commonFactor = gcd(p - 1n, q - 1n);
        expect(commonFactor).toBeLessThan(COMMON_RSA_EXPONENT);
      }
    });

    test('RSA pairs have good cryptographic distance', async () => {
      const pairs = await Promise.all(
        Array(5)
          .fill(null)
          .map(() => generateRSAPrimePair(256, defaultEntropy))
      );

      pairs.forEach(({ p, q }) => {
        // p and q shouldn't be too close
        const ratio = p > q ? p / q : q / p;
        expect(ratio).toBeGreaterThan(1n); // Basic sanity

        // Check they're not suspiciously close (weak key indicator)
        const diff = p > q ? p - q : q - p;
        const minDiff = 1n << 100n; // Reasonable minimum difference
        expect(diff).toBeGreaterThan(minDiff);
      });
    });
  });

  describe('Multi-Prime RSA Generation', () => {
    const createMultiOptions = (count: number, bitLength: number): MultiPrimeOptions => ({
      count,
      bitLength,
      strategy: 'rsa-multi',
      constraints: {
        minGap: getMinRSAGap(bitLength, count),
        avoidWeak: true,
      },
    });

    test('generates correct number of primes with proper gaps', async () => {
      const testCases = [
        { count: 3, bitLength: 384 },
        { count: 4, bitLength: 512 },
        { count: 5, bitLength: 640 },
      ];

      for (const { count, bitLength } of testCases) {
        const options = createMultiOptions(count, bitLength);
        const result = await generateRSAMultiPrimes(options, 0);

        expect(result.primes).toHaveLength(count);
        expect(result.metadata.strategy).toBe('rsa-multi');

        // Check gap constraints
        const minGap = options.constraints!.minGap!;
        const primes = result.primes;

        for (let i = 0; i < primes.length; i++) {
          for (let j = i + 1; j < primes.length; j++) {
            const gap = primes[i] > primes[j] ? primes[i] - primes[j] : primes[j] - primes[i];
            expect(gap).toBeGreaterThanOrEqual(minGap);
          }
        }
      }
    });

    test('multi-prime product has correct bit length distribution', async () => {
      const options = createMultiOptions(3, 1056); // 3 * 352-bit primes
      const result = await generateRSAMultiPrimes(options, 0);

      // Each prime should be roughly bitLength/count bits
      const targetBitLength = Math.floor(1056 / 3);
      const tolerance = 2; // Allow ±2 bits

      result.primes.forEach((prime) => {
        const actualBits = prime.toString(2).length;
        expect(actualBits).toBeGreaterThanOrEqual(targetBitLength - tolerance);
        expect(actualBits).toBeLessThanOrEqual(targetBitLength + tolerance);
      });

      // Product should be close to target bit length
      const productBits = result.properties.product.toString(2).length;
      expect(productBits).toBeGreaterThanOrEqual(1056 - 5);
      expect(productBits).toBeLessThanOrEqual(1056 + 5);
    });

    test('avoids weak prime combinations', async () => {
      const options = createMultiOptions(4, 512);
      const result = await generateRSAMultiPrimes(options, 0);
      const primes = result.primes;

      // Check for common weak patterns
      primes.forEach((prime, i) => {
        // Not too small
        expect(prime).toBeGreaterThan(1n << 126n);

        // Not forming obvious patterns with other primes
        primes.forEach((otherPrime, j) => {
          if (i !== j) {
            // Avoid primes that are too similar
            const ratio = prime > otherPrime ? prime / otherPrime : otherPrime / prime;
            expect(ratio).toBeGreaterThan(1n);

            // Check they don't share obvious factors
            const gcd = (a: bigint, b: bigint): bigint => {
              while (b !== 0n) {
                [a, b] = [b, a % b];
              }
              return a;
            };
            expect(gcd(prime - 1n, otherPrime - 1n)).toBeLessThan(prime / 1000n);
          }
        });
      });
    });

    test('performance and metadata tracking', async () => {
      const startTime = Date.now();
      const options = createMultiOptions(3, 384);
      const result = await generateRSAMultiPrimes(options, 0);
      const endTime = Date.now();

      // Should complete in reasonable time (less than 30 seconds)
      expect(endTime - startTime).toBeLessThan(30000);

      // Metadata should be populated
      expect(result.metadata.attempts).toBeGreaterThan(0);
      expect(result.metadata.generationTime).toBeGreaterThan(0);
      expect(result.metadata.generationTime).toBeLessThan(endTime - startTime + 100);

      // Properties should be calculated
      expect(result.properties.gaps).toHaveLength(result.primes.length - 1);
      expect(result.properties.bitLengths).toHaveLength(result.primes.length);
      expect(result.properties.product).toBeGreaterThan(0n);
      expect(['weak', 'good', 'strong', 'exceptional']).toContain(result.properties.strength);
    });
  });

  describe('Unified Prime Set Generation', () => {
    test('handles RSA multi-prime strategy correctly', async () => {
      const result = await generatePrimeSet({
        count: 3,
        bitLength: 384,
        strategy: 'rsa-multi',
        constraints: {
          minGap: 1000n,
          avoidWeak: true,
        },
      });

      expect(result.primes).toHaveLength(3);
      expect(result.metadata.strategy).toBe('rsa-multi');

      // Should have same quality as direct call
      result.primes.forEach((prime) => {
        expect(isStrongPrime(prime, 128)).toBe(true);
      });
    });

    test('throws error for unknown strategy', async () => {
      await expect(
        generatePrimeSet({
          count: 2,
          bitLength: 256,
          strategy: 'unknown-strategy' as any,
        })
      ).rejects.toThrow('Unknown strategy: unknown-strategy');
    });
  });

  describe('Stress Tests and Edge Cases', () => {
    test('handles concurrent generation without collision', async () => {
      const promises = Array(20)
        .fill(null)
        .map(() =>
          generateStrongPrimes({
            bitLength: 64,
            count: 2,
            entropy: defaultEntropy,
          })
        );

      const results = await Promise.all(promises);
      const allPrimes = results.flat();
      const uniquePrimes = new Set(allPrimes.map((p) => p.toString()));

      // Should have very high uniqueness (allow for tiny collision chance)
      expect(uniquePrimes.size).toBeGreaterThan(allPrimes.length * 0.95);
    });

    test('maintains quality under memory pressure', async () => {
      // Generate many primes to stress memory
      const largeBatch = await generateStrongPrimes({
        bitLength: 32,
        count: 100,
        minSpacing: 10n,
        entropy: defaultEntropy,
      });

      expect(largeBatch).toHaveLength(100);

      // Spot check quality
      const sampleIndices = [0, 25, 50, 75, 99];
      sampleIndices.forEach((i) => {
        expect(isStrongPrime(largeBatch[i], 32)).toBe(true);
      });
    });

    test('handles minimum viable bit lengths', async () => {
      // Test absolute minimum (should still work)
      const tiny = await generateStrongPrimes({
        bitLength: 3,
        count: 1,
        entropy: defaultEntropy,
      });

      expect(tiny[0]).toBeGreaterThanOrEqual(4n); // 2^2
      expect(tiny[0]).toBeLessThan(8n); // 2^3
      expect(tiny[0] % 2n).toBe(1n); // Must be odd
    });
  });
});

describe('Error Handling and Robustness', () => {
  test('fails gracefully on impossible constraints', async () => {
    // Impossible spacing for bit length
    await expect(
      generateStrongPrimes({
        bitLength: 8,
        count: 10,
        minSpacing: 1000n, // Too large for 8-bit space
        entropy: defaultEntropy,
      })
    ).rejects.toThrow();
  });

  test('handles entropy source failures gracefully', async () => {
    const faultyEntropy = () => {
      throw new Error('Entropy failure');
    };

    await expect(
      generateStrongPrimes({
        bitLength: 64,
        count: 1,
        entropy: faultyEntropy,
      })
    ).rejects.toThrow();
  });

  test('validates input parameters', async () => {
    // Negative bit length
    await expect(
      generateStrongPrimes({
        bitLength: -1,
        count: 1,
        entropy: defaultEntropy,
      })
    ).rejects.toThrow();

    // Zero count
    await expect(
      generateStrongPrimes({
        bitLength: 64,
        count: 0,
        entropy: defaultEntropy,
      })
    ).rejects.toThrow();
  });
});
