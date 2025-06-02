# Primecraft

Primecraft is a high-quality TypeScript library for generating strong cryptographic prime numbers. Designed with security and flexibility in mind, Primecraft makes it easy to dynamically generate large, random, and secure primes for cryptographic applications.

## Features

- Strong, cryptographically safe prime generation
- Support for generating multiple primes that work well together
- Built-in randomness with safe alternators
- Clean, well-structured TypeScript codebase

## Installation

```bash
npm install primecraft
```

## Usage

### Basic Prime Generation

```typescript
import { generateStrongPrimes } from 'primecraft';

// Generate a single 512-bit strong prime
const primes = generateStrongPrimes({
  bitLength: 512,
  count: 1
});
console.log(primes[0]);

// Generate multiple primes with spacing constraints
const multiplePrimes = generateStrongPrimes({
  bitLength: 256,
  count: 3,
  minSpacing: 1000n
});
console.log(multiplePrimes);
```

### Advanced Prime Set Generation

```typescript
import { generatePrimeSet } from 'primecraft';

// Generate primes for RSA multi-prime applications
const primeSet = generatePrimeSet({
  count: 4,
  bitLength: 512,
  strategy: 'rsa-multi',
  constraints: {
    minGap: 100n,
    avoidWeak: true
  }
});

console.log('Generated primes:', primeSet.primes);
console.log('Prime properties:', primeSet.properties);
console.log('Generation metadata:', primeSet.metadata);
```

### Available Strategies

The `generatePrimeSet` function supports multiple generation strategies:

- `'rsa-multi'` - For RSA multi-prime applications
<!-- - `'shamir-secret'` - For Shamir's secret sharing
- `'distributed-key'` - For distributed key generation
- `'balanced-set'` - For balanced prime sets
- `'twin-pairs'` - For twin prime generation
- `'sophie-germain-chain'` - For Sophie Germain prime chains -->

## API Reference

### `generateStrongPrimes(options: GenerationOptions): bigint[]`

Generates multiple strong primes with specified constraints.

**Options:**
- `bitLength: number` - Bit length of each prime
- `count?: number` - Number of primes to generate (default: 1)
- `minSpacing?: bigint` - Minimum spacing between primes
- `entropy?: EntropySource` - Custom entropy source

### `generatePrimeSet(options: MultiPrimeOptions): PrimeSet`

Generates cryptographically strong prime sets for advanced use cases.

**Returns:** A `PrimeSet` object containing:
- `primes: bigint[]` - The generated primes
- `properties` - Analysis of gaps, product, relationships, and strength
- `metadata` - Generation statistics and timing

## Note

This library is still under development. API and functionality are subject to change until version 1.0.0.

## Folder Structure

```plaintext
project-root/
├── src/
│   ├── config/
│   ├── constants/
│   ├── core/
│   ├── generators/
│   ├── helpers/
│   ├── utils/
│   └── index.ts
└── tests/
    └── unit/
```

<!-- ## Contributing

Contributions are welcome! Please open issues or submit pull requests with improvements or suggestions. -->

## License

MIT © 2025 Ahmed Amr