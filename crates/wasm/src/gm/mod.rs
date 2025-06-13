//! GM operations.

use std::iter;

use face::Face;
use wasm_bindgen::prelude::wasm_bindgen;

use crate::land::Land;

pub mod edges;

pub mod index;

pub mod face;

/// Game map.
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct GM {
  #[wasm_bindgen(skip)]
  pub edges: Vec<Vec<usize>>,

  #[wasm_bindgen(skip)]
  pub lands: Vec<Land>,

  #[wasm_bindgen(skip)]
  pub faces: Vec<Face>
}

#[wasm_bindgen]
impl GM {
  /// Creates an empty [`GM`] with the given size.
  #[wasm_bindgen(constructor)]
  pub fn new(size: usize) -> Self {
    Self {
      lands: iter::repeat_n(Default::default(), size).collect(),
      edges: iter::repeat_n(Default::default(), size).collect(),
      faces: iter::repeat_n(Default::default(), size).collect()
    }
  }

  /// Loads [`GM::lands`] from lands.
  pub fn load(&mut self, lands: Vec<u32>) {
    self.lands = lands.into_iter().map(Into::into).collect();
  }

  /// Returns a pointer to [`GM::lands`] of the [`GM`].
  pub fn export_lands(&self) -> *const Land {
    self.lands.as_ptr()
  }
}
