#![allow(dead_code)]

use num_bigint::BigUint;
use rand::RngCore;
use rand::rngs::OsRng;

/// Generates a cryptographically secure random BigUint of exact bit length.
pub fn generate_entropy(bits: u32) -> BigUint {
    if bits < 2 {
        panic!("Bit length must be at least 2");
    }

    let byte_len = ((bits + 7) / 8) as usize;
    let mut buffer = vec![0u8; byte_len];
    OsRng.fill_bytes(&mut buffer);

    let excess_bits = (8 * byte_len as u32) - bits;
    buffer[0] &= 0xff >> excess_bits;
    buffer[0] |= 1 << (7 - excess_bits);

    BigUint::from_bytes_be(&buffer)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_entropy_bit_length() {
        let n = generate_entropy(256);
        assert_eq!(n.bits(), 256);
    }

    #[test]
    #[should_panic(expected = "Bit length must be at least 2")]
    fn test_generate_entropy_too_small() {
        generate_entropy(1); // Should panic
    }
}
