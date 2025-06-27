/**
 * Normalizes candidate to be in range [min, max] and odd.
 */
export function normalizeCandidate(candidate: bigint, min: bigint, max: bigint): bigint {
  if (candidate < min || candidate > max) {
    const range = max - min + 1n;
    candidate = min + (candidate % range);
  }

  candidate |= 1n;

  if (candidate > max) {
    candidate = max | 1n;
  }

  return candidate;
}
