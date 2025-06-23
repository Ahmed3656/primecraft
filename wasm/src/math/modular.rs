#![allow(dead_code)]

use crate::constants::{ONE, ZERO};
use crate::helpers::is_power_of_two;
use num_bigint::BigUint;

/// Trait for modular arithmetic operations
pub trait ModularArithmetic {
    /// Modular exponentiation: (base^exp) mod modulus
    fn mod_pow(&self, exp: &BigUint, modulus: &BigUint) -> BigUint;

    /// Modular multiplication: (a * b) mod modulus
    fn mod_mul(&self, other: &BigUint, modulus: &BigUint) -> BigUint;

    /// Modular addition: (a + b) mod modulus  
    fn mod_add(&self, other: &BigUint, modulus: &BigUint) -> BigUint;

    /// Modular subtraction: (a - b) mod modulus
    fn mod_sub(&self, other: &BigUint, modulus: &BigUint) -> BigUint;

    /// Modular inverse using Extended Euclidean Algorithm
    fn mod_inverse(&self, modulus: &BigUint) -> Option<BigUint>;

    /// Check if number is quadratic residue modulo p
    fn is_quadratic_residue(&self, modulus: &BigUint) -> bool;
}

impl ModularArithmetic for BigUint {
    fn mod_pow(&self, exp: &BigUint, modulus: &BigUint) -> BigUint {
        self.modpow(exp, modulus)
    }

    fn mod_mul(&self, other: &BigUint, modulus: &BigUint) -> BigUint {
        (self * other) % modulus
    }

    fn mod_add(&self, other: &BigUint, modulus: &BigUint) -> BigUint {
        (self + other) % modulus
    }

    fn mod_sub(&self, other: &BigUint, modulus: &BigUint) -> BigUint {
        if self >= other {
            (self - other) % modulus
        } else {
            modulus - ((other - self) % modulus)
        }
    }

    fn mod_inverse(&self, modulus: &BigUint) -> Option<BigUint> {
        extended_gcd(self, modulus).1
    }

    fn is_quadratic_residue(&self, modulus: &BigUint) -> bool {
        if *self == *ZERO {
            return true;
        }

        if modulus <= &*ONE {
            return false;
        }

        if modulus % BigUint::from(2u32) == *ONE {
            let exp = (modulus - &*ONE) / BigUint::from(2u32);
            let result = self.mod_pow(&exp, modulus);
            result == *ONE
        } else {
            if is_power_of_two(modulus) {
                if modulus >= &BigUint::from(8u32) {
                    self % &BigUint::from(8u32) == *ONE
                } else {
                    self % modulus == *ONE || (*self == *ZERO && modulus > &*ONE)
                }
            } else {
                // For general even modulus, this is complex - return false for now
                false
            }
        }
    }
}

/// Extended Euclidean Algorithm
/// Returns (gcd(a, b), x) where ax ≡ gcd(a, b) (mod b)
/// If gcd(a, b) = 1, then x is the modular inverse of a mod b
pub fn extended_gcd(a: &BigUint, b: &BigUint) -> (BigUint, Option<BigUint>) {
    if *a == *ZERO {
        return (b.clone(), None);
    }

    if *b == *ZERO {
        return (a.clone(), Some((*ONE).clone()));
    }

    // Special case: modulus of 1 has no meaningful inverse
    if *b == *ONE {
        return ((*ONE).clone(), None);
    }

    let (mut old_r, mut r) = (a.clone(), b.clone());
    let (mut old_s, mut s) = (BigUint::from(1u32), BigUint::from(0u32));

    while r != *ZERO {
        let quotient = &old_r / &r;

        let temp = r.clone();
        r = &old_r - &quotient * &r;
        old_r = temp;

        let temp = s.clone();
        if &quotient * &s <= old_s {
            s = &old_s - &quotient * &s;
        } else {
            s = b - ((&quotient * &s - &old_s) % b);
        }
        old_s = temp;
    }

    let gcd = old_r;
    let inverse = if gcd == *ONE { Some(old_s % b) } else { None };

    (gcd, inverse)
}

