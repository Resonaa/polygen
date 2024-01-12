//! Hashing algorithms.

use highway::{HighwayHash, HighwayHasher};
use wasm_bindgen::prelude::wasm_bindgen;

/// Hashes the given data. Uses Google's HighwayHash implementation.
///
/// # Example
///
/// ```rust
/// use wasm::hash::hash;
///
/// assert_eq!(hash(vec![1, 6, 0, 6]), 16724549215765392899);
/// ```
#[wasm_bindgen]
pub fn hash(data: Vec<u8>) -> u64 {
    HighwayHasher::default().hash64(&data)
}
