use std::ops::Deref;

use model::types::LandType;
use model::{GM, GMConfig};

use crate::designer::Design;

pub struct PureRandomDesigner(pub GMConfig);

impl Deref for PureRandomDesigner {
  type Target = GMConfig;

  fn deref(&self) -> &Self::Target {
    &self.0
  }
}

impl Design for PureRandomDesigner {
  fn design(&self, gm: &mut GM, rng: &mut impl rand::Rng) {
    gm.lands.iter_mut().for_each(|land| {
      land.amount = rng.random_range(1..=9) * 10u32.pow(rng.random_range(0..=8));
      land.color = rng.random_range(0..=self.player_count);
      land.r#type = match rng.random_range(0..3) {
        0 => LandType::Empty,
        1 => LandType::Crown,
        2 => LandType::City,
        _ => unreachable!()
      }
    });
  }
}
