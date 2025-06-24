use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::wasm_bindgen;

use crate::types::{GMConfigPlayerCount, GMConfigRatio, GMMode};

#[derive(Deserialize, Serialize, Clone, Copy, Debug, Default)]
#[wasm_bindgen]
pub struct GMConfig {
  pub player_count: GMConfigPlayerCount,
  pub width: GMConfigRatio,
  pub height: GMConfigRatio,
  pub city_density: GMConfigRatio,
  pub y_ratio: GMConfigRatio,
  pub mode: GMMode
}
