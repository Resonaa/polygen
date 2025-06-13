use std::f32::consts::PI;

use rand::prelude::{IndexedRandom, Rng};
use wasm_bindgen::prelude::wasm_bindgen;

use super::Generator;
use crate::gm::GM;

/// Completely random gm.
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
      face.position.x = rng.random_range(0.0..50.0);
      face.position.y = rng.random_range(0.0..30.0);
      face.position.z = rng.random_range(0.0..50.0);

      let theta = rng.random_range(0.0..PI * 2.0); // Angle in [0, 2π]
      let phi = rng.random_range(0.0..PI); // Angle in [0, π]

      // Convert spherical coordinates to Cartesian coordinates
      face.nomal.x = phi.sin() * theta.cos();
      face.nomal.y = phi.sin() * theta.sin();
      face.nomal.z = phi.cos();

      face.radius = 1.0;
      face.sides = *[3, 4, 6].choose(&mut rng).unwrap();
    }

    for land in &mut gm.lands {
      land.set_amount(10u32.pow(rng.random_range(0..=6)) * rng.random_range(1..=9));
      land.set_color(rng.random_range(0..=self.players as u32));
      land.set_type(rng.random());
    }

    gm
  }
}
