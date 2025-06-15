//! GM land utilities.

use crate::types::{LandAmount, LandColor, LandType};

/// GM land.
#[derive(rkyv::Archive, rkyv::Deserialize, rkyv::Serialize, Clone, Copy, Debug, Default)]
pub struct Land {
  pub r#type: LandType,
  pub color: LandColor,
  pub amount: LandAmount
}