#[cfg(test)]
mod tests {
    use super::*;
    use num_bigint::BigUint;
    use num_traits::FromPrimitive;

    #[test]
    fn test_mod_add() {
        let a = BigUint::from_u64(5).unwrap();
        let b = BigUint::from_u64(7).unwrap();
        let m = BigUint::from_u64(10).unwrap();
        assert_eq!(a.mod_add(&b, &m), BigUint::from(2u32));
    }

    #[test]
    fn test_mod_add_edge_cases() {
        let a = BigUint::from_u64(0).unwrap();
        let b = BigUint::from_u64(5).unwrap();
        let m = BigUint::from_u64(10).unwrap();
        assert_eq!(a.mod_add(&b, &m), BigUint::from(5u32));

        let a = BigUint::from_u64(999).unwrap();
        let b = BigUint::from_u64(1).unwrap();
        let m = BigUint::from_u64(1000).unwrap();
        assert_eq!(a.mod_add(&b, &m), BigUint::from(0u32));
    }

    #[test]
    fn test_mod_sub_positive() {
        let a = BigUint::from_u64(7).unwrap();
        let b = BigUint::from_u64(5).unwrap();
        let m = BigUint::from_u64(10).unwrap();
        assert_eq!(a.mod_sub(&b, &m), BigUint::from(2u32));
    }

    #[test]
    fn test_mod_sub_wrapping() {
        let a = BigUint::from_u64(5).unwrap();
        let b = BigUint::from_u64(7).unwrap();
        let m = BigUint::from_u64(10).unwrap();
        assert_eq!(a.mod_sub(&b, &m), BigUint::from(8u32)); // Because 5 - 7 = -2 mod 10 = 8
    }

    #[test]
    fn test_mod_sub_edge_cases() {
        let a = BigUint::from_u64(0).unwrap();
        let b = BigUint::from_u64(1).unwrap();
        let m = BigUint::from_u64(10).unwrap();
        assert_eq!(a.mod_sub(&b, &m), BigUint::from(9u32));

        let a = BigUint::from_u64(5).unwrap();
        let b = BigUint::from_u64(5).unwrap();
        let m = BigUint::from_u64(10).unwrap();
        assert_eq!(a.mod_sub(&b, &m), BigUint::from(0u32));
    }

    #[test]
    fn test_mod_mul() {
        let a = BigUint::from_u64(3).unwrap();
        let b = BigUint::from_u64(4).unwrap();
        let m = BigUint::from_u64(5).unwrap();
        assert_eq!(a.mod_mul(&b, &m), BigUint::from(2u32));
    }

    #[test]
    fn test_mod_mul_edge_cases() {
        let a = BigUint::from_u64(0).unwrap();
        let b = BigUint::from_u64(5).unwrap();
        let m = BigUint::from_u64(10).unwrap();
        assert_eq!(a.mod_mul(&b, &m), BigUint::from(0u32));

        let a = BigUint::from_u64(1).unwrap();
        let b = BigUint::from_u64(7).unwrap();
        let m = BigUint::from_u64(10).unwrap();
        assert_eq!(a.mod_mul(&b, &m), BigUint::from(7u32));
    }

    #[test]
    fn test_mod_pow() {
        let base = BigUint::from_u64(2).unwrap();
        let exp = BigUint::from_u64(3).unwrap();
        let m = BigUint::from_u64(5).unwrap();
        assert_eq!(base.mod_pow(&exp, &m), BigUint::from(3u32)); // 2^3 = 8, 8 % 5 = 3
    }

    #[test]
    fn test_mod_pow_edge_cases() {
        let base = BigUint::from_u64(5).unwrap();
        let exp = BigUint::from_u64(0).unwrap();
        let m = BigUint::from_u64(10).unwrap();
        assert_eq!(base.mod_pow(&exp, &m), BigUint::from(1u32)); // Any number to power 0 is 1

        let base = BigUint::from_u64(0).unwrap();
        let exp = BigUint::from_u64(5).unwrap();
        let m = BigUint::from_u64(10).unwrap();
        assert_eq!(base.mod_pow(&exp, &m), BigUint::from(0u32)); // 0 to any positive power is 0
    }

