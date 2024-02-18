//! Diffing and patching support for [`crate::land::Land`] and [`crate::map::Map`].

use std::ops::{Deref, DerefMut};

use wasm_bindgen::prelude::wasm_bindgen;

use crate::land::Land;
use crate::pos::Index;

/// A single [`Map`] patch.
#[derive(Debug, Clone, Copy, Default)]
#[wasm_bindgen]
pub struct Patch {
    pub index: Index,
    pub land: Land
}

impl Patch {
    /// Creates a new [`Patch`].
    pub const fn new(index: Index, land: Land) -> Self {
        Self { index, land }
    }
}

/// Wrapper for [`Vec<Patch>`].
#[wasm_bindgen]
pub struct Patches(Vec<Patch>);

impl Deref for Patches {
    type Target = Vec<Patch>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl DerefMut for Patches {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

/// Public methods, exported to JavaScript.
#[wasm_bindgen]
impl Patches {
    /// Exports the [`Patches`] to JavaScript.
    pub fn export(&self) -> *const Patch {
        self.as_ptr()
    }

    /// Gets the length of the [`Patches`].
    #[wasm_bindgen(getter = length)]
    pub fn _len(&self) -> u32 {
        self.len() as u32
    }
}
