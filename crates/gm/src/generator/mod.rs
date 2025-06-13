use rand::{Rng, SeedableRng};
use wasm_bindgen::prelude::wasm_bindgen;

use crate::GM;

pub mod pure_random;

pub type Seed = [u8; 32];

pub trait Generator {
  fn generate(&self, rng: impl Rng) -> GM;
}

impl GM {
  pub fn generate_from_entropy(generator: impl Generator) -> GM {
    let rng = rand_chacha::ChaCha20Rng::from_entropy();
    generator.generate(rng)
  }
}

#[wasm_bindgen]
impl GM {
  pub fn generate_pure_random(config: pure_random::Config) -> GM {
    GM::generate_from_entropy(config)
  }
}
