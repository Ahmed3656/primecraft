# Primecraft

Primecraft is a high-performance TypeScript library for generating cryptographically strong prime numbers. Built with security and flexibility in mind, Primecraft provides powerful prime generation capabilities for modern cryptographic applications including RSA key generation, distributed cryptography, and advanced mathematical computations.

## Features

- Strong, cryptographically safe prime generation
- Normal prime generation for general use cases
- Support for generating multiple primes that work well together
- Built-in randomness with safe alternators
- Clean, well-structured TypeScript codebase

## Installation

```bash
npm install primecraft
```

## Setup

To use Primecraft correctly in a TypeScript + ESM environment, make sure your project is configured as follows:

### 1. `tsconfig.json` settings:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2022",
    "moduleResolution": "Node",
    "esModuleInterop": true,
    "strict": true
  }
}
```

### 2. Add the following to your `package.json`:
```json
{
  "type": "module"
}
```

### 3. Building the project:
Use the TypeScript compiler to build with compatible flags:
```bash
tsc --target ES2020 --module ES2022 --moduleResolution Node your-entry.ts
```
Or if your `tsconfig.json` is already configured:
```bash
tsc
```

## Usage

### Basic Prime Generation

```typescript
import { generateNormalPrime, generateNormalPrimeBatch } from 'primecraft';

// Generate a single 512-bit normal prime
const prime = await generateNormalPrime(512);
console.log('Generated prime:', prime);

// Generate multiple normal primes with spacing constraints
const options = {
  bitLength: 256,
  count: 3,
  minSpacing: 1000n
};
const multiplePrimes = await generateNormalPrimeBatch(options);
console.log('Multiple primes:', multiplePrimes);
```

### Basic Strong Prime Generation

```typescript
import { generateStrongPrimes } from 'primecraft';

// Generate a single 256-bit strong prime
const primes = await generateStrongPrimes({
  bitLength: 256,
  count: 1
});
console.log('Generated prime:', primes[0]);

// Generate multiple primes with spacing constraints
const multiplePrimes = await generateStrongPrimes({
  bitLength: 256,
  count: 3,
  minSpacing: 1000n
});
console.log('Multiple primes:', multiplePrimes);
```

### RSA Prime Pair Generation

```typescript
import { generateRSAPrimePair } from 'primecraft';

// Generate a pair of primes suitable for RSA key generation
const { p, q } = await generateRSAPrimePair(2048);
console.log('RSA Prime P:', p);
console.log('RSA Prime Q:', q);

// Optional: Use your own custom entropy source
import { yourEntropySource } from './your-entropy'; // Must be of type EntropySource

const customEntropy: EntropySource = yourEntropySource;
const rsaPair = await generateRSAPrimePair(2048, customEntropy);
```

### Advanced Prime Set Generation

```typescript
import { generatePrimeSet, type MultiPrimeOptions } from 'primecraft';

// Generate primes for RSA multi-prime applications
const options: MultiPrimeOptions = {
  count: 4,
  bitLength: 512,
  strategy: 'rsa-multi',
  constraints: {
    minGap: 100n,
    maxGap: 10000n,
    avoidWeak: true,
    congruenceClass: {
      modulus: 12n,
      remainder: 5n
    }
  }
};

const primeSet = await generatePrimeSet(options);

