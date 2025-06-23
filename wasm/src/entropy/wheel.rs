#![allow(dead_code)]

use crate::helpers::{infer_wheel_size, wheel_prime_factors};

/// Generate wheel residues for a given modulus
pub fn generate_wheel_residues(modulus: u32) -> Vec<u32> {
    let mut residues = Vec::new();

    for i in 1..modulus {
        if is_coprime_to_wheel_primes(i, modulus) {
            residues.push(i);
        }
    }

    residues
}

/// Check if a number is coprime to the wheel's prime factors
fn is_coprime_to_wheel_primes(n: u32, wheel_size: u32) -> bool {
    let primes = wheel_prime_factors(wheel_size);

    for prime in primes {
        if n % prime == 0 {
            return false;
        }
    }
    true
}

/// Wheel iterator for generating candidates
pub struct WheelIterator {
    base: u64,
    wheel: &'static [u32],
    index: usize,
    wheel_size: u64,
}

impl WheelIterator {
    pub fn new(start: u64, wheel: &'static [u32]) -> Self {
        let wheel_size = infer_wheel_size(wheel);

        let base = start - (start % wheel_size);
        let mut index = 0;

        // Find starting position in wheel
        for (i, &residue) in wheel.iter().enumerate() {
            if base + residue as u64 >= start {
                index = i;
                break;
            }
        }

        Self {
            base,
            wheel,
            index,
            wheel_size,
        }
    }
}

impl Iterator for WheelIterator {
    type Item = u64;

    fn next(&mut self) -> Option<Self::Item> {
        let result = self.base + self.wheel[self.index] as u64;

        self.index += 1;
        if self.index >= self.wheel.len() {
            self.index = 0;
            self.base += self.wheel_size;
        }

        Some(result)
    }
}

/// Calculate wheel efficiency (percentage of numbers that survive sieving)
pub fn wheel_efficiency(wheel: &[u32]) -> f64 {
    let wheel_size = infer_wheel_size(wheel) as f64;

    (wheel.len() as f64 / wheel_size) * 100.0
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::constants::{WHEEL_210, WHEEL_30};

    #[test]
    fn test_wheel_30_properties() {
        // All residues should be coprime to 30
        for &residue in WHEEL_30 {
            assert!(gcd_simple(residue, 30) == 1);
        }
    }

    #[test]
    fn test_wheel_iterator() {
        let iter = WheelIterator::new(100, &WHEEL_30);
        let first_few: Vec<u64> = iter.take(5).collect();

        for candidate in first_few {
            assert!(candidate >= 100);
            assert!(candidate % 2 != 0 || candidate == 2);
            assert!(candidate % 3 != 0 || candidate == 3);
            assert!(candidate % 5 != 0 || candidate == 5);
        }
    }

    #[test]
    fn test_optimal_wheel_selection() {
        assert_eq!(select_optimal_wheel(256).len(), 8); // WHEEL_30
        assert_eq!(select_optimal_wheel(1024).len(), 48); // WHEEL_210
    }

    // Simple GCD for testing
    fn gcd_simple(a: u32, b: u32) -> u32 {
        if b == 0 {
            a
        } else {
            gcd_simple(b, a % b)
        }
    }

    /// Optimized wheel selection based on bit length
    pub fn select_optimal_wheel(bit_length: u32) -> &'static [u32] {
        match bit_length {
            0..=512 => &WHEEL_30,
            513..=2048 => &WHEEL_210,
            _ => &WHEEL_30, // For very large numbers, simpler wheel may be better
        }
    }
}
