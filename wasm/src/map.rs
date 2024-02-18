//! Map operations.

use std::alloc::{alloc, Layout};
use std::iter;
use std::mem::{align_of, size_of};

use wasm_bindgen::prelude::wasm_bindgen;

use crate::land::Land;

/// Map modes.
#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Mode {
    Hexagon,
    Square
}

/// Game map.
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Map {
    #[wasm_bindgen(readonly)]
    pub mode: Mode,

    #[wasm_bindgen(readonly)]
    pub width: u32,

    #[wasm_bindgen(readonly)]
    pub height: u32,

    /// Equals to [`Self::width`] * [`Self::height`].
    #[wasm_bindgen(readonly)]
    pub size: u32,

    #[wasm_bindgen(skip)]
    pub lands: Vec<Land>
}

/// Public methods, exported to JavaScript.
#[wasm_bindgen]
impl Map {
    /// Creates a new [`Map`].
    #[wasm_bindgen(constructor)]
    pub fn new(mode: Mode, width: u32, height: u32) -> Self {
        let size = width * height;

        Self {
            mode,
            width,
            height,
            size,
            lands: iter::repeat(Default::default())
                .take(size as usize)
                .collect()
        }
    }

    /// Allocates for a new [`Map`] without initialization.
    ///
    /// # Safety
    ///
    /// This function is unsafe because the map contains uninitialized data.
    /// Do not use the map before calling generators.
    #[cold]
    pub unsafe fn alloc(mode: Mode, width: u32, height: u32) -> Self {
        let size = width * height;

        // Safety: Alignment of `Land` is power of two.
        let layout = Layout::from_size_align_unchecked(
            (size as usize) * size_of::<Land>(),
            align_of::<Land>()
        );

        // Safety: `layout` is not zero-sized.
        let ptr = alloc(layout) as *mut Land;

        // Safety: `ptr` is properly allocated.
        Self {
            mode,
            width,
            height,
            size,
            lands: Vec::from_raw_parts(ptr, size as usize, size as usize)
        }
    }

    /// Creates a new [`Map`] with lands.
    pub fn with_lands(mode: Mode, width: u32, height: u32, lands: Vec<Land>) -> Self {
        let size = width * height;

        Self {
            mode,
            width,
            height,
            size,
            lands
        }
    }

    /// Loads [`Map::lands`] from lands.
    pub fn load(&mut self, lands: Vec<Land>) {
        self.lands = lands;
    }

    /// Returns a pointer to [`Map::lands`] of the [`Map`].
    pub fn export_lands(&self) -> *const Land {
        self.lands.as_ptr()
    }
}
