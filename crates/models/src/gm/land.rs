//! GM land utilities.

use std::mem;

use bitfield_struct::bitfield;

/// [`Land`] types.
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
///
/// # Example
///
/// ```rust
/// use models::{Land, Type};
///
/// let land = Land::new()
///             .with_type(Type::Crown)
///             .with_color(2)
///             .with_amount(161);
///
/// assert_eq!(land.r#type(), Type::Crown);
/// assert_eq!(land.amount(), 161);
/// assert_eq!(land.color(), 2);
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
