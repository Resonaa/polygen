use crate::land::Land;
use std::{iter, slice::from_raw_parts};
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
#[repr(C)]
#[derive(Clone, Debug)]
/// Game map.
pub struct Map {
    #[wasm_bindgen(readonly)]
    pub mode: Mode,

    #[wasm_bindgen(readonly)]
    pub width: u8,

    #[wasm_bindgen(readonly)]
    pub height: u8,

    #[wasm_bindgen(readonly)]
    /// Equals to width * height.
    pub size: u16,

    pub(crate) lands: Vec<Land>,
}

/// Public methods, exported to JavaScript.
#[wasm_bindgen]
impl Map {
    #[wasm_bindgen(constructor)]
    /// Creates a new `Map`.
    pub fn new(mode: Mode, width: u8, height: u8) -> Self {
        let size = (width as u16) * (height as u16);

        Self {
            mode,
            width,
            height,
            size,
            lands: iter::repeat(Default::default())
                .take(size as usize)
                .collect(),
        }
    }

    /// Creates a new `Map` from raw bytes.
    ///
    /// # Safety
    ///
    /// Caller must ensure that `data` is of the same memory layout of `[Land]`.
    pub unsafe fn with_lands(mode: Mode, width: u8, height: u8, data: &[u8]) -> Self {
        let size = (width as u16) * (height as u16);

        let lands = from_raw_parts(data.as_ptr() as *const Land, size as usize).into();

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
