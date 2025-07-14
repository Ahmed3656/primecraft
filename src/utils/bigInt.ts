export function absBigInt(x: bigint): bigint {
  return x < 0n ? -x : x;
}
