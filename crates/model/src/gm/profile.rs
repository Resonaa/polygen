use wasm_bindgen::prelude::wasm_bindgen;

use crate::GMConfig;

#[derive(Clone, Copy, Debug, Default)]
#[non_exhaustive]
#[wasm_bindgen]
pub enum GMName {
  #[default]
  PureRandom
}

#[derive(Clone, Copy, Debug, Default)]
#[wasm_bindgen]
pub struct GMProfile {
  pub name: GMName,
  pub config: GMConfig
}
