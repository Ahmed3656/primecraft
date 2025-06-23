use js_sys;
use serde_wasm_bindgen;
use wasm_bindgen::prelude::*;

// Module declarations
mod constants;
// mod crypto;
mod entropy;
mod generators;
mod helpers;
mod math;
mod types;
mod utils;

pub use generators::PrimeGenerator;
pub use types::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub fn generate_prime_set_wasm(
    count: u32,
    bit_length: u32,
    strategy: &str,
) -> Result<JsValue, JsValue> {
    if bit_length < 16 || bit_length > 4096 {
        return Err(JsValue::from_str("Bit length must be between 16 and 4096"));
    }

    if count == 0 || count > 10 {
        return Err(JsValue::from_str("Count must be between 1 and 10"));
    }

    let start_time = js_sys::Date::now();

    let mut generator = PrimeGenerator::new();
    let mut attempts = 0u32;

    let primes = match strategy {
        "rsa-multi" => {
            attempts = 1;
            generator.generate_rsa_multi_primes(count, bit_length)
        }
        "strong" => {
            if count != 1 {
                return Err(JsValue::from_str("Strong strategy only supports count=1"));
            }
            vec![generator.generate_strong_prime(bit_length, &mut attempts)]
        }
        _ => {
            return Err(JsValue::from_str(&format!(
                "Unknown strategy: {}",
                strategy
            )))
        }
    };

    let end_time = js_sys::Date::now();
    let generation_time = (end_time - start_time) as u32;

    let properties = math::properties::calculate_prime_properties(&primes, strategy);

    let prime_strings: Vec<String> = primes.iter().map(|p| p.to_string()).collect();

    let result = PrimeSetResult {
        primes: prime_strings,
        properties,
        metadata: GenerationMetadata {
            attempts,
            generation_time,
            strategy: strategy.to_string(),
        },
    };

    serde_wasm_bindgen::to_value(&result).map_err(|e| JsValue::from_str(&e.to_string()))
}

#[wasm_bindgen(start)]
pub fn main() {
    console_log!("WASM Prime Generator initialized - Supporting up to 4096-bit primes");
}
