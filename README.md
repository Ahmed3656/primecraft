Primecraft

Primecraft is a high-quality TypeScript library for generating strong cryptographic prime numbers. Designed with security and flexibility in mind, Primecraft makes it easy to dynamically generate large, random, and secure primes for cryptographic applications.

Features

- Strong, cryptographically safe prime generation
- Support for generating multiple primes that work well together
- Built-in randomness with safe alternators
- Clean, well-structured TypeScript codebase

Installation

npm install primecraft

Usage

import { generatePrime } from 'primecraft';

const prime = generatePrime(512); // Generates a 512-bit strong prime
console.log(prime);

Note: This library is still under development. API and functionality are subject to change until version 1.0.0.

Folder Structure

```plaintext
src/
├── config/
├── core/
├── generators/
├── utils/
└── index.ts
```

Contributing

Contributions are welcome! Please open issues or submit pull requests with improvements or suggestions.

License

MIT © 2025 Ahmed Amr
