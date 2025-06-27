export const isPrime = (n: bigint): boolean => {
  if (n < 2n) return false;
  if (n === 2n) return true;
  if (n % 2n === 0n) return false;

  const sqrt = BigInt(Math.floor(Math.sqrt(Number(n))));
  for (let i = 3n; i <= sqrt; i += 2n) {
    if (n % i === 0n) return false;
  }
  return true;
};

export const getBitLength = (n: bigint): number => {
  return n.toString(2).length;
};

export const isInRange = (n: bigint, bitLength: number): boolean => {
  const min = 1n << BigInt(bitLength - 1);
  const max = (1n << BigInt(bitLength)) - 1n;
  return n >= min && n <= max;
};
