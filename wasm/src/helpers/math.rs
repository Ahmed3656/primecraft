use crate::constants::{ONE, ZERO};
use num_bigint::BigUint;

/// Checks if a number is a power of 2
pub fn is_power_of_two(n: &BigUint) -> bool {
    if n <= &*ONE {
        return false;
    }
    (n & (n - &*ONE)) == *ZERO
}