console.log('Generated primes:', primeSet.primes);
console.log('Prime gaps:', primeSet.properties.gaps);
console.log('Generation time:', primeSet.metadata.generationTime);
console.log('Strength level:', primeSet.properties.strength);
```

### Available Strategies

<!-- The `generatePrimeSet` function supports multiple generation strategies: -->

The `generatePrimeSet` function currently only supports:

- `'rsa-multi'` - For RSA multi-prime applications
<!-- - `'shamir-secret'` - For Shamir's secret sharing
- `'distributed-key'` - For distributed key generation
- `'balanced-set'` - For balanced prime sets
- `'twin-pairs'` - For twin prime generation
- `'sophie-germain-chain'` - For Sophie Germain prime chains -->

## API Reference

### `generateNormalPrime(bitLength: number, entropy?: EntropySource, maxAttempts?: number): Promise<bigint>`

Generates a single random probable prime of the specified bit length.

**Parameters:**

- `bitLength: number` - Bit length of the prime to generate
- `entropy?: EntropySource` - Custom entropy source
- `maxAttempts?: number` - Maximum generation attempts (defaults to calculated value)

**Returns:** Promise resolving to a prime number

### `generateNormalPrimeBatch(options: GenerationOptions): Promise<bigint[]>`

Generates a batch of unique probable primes with optional spacing constraints.

**Options:**

- `bitLength: number` - Bit length of each prime
- `count?: number` - Number of primes to generate (default: 1)
- `minSpacing?: bigint` - Minimum spacing between primes (default: 1000n)
- `entropy?: EntropySource` - Custom entropy source

**Returns:** Promise resolving to an array of sorted prime numbers

### `generateStrongPrimes(options: GenerationOptions): Promise<bigint[]>`

Generates multiple strong primes with specified constraints.

**Options:**

- `bitLength: number` - Bit length of each prime
- `count?: number` - Number of primes to generate (default: 1)
- `minSpacing?: bigint` - Minimum spacing between primes
- `entropy?: EntropySource` - Custom entropy source

**Returns:** Promise resolving to an array of sorted prime numbers

### `generateRSAPrimePair(bitLength: number, entropy?: EntropySource): Promise<{p: bigint, q: bigint}>`

Generates a pair of primes specifically optimized for RSA key generation with proper mathematical validation.

**Parameters:**

- `bitLength: number` - Bit length for each prime in teh pair
- `entropy?: EntropySource` - Custom entropy source

**Returns:** Promise resolving to an object containing two primes `p` and `q`

### `generatePrimeSet(options: MultiPrimeOptions): Promise<PrimeSet>`

Generates cryptographically strong prime sets for advanced cryptographic applications with comprehensive analysis.

**Parameters:**

- `count`: `number` - Number of primes to generate
- `bitLength`: `number` - Bit length of each prime
- `strategy`: `Strategy` - Generation strategy (currently supports 'rsa-multi')
- `constraints?`: `object` - Optional constraints object with:
  - `minGap?`: `bigint` - Minimum gap between primes
  - `maxGap?`: `bigint` - Maximum gap between primes
  - `productBounds?`: `{min: bigint, max: bigint}` - Bounds for prime product
  - `congruenceClass?`: `{modulus: bigint, remainder: bigint}` - Congruence constraints
  - `avoidWeak?`: `boolean` - Avoid mathematically weak primes
- `entropy?`: `EntropySource` - Custom entropy source

**Returns:** Promise resolving to a PrimeSet object containing:

- `primes: bigint[]` - The generated primes
- `properties` - Analysis of gaps, product, relationships, and strength
- `metadata` - Generation statistics and timing

## Performance

Primecraft is designed for high performance with:

- **Multi-threaded Generation:** Utilizes all available CPU cores
- **Optimized Algorithms:** Advanced prime generation and testing algorithms
- **Smart Filtering:** Efficient candidate filtering to reduce computation
- **Parallel Validation:** Concurrent prime validation for faster results

## Security Considerations

- All primes generated meet cryptographic strength requirements
- Built-in protection against weak prime generation
- Configurable entropy sources for enhanced randomness
- Mathematical validation ensures prime suitability for intended use cases

## Note

This library is still under development. API and functionality are subject to change until version 1.0.0.

## Folder Structure

```plaintext
project-root/
├── src/
│   ├── constants/
│   ├── core/
│   ├── generators/
│   │   └── strategies/
│   ├── entropy/
│   ├── helpers/
│   ├── logger/
│   ├── types/
│   ├── utils/
│   └── index.ts
└── tests/
    ├── integration/
    ├── performance/
    └── unit/
        ├── core/
        ├── strategies/
        └── utils/
```

<!-- ## Contributing

Contributions are welcome! Please open issues or submit pull requests with improvements or suggestions. -->

## License

MIT © 2025 Ahmed Amr
