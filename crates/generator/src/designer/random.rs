use std::ops::Deref;

use model::types::{GMConfigRatio, LandType};
use model::{GM, GMConfig};
use rand::Rng;
use rand::seq::SliceRandom;

use crate::designer::Design;
use crate::interpolate;

pub struct RandomDesigner(pub GMConfig);

impl Deref for RandomDesigner {
  type Target = GMConfig;

  fn deref(&self) -> &Self::Target {
    &self.0
  }
}

interpolate!(city_density, 0., 0.125, GMConfigRatio);

impl RandomDesigner {
  fn get_city_cnt(&self, gm: &GM) -> usize {
    (city_density(self.city_density) * (gm.size() as GMConfigRatio)) as usize
  }
}

impl Design for RandomDesigner {
  fn draft(&self, gm: &mut GM, rng: &mut impl Rng) {
    let city_cnt = self.get_city_cnt(&gm);
    let mut remained: Vec<_> = (0..gm.size()).collect();
    remained.shuffle(rng);

    for _ in 0..city_cnt {
      let id = remained.pop().unwrap();
      gm.lands[id].r#type = LandType::City;
      gm.lands[id].amount = rng.random_range(40..=50);
    }

    for color in 1..=self.player_count {
      let id = remained.pop().unwrap();
      gm.lands[id].r#type = LandType::Crown;
      gm.lands[id].amount = 1;
      gm.lands[id].color = color;
    }
  }
}
