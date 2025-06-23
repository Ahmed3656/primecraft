use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct PrimeSetResult {
    pub primes: Vec<String>,
    pub properties: PrimeProperties,
    pub metadata: GenerationMetadata,
}

#[derive(Serialize, Deserialize)]
pub struct PrimeProperties {
    pub gaps: Vec<String>,
    pub product: String,
    pub bit_lengths: Vec<u32>,
    pub relationships: Vec<String>,
    pub strength: String,
}

#[derive(Serialize, Deserialize)]
pub struct GenerationMetadata {
    pub attempts: u32,
    pub generation_time: u32,
    pub strategy: String,
}
