#![allow(dead_code)]

/// Common RSA exponent (65537)
pub const COMMON_RSA_EXPONENT: u32 = 65537;

/// Miller-Rabin deterministic witnesses for small n
pub const MILLER_RABIN_WITNESSES: &[u32] = &[
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
];

/// Deterministic upper limit for witness coverage
pub const DETERMINISTIC_THRESHOLD: u64 = 341_550_071_728_321;
