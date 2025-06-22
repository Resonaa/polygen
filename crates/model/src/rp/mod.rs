use std::ops::Deref;

pub use face::Face;
use wasm_bindgen::prelude::wasm_bindgen;

mod face;

use crate::types::{FaceRaduis, FaceSides, FaceVec};

/// 3D representation of a GM.
#[derive(Default, Debug, Clone)]
#[wasm_bindgen]
pub struct RP(#[wasm_bindgen(skip)] pub Vec<Face>);

impl Deref for RP {
  type Target = Vec<Face>;

  fn deref(&self) -> &Self::Target { &self.0 }
}

#[wasm_bindgen]
impl RP {
  pub fn position(&self, id: usize) -> Box<[FaceVec]> { self[id].position.into() }

  pub fn normal(&mut self, id: usize) -> Box<[FaceVec]> { self[id].normal.into() }

  pub fn sides(&mut self, id: usize) -> FaceSides { self[id].sides }

  pub fn radius(&mut self, id: usize) -> FaceRaduis { self[id].radius }
}
