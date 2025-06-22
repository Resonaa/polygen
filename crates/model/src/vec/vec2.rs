use std::ops::{Add, Mul, Sub};

#[derive(
  rkyv::Archive,
  rkyv::Deserialize,
  rkyv::Serialize,
  Debug,
  Clone,
  PartialEq,
  Eq,
  Default,
  Copy,
  Hash,
)]
pub struct Vec2<T> {
  pub x: T,
  pub y: T
}

#[macro_export]
macro_rules! vec2 {
  [$x:expr, $y:expr] => {
    Vec2 { x: $x, y: $y }
  };
}

impl<T> Vec2<T> {
  pub const fn new(x: T, y: T) -> Self { Self { x, y } }
}

impl<T: Add<Output = T>> Add for Vec2<T> {
  type Output = Self;

  fn add(self, rhs: Self) -> Self::Output { Self::new(self.x + rhs.x, self.y + rhs.y) }
}

impl<T: Sub<Output = T>> Sub for Vec2<T> {
  type Output = Self;

  fn sub(self, rhs: Self) -> Self::Output { Self::new(self.x - rhs.x, self.y - rhs.y) }
}

impl<T: Mul<Output = T> + Copy> Mul<T> for Vec2<T> {
  type Output = Self;

  fn mul(self, rhs: T) -> Self::Output { Self::new(self.x * rhs, self.y * rhs) }
}

macro_rules! impl_wrapping_add {
  ($($t:ty),*) => {
    $(
      impl Vec2<$t> {
        pub const fn wrapping_add(&self, rhs: Vec2<$t>) -> Self {
          Self::new(self.x.wrapping_add(rhs.x), self.y.wrapping_add(rhs.y))
        }
      }
    )*
  };
}

impl_wrapping_add!(u8, u16, u32, u64, u128);

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn it_wrap_adds() {
    let v1 = vec2![10u8, 20u8];
    let v2 = vec2![250u8, 245u8];
    let v3 = vec2![4u8, 9u8];
    assert_eq!(v1.wrapping_add(v2), v3);
  }
}
