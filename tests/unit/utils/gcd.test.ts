import { gcd } from '@/utils';

describe('GCD Tests', () => {
  test('gcd calculation', () => {
    expect(gcd(48n, 18n)).toBe(6n);
    expect(gcd(17n, 13n)).toBe(1n);
    expect(gcd(100n, 25n)).toBe(25n);
  });

  test('gcd edge cases', () => {
    expect(gcd(0n, 5n)).toBe(5n);
    expect(gcd(5n, 0n)).toBe(5n);
    expect(gcd(0n, 0n)).toBe(0n);
    expect(gcd(1n, 1n)).toBe(1n);
  });

  test('gcd with large numbers', () => {
    const a = 123456789012345678901234567890n;
    const b = 987654321098765432109876543210n;
    const result = gcd(a, b);
    expect(result).toBeGreaterThan(0n);
    expect(a % result).toBe(0n);
    expect(b % result).toBe(0n);
  });
});
