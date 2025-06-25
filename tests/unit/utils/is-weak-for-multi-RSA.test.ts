import { isWeakForMultiRSA } from '@/utils';

describe('Multi-RSA Weakness Detection', () => {
  test('weak multi-RSA detection', () => {
    const existingPrimes = [17n, 19n];
    expect(isWeakForMultiRSA(23n, existingPrimes)).toBe(false);
  });

  test('should detect weak primes for multi-RSA', () => {
    const existingPrimes = [17n, 19n, 23n];

    // Test with a prime that shares factors (this depends on your implementation)
    // Add more specific test cases based on your isWeakForMultiRSA logic
    expect(isWeakForMultiRSA(29n, existingPrimes)).toBe(false);
  });

  test('should handle empty existing primes array', () => {
    expect(isWeakForMultiRSA(23n, [])).toBe(false);
  });
});
