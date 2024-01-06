use crate::land::Land;
use std::{
    alloc::{alloc, Layout},
    iter,
    mem::{align_of, size_of, transmute},
};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
/// Map modes.
pub enum Mode {
    Hexagon,
    Square,
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
/// Game map.
pub struct Map {
    #[wasm_bindgen(readonly)]
    pub mode: Mode,

    #[wasm_bindgen(readonly)]
    pub width: usize,

    #[wasm_bindgen(readonly)]
    pub height: usize,

    #[wasm_bindgen(readonly)]
    /// Equals to width * height.
    pub size: usize,

    pub(crate) lands: Vec<Land>,
}

/// Public methods, exported to JavaScript.
#[wasm_bindgen]
impl Map {
    #[wasm_bindgen(constructor)]
    /// Creates a new `Map`.
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

    /// Allocates for a new `Map` without initialization.
    ///
    /// # Safety
    ///
    /// This function is unsafe because the map contains uninitialized data.
    /// Do not use the map before calling generators.
    pub unsafe fn alloc(mode: Mode, width: usize, height: usize) -> Self {
        let size = width * height;

        let layout = Layout::from_size_align(size * size_of::<Land>(), align_of::<Land>()).unwrap();

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

    /// Creates a new `Map` from raw bytes.
    ///
    /// # Safety
    ///
    /// Caller must ensure that `data` is of the same memory layout of `Box<[Land]>`.
    pub unsafe fn with_lands(mode: Mode, width: usize, height: usize, data: Box<[u8]>) -> Self {
        let size = width * height;

        let lands = transmute::<_, Box<[Land]>>(data).into_vec();

        Self {
            mode,
            width,
            height,
            size,
            lands,
        }
    }

    /// Returns a pointer to the `lands` of the `Map`.
    pub fn export_lands(&self) -> *const Land {
        self.lands.as_ptr()
    }
}
