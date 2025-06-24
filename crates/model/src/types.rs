use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::wasm_bindgen;

pub type LandId = u32;
pub type LandColor = u8;
pub type LandAmount = u32;

pub type GMConfigRatio = f64;
pub type GMConfigPlayerCount = LandColor;

pub type FaceRaduis = f64;
pub type FaceVec = f64;
pub type FaceSides = u8;

pub type BlockVec = u32;
pub type BlockYIndex = u32;

#[derive(Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Debug, Default)]
#[repr(u8)]
#[wasm_bindgen]
pub enum LandType {
  #[default]
  Empty,
  Crown,
  City,
  Desert,
  Lookout,
  Observatory,
  Satellite,
  Swamp
}

#[derive(Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Debug, Default)]
#[repr(u8)]
#[wasm_bindgen]
pub enum GMMode {
  #[default]
  Hexagon,
  Square,
  Triangle
}

impl GMMode {
  pub const fn sides(&self) -> FaceSides {
    match self {
      Self::Square => 4,
      Self::Hexagon => 6,
      Self::Triangle => 3
    }
  }
}

pub type TeamId = u8;
