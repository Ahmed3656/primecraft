pub struct PrimeGenerator;

impl PrimeGenerator {
    pub fn new() -> Self {
        Self
    }

    pub fn generate_rsa_multi_primes(&mut self, count: u32, bit_length: u32) -> Vec<num_bigint::BigUint> {
        use num_bigint::BigUint;
        use rand::Rng;
        use rand::rngs::OsRng;

        (0..count).map(|_| {
            let mut bytes = vec![0u8; (bit_length / 8) as usize];
            OsRng.fill(&mut bytes[..]);
            BigUint::from_bytes_be(&bytes)
        }).collect()
    }
    pub fn generate_strong_prime(&mut self, bit_length: u32, attempts: &mut u32) -> num_bigint::BigUint {
        use num_bigint::BigUint;
        use rand::Rng;
        use rand::rngs::OsRng;

        *attempts = 1;
        let byte_len = ((bit_length + 7) / 8) as usize;
        let mut buffer = vec![0u8; byte_len];
        OsRng.fill(&mut buffer[..]);

        let excess_bits = (8 * byte_len as u32) - bit_length;
        buffer[0] &= 0xFF >> excess_bits;
        buffer[0] |= 1 << (7 - excess_bits);

        BigUint::from_bytes_be(&buffer)
    }
}
