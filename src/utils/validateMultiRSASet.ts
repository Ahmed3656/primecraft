import { gcd } from '@/utils';
import { MAX_ALLOWED_GCD } from '@/constants';

export function isWeakForMultiRSA(candidate: bigint, existingPrimes: bigint[]): boolean {
  for (const p of existingPrimes) {
    if (gcd(candidate - 1n, p - 1n) > MAX_ALLOWED_GCD) return true;
    if (candidate % p === 1n || p % candidate === 1n) return true;
  }
  return false;
}
