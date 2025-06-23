#![allow(dead_code)]

use crate::constants::{ONE, ZERO};
use num_bigint::BigUint;

/// Compute GCD using binary GCD algorithm (Stein's algorithm)
/// More efficient for very large numbers
pub fn gcd(a: &BigUint, b: &BigUint) -> BigUint {
    if a == &*ZERO {
        return b.clone();
    }
    if b == &*ZERO {
        return a.clone();
    }

    let mut u = a.clone();
    let mut v = b.clone();
    let mut shift = 0u32;

    while (&u & &*ONE) == *ZERO && (&v & &*ONE) == *ZERO {
        u >>= 1;
        v >>= 1;
        shift += 1;
    }

    while (&u & &*ONE) == *ZERO {
        u >>= 1;
    }

    loop {
        while (&v & &*ONE) == *ZERO {
            v >>= 1;
        }

        if u < v {
            std::mem::swap(&mut u, &mut v);
        }

        u -= &v;

        if u == *ZERO {
            break;
        }
    }

    v << shift
}

/// Least Common Multiple
pub fn lcm(a: &BigUint, b: &BigUint) -> BigUint {
    if a == &*ZERO || b == &*ZERO {
        return (*ZERO).clone();
    }

    let gcd_val = gcd(a, b);
    let b_div_gcd = b / &gcd_val;
    a * b_div_gcd
}

/// Check if two numbers are coprime
pub fn are_coprime(a: &BigUint, b: &BigUint) -> bool {
    gcd(a, b) == *ONE
}

#[cfg(test)]
mod tests {
    use std::time::Instant;

    use super::*;
    use num_traits::FromPrimitive;

    #[test]
    fn test_gcd_basic() {
        let a = BigUint::from_u64(48).unwrap();
        let b = BigUint::from_u64(18).unwrap();
        assert_eq!(gcd(&a, &b), BigUint::from_u64(6).unwrap());
    }

    #[test]
    fn test_gcd_large() {
        let a = BigUint::from_u64(123456789101112).unwrap();
        let b = BigUint::from_u64(1314151617181920).unwrap();
        assert_eq!(gcd(&a, &b), BigUint::from_u64(24).unwrap());

        assert_eq!(gcd(&a, &b), gcd(&a, &b));
    }

    #[test]
    fn test_gcd_edge_cases() {
        let zero = BigUint::from_u64(0).unwrap();
        let x = BigUint::from_u64(987654321).unwrap();

        // GCD with zero
        assert_eq!(gcd(&zero, &x), x);
        assert_eq!(gcd(&x, &zero), x);

        // GCD with self
        assert_eq!(gcd(&x, &x), x);

        // Coprime numbers
        let prime1 = BigUint::from_u64(17).unwrap();
        let prime2 = BigUint::from_u64(19).unwrap();
        assert_eq!(gcd(&prime1, &prime2), BigUint::from_u64(1).unwrap());
    }

    #[test]
    fn test_lcm() {
        // Basic LCM tests
        assert_eq!(
            lcm(&BigUint::from(12u32), &BigUint::from(18u32)),
            BigUint::from(36u32)
        );
        assert_eq!(
            lcm(&BigUint::from(17u32), &BigUint::from(13u32)),
            BigUint::from(221u32)
        );

        // LCM with zero
        assert_eq!(
            lcm(&BigUint::from(0u32), &BigUint::from(5u32)),
            BigUint::from(0u32)
        );
        assert_eq!(
            lcm(&BigUint::from(7u32), &BigUint::from(0u32)),
            BigUint::from(0u32)
        );
        assert_eq!(
            lcm(&BigUint::from(0u32), &BigUint::from(0u32)),
            BigUint::from(0u32)
        );

        // LCM with 1
        assert_eq!(
            lcm(&BigUint::from(1u32), &BigUint::from(5u32)),
            BigUint::from(5u32)
        );
        assert_eq!(
            lcm(&BigUint::from(7u32), &BigUint::from(1u32)),
            BigUint::from(7u32)
        );
        assert_eq!(
            lcm(&BigUint::from(1u32), &BigUint::from(1u32)),
            BigUint::from(1u32)
        );

        // LCM where one divides the other
        assert_eq!(
            lcm(&BigUint::from(6u32), &BigUint::from(12u32)),
            BigUint::from(12u32)
        );
        assert_eq!(
            lcm(&BigUint::from(15u32), &BigUint::from(45u32)),
            BigUint::from(45u32)
        );

        // LCM of same numbers
        assert_eq!(
            lcm(&BigUint::from(7u32), &BigUint::from(7u32)),
            BigUint::from(7u32)
        );

        // LCM of coprime numbers (should equal their product)
        assert_eq!(
            lcm(&BigUint::from(7u32), &BigUint::from(11u32)),
            BigUint::from(77u32)
        );
        assert_eq!(
            lcm(&BigUint::from(13u32), &BigUint::from(17u32)),
            BigUint::from(221u32)
        );

        // Large numbers
        let large_a = BigUint::from(123456u32);
        let large_b = BigUint::from(789012u32);
        let lcm_result = lcm(&large_a, &large_b);
        assert!(lcm_result >= large_a && lcm_result >= large_b);
        assert_eq!(&lcm_result % &large_a, BigUint::from(0u32));
        assert_eq!(&lcm_result % &large_b, BigUint::from(0u32));
    }

