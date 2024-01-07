use std::hint::black_box;
use wasm_bindgen::prelude::wasm_bindgen;

/// Grows the memory by a number of pages.
fn grow(pages: usize) {
    black_box(Vec::<u8>::with_capacity(pages * 64 * 1024));
}

/// Init the wasm instance.
#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_log")]
    {
        use log::Level;
        console_log::init_with_level(Level::Debug).unwrap();
    }

    grow(100);
}
