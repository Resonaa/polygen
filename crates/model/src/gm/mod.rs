//! GM operations.

use std::iter;

use wasm_bindgen::prelude::wasm_bindgen;

use crate::types::{LandAmount, LandColor, LandId, LandType};

mod config;
mod land;
mod profile;

pub use config::GMConfig;
pub use land::Land;
pub use profile::{GMName, GMProfile};

/// Game map.
#[derive(rkyv::Archive, rkyv::Deserialize, rkyv::Serialize, Debug, Clone)]
#[wasm_bindgen]
pub struct GM {
  #[wasm_bindgen(skip)]
  pub edges: Vec<Vec<LandId>>,
  #[wasm_bindgen(skip)]
  pub lands: Vec<Land>
}

#[wasm_bindgen]
impl GM {
  /// Creates an empty [`GM`] with the given size.
  pub fn new(size: usize) -> Self {
    Self {
      lands: iter::repeat_n(Default::default(), size).collect(),
      edges: iter::repeat_n(Default::default(), size).collect()
    }
  }

  pub fn add_edge(&mut self, u: LandId, v: LandId) { self.edges[u as usize].push(v); }

  pub fn has_edge(&self, u: LandId, v: LandId) -> bool { self.edges[u as usize].contains(&v) }
}

#[wasm_bindgen]
impl GM {
  #[wasm_bindgen(getter)]
  pub fn size(&self) -> usize { self.lands.len() }

  pub fn r#type(&self, id: usize) -> LandType { self.lands[id].r#type }

  pub fn amount(&self, id: usize) -> LandAmount { self.lands[id].amount }

  pub fn color(&self, id: usize) -> LandColor { self.lands[id].color }
}
