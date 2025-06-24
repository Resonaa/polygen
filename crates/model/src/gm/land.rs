//! GM land utilities.

use serde::{Deserialize, Serialize};

use crate::types::{LandAmount, LandColor, LandType};

/// GM land.
#[derive(Deserialize, Serialize, Clone, Copy, Debug, Default)]
pub struct Land {
  pub r#type: LandType,
  pub color: LandColor,
  pub amount: LandAmount
}
