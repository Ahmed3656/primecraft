import { EntropySource } from '@/entropy';

export type StrengthLevel = 'weak' | 'good' | 'strong' | 'exceptional';

export type Strategy =
  | 'rsa-multi'
  | 'shamir-secret'
  | 'distributed-key'
  | 'balanced-set'
  | 'twin-pairs'
  | 'sophie-germain-chain';

export type GenerationOptions = {
  bitLength: number;
  count?: number;
  minSpacing?: bigint;
  entropy?: EntropySource;
};

export type MultiPrimeOptions = {
  count: number;
  bitLength: number;
  strategy: Strategy;
  constraints?: {
    minGap?: bigint;
    maxGap?: bigint;
    productBounds?: { min: bigint; max: bigint };
    congruenceClass?: { modulus: bigint; remainder: bigint };
    avoidWeak?: boolean;
  };
  entropy?: EntropySource;
};

export type PrimeSet = {
  primes: bigint[];
  properties: {
    gaps: bigint[];
    product: bigint;
    bitLengths: number[];
    relationships: string[];
    strength: StrengthLevel;
  };
  metadata: {
    attempts: number;
    generationTime: number;
    strategy: string;
  };
};
