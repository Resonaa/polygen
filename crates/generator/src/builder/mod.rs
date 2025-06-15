use model::BV;
use rand::Rng;

pub mod basic;

pub trait Build {
  fn build(&self, rng: &mut impl Rng) -> BV;
}
