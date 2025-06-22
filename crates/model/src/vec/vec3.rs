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
pub struct Vec3<T> {
  pub x: T,
  pub y: T,
  pub z: T
}

impl<T> Vec3<T> {
  pub const fn new(x: T, y: T, z: T) -> Self { Self { x, y, z } }
}

impl<T: Add<Output = T>> Add for Vec3<T> {
  type Output = Self;

  fn add(self, rhs: Self) -> Self::Output {
    Self::new(self.x + rhs.x, self.y + rhs.y, self.z + rhs.z)
  }
}

impl<T: Sub<Output = T>> Sub for Vec3<T> {
  type Output = Self;

  fn sub(self, rhs: Self) -> Self::Output {
    Self::new(self.x - rhs.x, self.y - rhs.y, self.z - rhs.z)
  }
}

impl<T: Mul<Output = T> + Copy> Mul<T> for Vec3<T> {
  type Output = Self;

  fn mul(self, rhs: T) -> Self::Output { Self::new(self.x * rhs, self.y * rhs, self.z * rhs) }
}

impl Vec3<f64> {
  pub fn len(&self) -> f64 { (self.x * self.x + self.y * self.y + self.z * self.z).sqrt() }

  pub fn normalized(&self) -> Self { *self * (1. / self.len()) }
}

impl<T> From<Vec3<T>> for [T; 3] {
  fn from(value: Vec3<T>) -> Self { [value.x, value.y, value.z] }
}

impl<T> From<Vec3<T>> for Box<[T]> {
  fn from(value: Vec3<T>) -> Self { [value.x, value.y, value.z].into() }
}
