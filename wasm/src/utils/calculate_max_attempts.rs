#![allow(dead_code)]

/// Calculates the maximum number of allowed attempts to generate a strong prime,
/// dynamically scaling based on the requested bit length.
pub fn calculate_max_attempts(bit_length: u32) -> u32 {
    let power = (bit_length as f64).powf(1.4);
    (100.0 * power).floor() as u32
}
