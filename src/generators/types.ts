import { EntropySource } from '@/config';

export type GenerationOptions = {
  bitLength: number;
  count?: number;
  strategy?: 'strong' | 'safe' | 'balanced';
  minSpacing?: bigint;
  entropy?: EntropySource;
};

export type MultiPrimeOptions = {
  count: number;
  bitLength: number;
  strategy:
    | 'rsa-multi'
    | 'shamir-secret'
    | 'distributed-key'
    | 'balanced-set'
    | 'twin-pairs'
    | 'sophie-germain-chain';
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
    strength: 'weak' | 'good' | 'strong' | 'exceptional';
  };
  metadata: {
    attempts: number;
    generationTime: number;
    strategy: string;
  };
};
