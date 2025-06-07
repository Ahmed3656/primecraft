import { getMRRounds } from '@/helpers';
import { getOptimalWitnesses } from '@/helpers/core/getOptimalWitnesses';
import { modExp } from '@/utils';

/**
 * Miller-Rabin primality test
 * Determines whether a given number is *probably* prime.
 */
export function isProbablyPrime(n: bigint, bitLength: number): boolean {
  if (n === 2n || n === 3n) return true;
  if (n < 2n || n % 2n === 0n) return false;

  let r = 0n;
  let d = n - 1n;
  while (d % 2n === 0n) {
    (d /= 2n), (r += 1n);
  }

  const k = getMRRounds(bitLength);
  const witnesses = getOptimalWitnesses(bitLength);

  for (const a of witnesses.slice(0, k)) {
    if (a >= n) continue;
    
    let x = modExp(a, d, n);
    if (x === 1n || x === n - 1n) continue;

    let continueLoop = false;
    for (let j = 0n; j < r - 1n; j++) {
      x = modExp(x, 2n, n);
      if (x === n - 1n) {
        continueLoop = true;
        break;
      }
    }

    if (!continueLoop) return false;
  }

  return true;
}
