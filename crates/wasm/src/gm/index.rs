use wasm_bindgen::prelude::wasm_bindgen;

use crate::gm::GM;
use crate::land::Type;

#[wasm_bindgen]
impl GM {
  #[wasm_bindgen(getter)]
  pub fn size(&self) -> usize {
    self.lands.len()
  }

  pub fn r#type(&self, id: usize) -> Type {
    self.lands[id].r#type()
  }

  pub fn amount(&self, id: usize) -> u32 {
    self.lands[id].amount()
  }

  pub fn color(&self, id: usize) -> u32 {
    self.lands[id].color()
  }
}
