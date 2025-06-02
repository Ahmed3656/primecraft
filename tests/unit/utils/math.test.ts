import { gcd, isWeakForMultiRSA } from '@/utils';

describe('Math Utilities', () => {
  test('gcd calculation', () => {
    expect(gcd(48n, 18n)).toBe(6n);
    expect(gcd(17n, 13n)).toBe(1n);
    expect(gcd(100n, 25n)).toBe(25n);
  });

  test('weak multi-RSA detection', () => {
    const existingPrimes = [17n, 19n];

    expect(isWeakForMultiRSA(23n, existingPrimes)).toBe(false);
  });
});
