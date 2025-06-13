use std::f32::consts::PI;

use rand::seq::SliceRandom;
use rand::Rng;
use wasm_bindgen::prelude::wasm_bindgen;

use super::Generator;
use crate::gm::GM;

/// Completely random gm.
///
/// # Example
///
/// ```rust
/// use gm::generator::pure_random::Config;
/// use gm::GM;
///
/// let config = Config {
///   players: 3,
///   size: 10
/// };
///
/// let gm = GM::generate_pure_random(config);
///
/// assert_eq!(gm.size(), 10);
/// ```
#[wasm_bindgen]
pub struct Config {
  pub size: usize,
  pub players: usize
}

#[wasm_bindgen]
impl Config {
  #[wasm_bindgen(constructor)]
  pub fn new(size: usize, players: usize) -> Self {
    Self { size, players }
  }
}

impl Generator for Config {
  fn generate(&self, mut rng: impl Rng) -> GM {
    let mut gm = GM::new(self.size);

    for face in &mut gm.faces {
      face.position.x = rng.gen_range(0.0..50.0);
      face.position.y = rng.gen_range(0.0..30.0);
      face.position.z = rng.gen_range(0.0..50.0);

      let theta = rng.gen_range(0.0..PI * 2.0); // Angle in [0, 2π]
      let phi = rng.gen_range(0.0..PI); // Angle in [0, π]

      // Convert spherical coordinates to Cartesian coordinates
      face.nomal.x = phi.sin() * theta.cos();
      face.nomal.y = phi.sin() * theta.sin();
      face.nomal.z = phi.cos();

      face.radius = 1.0;
      face.sides = *[3, 4, 6].choose(&mut rng).unwrap();
    }

    for land in &mut gm.lands {
      land.set_amount(10u32.pow(rng.gen_range(0..=6)) * rng.gen_range(1..=9));
      land.set_color(rng.gen_range(0..=self.players as u32));
      land.set_type(rng.r#gen());
    }

    gm
  }
}
