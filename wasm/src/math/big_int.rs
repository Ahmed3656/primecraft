#![allow(dead_code)]

use num_bigint::BigUint;

/// Extension trait for BigUint with additional cryptographic utilities
pub trait BigIntExt {
    /// Get the bit length of the number
    fn bit_length(&self) -> usize;

    /// Check if the number is even
    fn is_even(&self) -> bool;

    /// Check if the number is odd
    fn is_odd(&self) -> bool;

    /// Get the number of trailing zeros in binary representation
    fn trailing_zeros(&self) -> u32;

    /// Convert to a vector of u64 digits (little-endian)
    fn to_u64_digits(&self) -> Vec<u64>;

    /// Create from a vector of u64 digits (little-endian)
    fn from_u64_digits(digits: &[u64]) -> Self;

    /// Fast modular exponentiation
    fn mod_pow(&self, exp: &BigUint, modulus: &BigUint) -> BigUint;

    /// Get the Hamming weight (number of 1 bits)
    fn hamming_weight(&self) -> u32;
}

impl BigIntExt for BigUint {
    fn bit_length(&self) -> usize {
        self.bits() as usize
    }

    fn is_even(&self) -> bool {
        self.bit(0) == false
    }

    fn is_odd(&self) -> bool {
        !self.is_even()
    }

    fn trailing_zeros(&self) -> u32 {
        if *self == BigUint::from(0u32) {
            return 0;
        }

        let mut count = 0;
        let mut temp = self.clone();

        while temp.is_even() {
            temp /= BigUint::from(2u32);
            count += 1;
        }

        count
    }

    fn to_u64_digits(&self) -> Vec<u64> {
        self.to_u64_digits()
    }

    fn from_u64_digits(digits: &[u64]) -> BigUint {
        let bytes: Vec<u8> = digits.iter().flat_map(|d| d.to_le_bytes()).collect();
        BigUint::from_bytes_le(&bytes)
    }

    fn mod_pow(&self, exp: &BigUint, modulus: &BigUint) -> BigUint {
        self.modpow(exp, modulus)
    }

    fn hamming_weight(&self) -> u32 {
        let mut count = 0;
        let mut temp = self.clone();

        while temp > BigUint::from(0u32) {
            if temp.is_odd() {
                count += 1;
            }
            temp >>= 1;
        }

        count
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use num_bigint::BigUint;
    use num_traits::FromPrimitive;

    #[test]
    fn test_bit_length() {
        let n = BigUint::from_u64(1023).unwrap(); // 10 bits
        assert_eq!(n.bit_length(), 10);
    }

    #[test]
    fn test_even_odd() {
        let even = BigUint::from_u64(100).unwrap();
        let odd = BigUint::from_u64(101).unwrap();
        assert!(even.is_even());
        assert!(odd.is_odd());
    }

    #[test]
    fn test_trailing_zeros() {
        let n = BigUint::from_u32(40).unwrap(); // 101000 -> 3 trailing zeros
        assert_eq!(BigIntExt::trailing_zeros(&n), 3u32);
    }

    #[test]
    fn test_to_from_u64_digits() {
        let original = BigUint::from_u64(1234567890123456789).unwrap();
        let digits = original.to_u64_digits();
        let reconstructed = BigUint::from_u64_digits(&digits);
        assert_eq!(original, reconstructed);
    }

    #[test]
    fn test_mod_pow() {
        let base = BigUint::from_u64(4).unwrap();
        let exp = BigUint::from_u64(13).unwrap();
        let modulus = BigUint::from_u64(497).unwrap();
        assert_eq!(
            base.mod_pow(&exp, &modulus),
            BigUint::from_u64(445).unwrap()
        );
    }

    #[test]
    fn test_hamming_weight() {
        let n = BigUint::from_u64(0b101101).unwrap(); // 4 ones
        assert_eq!(n.hamming_weight(), 4);
    }
}
