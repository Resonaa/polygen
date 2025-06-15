use model::GM;
use rand::Rng;

pub mod pure_random;

pub trait Design {
  fn design(&self, gm: &mut GM, rng: &mut impl Rng);
}
