//! Setup hooks to init the WebAssembly instance.

use wasm_bindgen::prelude::wasm_bindgen;

/// Init the WebAssembly instance.
#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_log")]
    {
        console_log::init_with_level(log::Level::Debug).unwrap();
    }

    #[cfg(target_arch = "wasm32")]
    {
        std::arch::wasm32::memory_grow(0, 100);
    }
}
