use crate::types::PrimeProperties;
use num_bigint::BigUint;

/// Calculate properties of a prime set
pub fn calculate_prime_properties(primes: &[BigUint], strategy: &str) -> PrimeProperties {
    let mut gaps = Vec::new();
    let mut bit_lengths = Vec::new();
    let mut product = BigUint::from(1u32);
    let mut relationships = Vec::new();

    // Calculate basic properties
    for i in 0..primes.len() {
        bit_lengths.push(primes[i].bits() as u32);
        product *= &primes[i];

        // Calculate gaps between consecutive primes
        if i > 0 {
            let gap = if primes[i] > primes[i - 1] {
                &primes[i] - &primes[i - 1]
            } else {
                &primes[i - 1] - &primes[i]
            };
            gaps.push(gap.to_string());
        }
    }

    // Determine relationships based on strategy
    match strategy {
        "rsa-multi" => {
            relationships.push("rsa-suitable".to_string());
            if primes.len() > 2 {
                relationships.push("multi-prime".to_string());
            }
        }
        "strong" => {
            relationships.push("strong-prime".to_string());
            relationships.push("safe-prime".to_string());
        }
        _ => {}
    }

    // Determine strength based on bit lengths
    let total_bits: u64 = bit_lengths.iter().map(|&b| b as u64).sum();
    let strength = match total_bits {
        0..=1023 => "weak",
        1024..=2047 => "legacy",
        2048..=3071 => "standard",
        3072..=4095 => "strong",
        _ => "ultra-strong",
    };

    PrimeProperties {
        gaps,
        product: product.to_string(),
        bit_lengths,
        relationships,
        strength: strength.to_string(),
    }
}