    #[test]
    fn test_mod_inverse_exists() {
        let a = BigUint::from_u64(3).unwrap();
        let m = BigUint::from_u64(11).unwrap();
        let inv = a.mod_inverse(&m).unwrap();
        assert_eq!(inv, BigUint::from(4u32));
        // Verify: 3 * 4 = 12 ≡ 1 (mod 11)
        assert_eq!(a.mod_mul(&inv, &m), BigUint::from(1u32));
    }

    #[test]
    fn test_mod_inverse_none() {
        let a = BigUint::from_u64(6).unwrap();
        let m = BigUint::from_u64(9).unwrap(); // gcd(6,9) = 3 ≠ 1
        assert_eq!(a.mod_inverse(&m), None);
    }

    #[test]
    fn test_mod_inverse_edge_cases() {
        let a = BigUint::from_u64(0).unwrap();
        let m = BigUint::from_u64(5).unwrap();
        assert_eq!(a.mod_inverse(&m), None); // 0 has no inverse

        let a = BigUint::from_u64(1).unwrap();
        let m = BigUint::from_u64(5).unwrap();
        assert_eq!(a.mod_inverse(&m), Some(BigUint::from(1u32))); // 1 is its own inverse

        let a = BigUint::from_u64(1).unwrap();
        let m = BigUint::from_u64(1).unwrap();
        assert_eq!(a.mod_inverse(&m), None); // No inverse when modulus is 1
    }

    #[test]
    fn test_is_quadratic_residue_odd_modulus() {
        let p = BigUint::from_u64(7).unwrap();

        // Test known quadratic residues mod 7: 0, 1, 2, 4
        assert!(BigUint::from(0u32).is_quadratic_residue(&p));
        assert!(BigUint::from(1u32).is_quadratic_residue(&p)); // 1² ≡ 1
        assert!(BigUint::from(2u32).is_quadratic_residue(&p)); // 3² ≡ 9 ≡ 2
        assert!(BigUint::from(4u32).is_quadratic_residue(&p)); // 2² ≡ 4

        // Test non-residues mod 7: 3, 5, 6
        assert!(!BigUint::from(3u32).is_quadratic_residue(&p));
        assert!(!BigUint::from(5u32).is_quadratic_residue(&p));
        assert!(!BigUint::from(6u32).is_quadratic_residue(&p));
    }

    #[test]
    fn test_is_quadratic_residue_even_modulus() {
        let m = BigUint::from_u64(8).unwrap();

        // For mod 8, only 0 and 1 are quadratic residues
        assert!(BigUint::from(0u32).is_quadratic_residue(&m));
        assert!(BigUint::from(1u32).is_quadratic_residue(&m));
        assert!(!BigUint::from(2u32).is_quadratic_residue(&m));
        assert!(!BigUint::from(3u32).is_quadratic_residue(&m));
    }

    #[test]
    fn test_extended_gcd_comprehensive() {
        let (gcd, inv) = extended_gcd(&BigUint::from(17u32), &BigUint::from(13u32));
        assert_eq!(gcd, BigUint::from(1u32));
        assert!(inv.is_some());

        let (gcd, inv) = extended_gcd(&BigUint::from(12u32), &BigUint::from(18u32));
        assert_eq!(gcd, BigUint::from(6u32));
        assert!(inv.is_none());

        let (gcd, inv) = extended_gcd(&BigUint::from(0u32), &BigUint::from(5u32));
        assert_eq!(gcd, BigUint::from(5u32));
        assert!(inv.is_none()); // 0 has no modular inverse
    }

    #[test]
    fn test_large_numbers() {
        let large_a = BigUint::parse_bytes(b"123456789012345678901234567890", 10).unwrap();
        let large_b = BigUint::parse_bytes(b"987654321098765432109876543210", 10).unwrap();
        let large_m = BigUint::parse_bytes(b"1000000007", 10).unwrap();

        // Just ensure these don't panic and produce valid results
        let result = large_a.mod_add(&large_b, &large_m);
        assert!(result < large_m);

        let result = large_a.mod_mul(&large_b, &large_m);
        assert!(result < large_m);
    }
}