     #[test]
    fn test_coprime_properties() {
        // Consecutive integers are always coprime
        for i in 2..20u32 {
            assert!(are_coprime(&BigUint::from(i), &BigUint::from(i + 1)));
        }
        
        // 1 is coprime with everything except 0
        assert!(are_coprime(&BigUint::from(1u32), &BigUint::from(100u32)));
        assert!(!are_coprime(&BigUint::from(0u32), &BigUint::from(5u32)));
        
        // Powers of different primes are coprime
        assert!(are_coprime(&BigUint::from(8u32), &BigUint::from(9u32))); // 2^3, 3^2
        assert!(!are_coprime(&BigUint::from(4u32), &BigUint::from(6u32))); // both even
    }

    // Performance tests
    #[test]
    fn bench_gcd_small_numbers() {
        let a = BigUint::from(123456u32); // Smaller numbers for WASM
        let b = BigUint::from(789012u32);
        
        let start = Instant::now();
        // Much fewer iterations for WASM
        for _ in 0..100 {
            let _ = gcd(&a, &b);
        }
        let duration = start.elapsed();
        
        println!("GCD small numbers (WASM): 100 operations in {:?}", duration);
        if duration.as_millis() > 0 {
            println!("Average: {:?} per operation", duration / 100);
        }
        
        // WASM is much slower - give it 5 seconds for 100 operations
        assert!(duration.as_secs() < 5, "GCD too slow for small numbers in WASM");
    }

    #[test]
    fn bench_gcd_medium_numbers() {
        // Smaller "medium" numbers for WASM
        let a = BigUint::from(0x12345678u32);
        let b = BigUint::from(0x87654321u32);
        
        let start = Instant::now();
        // Even fewer iterations for medium numbers
        for _ in 0..50 {
            let _ = gcd(&a, &b);
        }
        let duration = start.elapsed();
        
        println!("GCD medium numbers (WASM): 50 operations in {:?}", duration);
        if duration.as_millis() > 0 {
            println!("Average: {:?} per operation", duration / 50);
        }
        
        // Give WASM more time
        assert!(duration.as_secs() < 10, "GCD too slow for medium numbers in WASM");
    }

    #[test]
    fn bench_gcd_large_numbers() {
        // Much smaller "large" numbers for WASM
        let a = BigUint::from(123456789u32);
        let b = BigUint::from(987654321u32);
        
        let start = Instant::now();
        // Very few iterations for large numbers in WASM
        for _ in 0..10 {
            let _ = gcd(&a, &b);
        }
        let duration = start.elapsed();
        
        println!("GCD large numbers (WASM): 10 operations in {:?}", duration);
        if duration.as_millis() > 0 {
            println!("Average: {:?} per operation", duration / 10);
        }
        
        // WASM needs lots of time for this
        assert!(duration.as_secs() < 15, "GCD too slow for large numbers in WASM");
    }

    #[test]
    fn bench_lcm_performance() {
        let a = BigUint::from(12345u32); // Much smaller for WASM
        let b = BigUint::from(67890u32);
        
        let start = Instant::now();
        for _ in 0..50 {
            let _ = lcm(&a, &b);
        }
        let duration = start.elapsed();
        
        println!("LCM (WASM): 50 operations in {:?}", duration);
        if duration.as_millis() > 0 {
            println!("Average: {:?} per operation", duration / 50);
        }
        
        assert!(duration.as_secs() < 10, "LCM too slow for WASM");
    }

    #[test]
    fn bench_coprime_check() {
        let test_pairs = vec![
            (BigUint::from(97u32), BigUint::from(101u32)),
            (BigUint::from(113u32), BigUint::from(127u32)),
        ];
        
        let start = Instant::now();
        for _ in 0..50 {
            for (a, b) in &test_pairs {
                let _ = are_coprime(a, b);
            }
        }
        let duration = start.elapsed();
        
        println!("Coprime checks (WASM): 100 operations in {:?}", duration);
        if duration.as_millis() > 0 {
            println!("Average: {:?} per operation", duration / 100);
        }
        
        assert!(duration.as_secs() < 8, "Coprime check too slow for WASM");
    }

    // Correctness verification tests
    #[test]
    fn verify_gcd_properties() {
        let test_cases = vec![
            (48u64, 18u64, 6u64),
            (101u64, 103u64, 1u64),
            (1071u64, 462u64, 21u64),
            (12345u64, 67890u64, 15u64),
        ];
        
        for (a_val, b_val, expected_gcd) in test_cases {
            let a = BigUint::from(a_val);
            let b = BigUint::from(b_val);
            let computed_gcd = gcd(&a, &b);
            
            assert_eq!(computed_gcd, BigUint::from(expected_gcd),
                "GCD({}, {}) should be {}, got {}", a_val, b_val, expected_gcd, computed_gcd);
            
            // Verify GCD properties
            assert_eq!(&a % &computed_gcd, BigUint::from(0u64));
            assert_eq!(&b % &computed_gcd, BigUint::from(0u64));
            
            // Verify LCM property: lcm(a,b) * gcd(a,b) = a * b
            let computed_lcm = lcm(&a, &b);
            assert_eq!(&computed_lcm * &computed_gcd, &a * &b);
        }
    }

    #[test]
    fn stress_test_large_numbers() {
        // Much smaller "stress test" for WASM - just 64-bit-ish numbers
        let large1 = BigUint::parse_bytes(b"12345678901234567890", 10).unwrap();
        let large2 = BigUint::parse_bytes(b"98765432109876543210", 10).unwrap();
        
        let start = Instant::now();
        let result = gcd(&large1, &large2);
        let duration = start.elapsed();
        
        println!("Large GCD (WASM) computed in {:?}", duration);
        println!("Result: {}", result);
        
        // WASM needs way more time for this
        assert!(duration.as_secs() < 30, "Large number GCD took too long for WASM");
        
        // Verify result divides both numbers
        assert_eq!(&large1 % &result, BigUint::from(0u32));
        assert_eq!(&large2 % &result, BigUint::from(0u32));
    }
}
