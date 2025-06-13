//! GM land utilities.

use std::mem;

use bitfield_struct::bitfield;
use rand::distr::StandardUniform;
use rand::prelude::{Distribution, Rng};
use wasm_bindgen::prelude::wasm_bindgen;

/// [`Land`] types.
#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Eq, Debug, Default)]
#[repr(u32)]
pub enum Type {
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

impl Type {
  const fn into_bits(self) -> u32 {
    self as _
  }

  const fn from_bits(value: u32) -> Self {
    unsafe { mem::transmute(value) }
  }
}

impl Distribution<Type> for StandardUniform {
  fn sample<R: Rng + ?Sized>(&self, rng: &mut R) -> Type {
    Type::from_bits(rng.random_range(0..=7))
  }
}

/// GM land.
///
/// # Layout
///
///  ```plaintext
/// Bits             24         5        3
///             +----------+---------+--------+
/// Properties |  Amount  |  Color  |  Type  |
///             +----------+---------+--------+
/// ```
#[bitfield(u32)]
pub struct Land {
  #[bits(3)]
  pub r#type: Type,

  #[bits(5)]
  pub color: u32,

  #[bits(24)]
  pub amount: u32
}
