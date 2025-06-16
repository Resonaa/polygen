use model::types::{GMConfigPlayerCount, GMConfigRatio, GMMode};
pub use model::{GM, GMConfig, GMName, GMProfile, RP};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub struct Generation {
  gm: GM,
  rp: RP
}

impl Generation {
  pub fn new((gm, rp): (GM, RP)) -> Self {
    Self { gm, rp }
  }
}

#[wasm_bindgen]
impl Generation {
  pub fn gm(&self) -> GM {
    self.gm.clone()
  }

  pub fn rp(&self) -> RP {
    self.rp.clone()
  }
}

#[wasm_bindgen]
pub fn generate_random(
  player_count: GMConfigPlayerCount,
  mode: GMMode,
  width: GMConfigRatio,
  height: GMConfigRatio,
  y_ratio: GMConfigRatio,
  city_density: GMConfigRatio
) -> Generation {
  let config = GMConfig { player_count, mode, width, height, y_ratio, city_density };
  let profile = GMProfile { name: GMName::Random, config };
  Generation::new(generator::generate(profile))
}
