use glam::Vec3A;
use wasm_bindgen::prelude::wasm_bindgen;

use crate::gm::GM;

#[derive(Debug, Default, Clone, Copy)]
pub struct Face {
  pub position: Vec3A,
  pub nomal: Vec3A,
  pub sides: usize,
  pub radius: f32
}

#[wasm_bindgen]
impl GM {
  pub fn position(&mut self, id: usize) -> Box<[f32]> {
    self.faces[id].position.to_array().into()
  }

  pub fn normal(&mut self, id: usize) -> Box<[f32]> {
    self.faces[id].nomal.to_array().into()
  }

  pub fn sides(&mut self, id: usize) -> usize {
    self.faces[id].sides
  }

  pub fn radius(&mut self, id: usize) -> f32 {
    self.faces[id].radius
  }
}
