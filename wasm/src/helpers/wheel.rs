use crate::constants::{WHEEL_210, WHEEL_30};

/// Infers the size of a wheel based on its reference
pub fn infer_wheel_size(wheel: &[u32]) -> u64 {
    if std::ptr::eq(wheel, WHEEL_30) {
        30
    } else if std::ptr::eq(wheel, WHEEL_210) {
        210
    } else {
        30 // Default
    }
}

/// Returns the prime factors used to construct a given wheel size
pub fn wheel_prime_factors(wheel_size: u32) -> &'static [u32] {
    match wheel_size {
        30 => &[2, 3, 5],
        210 => &[2, 3, 5, 7],
        _ => &[],
    }
}
