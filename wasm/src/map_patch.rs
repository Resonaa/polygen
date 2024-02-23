//! Diffing and patching support for [`crate::land::Land`] and [`crate::map::Map`].

use std::ops::{Deref, DerefMut};

use wasm_bindgen::prelude::wasm_bindgen;

use crate::land::Land;
use crate::map::Map;
use crate::pos::Index;

/// A single [`Map`] patch.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
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
#[derive(PartialEq, Eq, Debug, Default)]
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

impl From<Vec<Patch>> for Patches {
    fn from(value: Vec<Patch>) -> Self {
        Self(value)
    }
}

impl FromIterator<Patch> for Patches {
    fn from_iter<T: IntoIterator<Item = Patch>>(iter: T) -> Self {
        Self(iter.into_iter().collect())
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

impl Map {
    /// Diffs two [`Map`]s and returns the [`Patches`] array.
    ///
    /// # Panics
    ///
    /// Panics when two maps given are not of the same size.
    ///
    /// # Example
    ///
    /// ```rust
    /// use wasm::map_testing::*;
    ///
    /// let this_map = square![
    ///     _ _
    ///     _ #
    /// ];
    ///
    /// let that_map = square![
    ///     _ #
    ///     _ _
    /// ];
    ///
    /// let patches = this_map.diff(&that_map);
    ///
    /// assert_eq!(patches.len(), 2);
    /// assert_eq!(patches[0].index, 1);
    /// assert_eq!(patches[1].index, 3);
    /// ```
    pub fn diff(&self, other: &Map) -> Patches {
        assert_eq!(self.size, other.size);

        self.into_iter()
            .zip(other)
            .enumerate()
            .filter_map(|(index, (&this, &that))| {
                if this == that {
                    None
                } else {
                    Some(Patch::new(index as Index, that))
                }
            })
            .collect()
    }
}
