import { COMMON_RSA_EXPONENT } from '@/constants';
import { modExp } from '@/utils';

describe('modExp', () => {
  describe('Edge Cases', () => {
    test('should return 0 when modulus is 1', () => {
      expect(modExp(5n, 3n, 1n)).toBe(0n);
      expect(modExp(999n, 1000n, 1n)).toBe(0n);
    });

    test('should return 1 when exponent is 0', () => {
      expect(modExp(0n, 0n, 5n)).toBe(1n);
      expect(modExp(3n, 0n, 7n)).toBe(1n);
      expect(modExp(999n, 0n, 1000n)).toBe(1n);
    });

    test('should return base % modulus when exponent is 1', () => {
      expect(modExp(5n, 1n, 3n)).toBe(2n);
      expect(modExp(7n, 1n, 7n)).toBe(0n);
      expect(modExp(123n, 1n, 100n)).toBe(23n);
    });

    test('should return 0 when base is 0 and exponent > 0', () => {
      expect(modExp(0n, 5n, 7n)).toBe(0n);
      expect(modExp(0n, 1000n, 13n)).toBe(0n);
    });

    test('should return 1 when base is 1', () => {
      expect(modExp(1n, 5n, 7n)).toBe(1n);
      expect(modExp(1n, 1000n, 13n)).toBe(1n);
    });
  });

  describe('Small Numbers', () => {
    test('should compute basic modular exponentiation', () => {
      // 2^3 mod 5 = 8 mod 5 = 3
      expect(modExp(2n, 3n, 5n)).toBe(3n);

      // 3^4 mod 7 = 81 mod 7 = 4
      expect(modExp(3n, 4n, 7n)).toBe(4n);

      // 5^2 mod 6 = 25 mod 6 = 1
      expect(modExp(5n, 2n, 6n)).toBe(1n);
    });

    test('should handle larger small numbers', () => {
      // 7^10 mod 13 = 282475249 mod 13 = 4
      expect(modExp(7n, 10n, 13n)).toBe(4n);

      // 12^34 mod 56 = ... = 16
      expect(modExp(12n, 34n, 56n)).toBe(16n);
    });
  });

  describe('Medium Numbers', () => {
    test('should handle medium-sized computations', () => {
      expect(modExp(123n, 456n, 789n)).toBe(699n);
      expect(modExp(1234n, 5678n, 9012n)).toBe(3652n);
    });

    test('should handle powers with medium modulus', () => {
      expect(modExp(2n, 100n, 1000007n)).toBe(698635n);

      // 3^200 mod 1000003
      expect(modExp(3n, 200n, 1000003n)).toBe(333986n);
    });
  });

  describe('Large Numbers (Cryptographic Sizes)', () => {
    test('should handle 128-bit numbers', () => {
      const base = BigInt('0x123456789abcdef0123456789abcdef0');
      const exp = BigInt('0x987654321fedcba0987654321fedcba0');
      const mod = BigInt('0xfedcba0987654321fedcba0987654321');

      // This should not throw and should return a valid result
      const result = modExp(base, exp, mod);
      expect(result).toBeGreaterThanOrEqual(0n);
      expect(result).toBeLessThan(mod);
    });

    test('should handle 256-bit numbers', () => {
      const base = BigInt('0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0');
      const exp = COMMON_RSA_EXPONENT;
      const mod = BigInt('0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321');

      const result = modExp(base, exp, mod);
      expect(result).toBeGreaterThanOrEqual(0n);
      expect(result).toBeLessThan(mod);
    });

    test('should handle RSA-like operations', () => {
      // Simulate RSA with small primes for testing
      const p = 61n;
      const q = 53n;
      const n = p * q; // 3233
      const e = 17n; // Public exponent

      // Find private exponent d such that e * d ≡ 1 (mod phi)
      // For this example, d = 2753
      const d = 2753n;

      const message = 123n;

      // Encrypt: c = m^e mod n
      const ciphertext = modExp(message, e, n);

      // Decrypt: m = c^d mod n
      const decrypted = modExp(ciphertext, d, n);

      expect(decrypted).toBe(message);
    });
  });

  describe('Known Test Vectors', () => {
    test("should match Fermat's Little Theorem", () => {
      // For prime p and a not divisible by p: a^(p-1) ≡ 1 (mod p)
      const p = 97n; // Prime
      const a = 5n;

      expect(modExp(a, p - 1n, p)).toBe(1n);
      expect(modExp(7n, p - 1n, p)).toBe(1n);
      expect(modExp(13n, p - 1n, p)).toBe(1n);
    });

    test('should handle Carmichael numbers correctly', () => {
      // 561 = 3 × 11 × 17 is the smallest Carmichael number
      const carmichael = 561n;
      const base = 2n;

      // 2^560 mod 561 should equal 1 (Carmichael property)
      expect(modExp(base, carmichael - 1n, carmichael)).toBe(1n);
    });

    test('should compute specific known values', () => {
      expect(modExp(2n, 1000n, 1000003n)).toBe(510646n);
      expect(modExp(3n, 1000n, 1000003n)).toBe(73216n);
      expect(modExp(10n, 100n, 97n)).toBe(9n);
    });
  });

  describe('Performance and Consistency', () => {
    test('should handle very large exponents efficiently', () => {
      const base = 2n;
      const largeExp = 2n ** 50n; // Very large exponent
      const mod = 1000000007n;

      const start = Date.now();
      const result = modExp(base, largeExp, mod);
      const end = Date.now();

      expect(result).toBeGreaterThanOrEqual(0n);
      expect(result).toBeLessThan(mod);
      expect(end - start).toBeLessThan(10); // Should complete within 10ms
    });

    test('should be consistent across multiple runs', () => {
      const base = 123456789n;
      const exp = 987654321n;
      const mod = 1000000007n;

      const result1 = modExp(base, exp, mod);
      const result2 = modExp(base, exp, mod);
      const result3 = modExp(base, exp, mod);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });
});
