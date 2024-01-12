//! Map operations.

use crate::land::Land;
use std::{
    alloc::{alloc, Layout},
    iter,
    mem::{align_of, size_of},
};
use wasm_bindgen::prelude::wasm_bindgen;

/// Map modes.
#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Mode {
    Hexagon,
    Square,
}

/// Game map.
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Map {
    #[wasm_bindgen(readonly)]
    pub mode: Mode,

    #[wasm_bindgen(readonly)]
    pub width: usize,

    #[wasm_bindgen(readonly)]
    pub height: usize,

    /// Equals to [`Self::width`] * [`Self::height`].
    #[wasm_bindgen(readonly)]
    pub size: usize,

    #[wasm_bindgen(skip)]
    pub lands: Vec<Land>,
}

/// Public methods, exported to JavaScript.
#[wasm_bindgen]
impl Map {
    /// Creates a new [`Map`].
    #[wasm_bindgen(constructor)]
    pub fn new(mode: Mode, width: usize, height: usize) -> Self {
        let size = width * height;

        Self {
            mode,
            width,
            height,
            size,
            lands: iter::repeat(Default::default()).take(size).collect(),
        }
    }

    /// Allocates for a new [`Map`] without initialization.
    ///
    /// # Safety
    ///
    /// This function is unsafe because the map contains uninitialized data.
    /// Do not use the map before calling generators.
    #[cold]
    pub unsafe fn alloc(mode: Mode, width: usize, height: usize) -> Self {
        let size = width * height;

        // Safety: Alignment of `Land` is power of two.
        let layout =
            Layout::from_size_align_unchecked(size * size_of::<Land>(), align_of::<Land>());

        // Safety: `layout` is not zero-sized.
        let ptr = alloc(layout) as *mut Land;

        // Safety: `ptr` is properly allocated.
        Self {
            mode,
            width,
            height,
            size,
            lands: Vec::from_raw_parts(ptr, size, size),
        }
    }

    /// Creates a new [`Map`] with lands.
    pub fn with_lands(mode: Mode, width: usize, height: usize, lands: Vec<Land>) -> Self {
        let size = width * height;

        Self {
            mode,
            width,
            height,
            size,
            lands,
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
