use wasm_bindgen::prelude::wasm_bindgen;

/// Hashes the given data.
#[wasm_bindgen]
pub fn hash(data: Box<[u8]>) -> u32 {
    let mut hash = 0x811c9dc5;

    for i in data.into_vec() {
        hash ^= i as u32;
        hash = hash.wrapping_mul(0x01000193);
    }

    hash
}
