use std::iter;
use std::ops::Deref;

use model::types::{BlockVec, BlockYIndex};
use model::{BV, Block, GMConfig, Vec2};
use rand::Rng;

use crate::builder::Build;
use crate::interpolate;

pub struct BasicBuilder(pub GMConfig);

impl Deref for BasicBuilder {
  type Target = GMConfig;

  fn deref(&self) -> &Self::Target { &self.0 }
}

interpolate!(plane_size_per_sqrt_player, 2, 10, BlockYIndex);
interpolate!(max_y_index, 1, 5, BlockYIndex);

impl BasicBuilder {
  fn gen_y(&self, _pos: Vec2<BlockVec>, rng: &mut impl Rng) -> BlockYIndex {
    let max_y_index = max_y_index(self.y_ratio);
    rng.random_range(1..=max_y_index)
  }

  fn get_plane_size(&self) -> (BlockVec, BlockVec) {
    (
      ((plane_size_per_sqrt_player(self.width) as f64) * (self.player_count as f64)) as _,
      ((plane_size_per_sqrt_player(self.height) as f64) * (self.player_count as f64)) as _
    )
  }
}

impl Build for BasicBuilder {
  fn build(&self, rng: &mut impl Rng) -> BV {
    let mut blocks = Vec::new();

    let (width, height) = self.get_plane_size();

    let mut y_index_table: Vec<Vec<BlockYIndex>> =
      iter::repeat_n(iter::repeat_n(99, height as usize + 1).collect(), width as usize + 1)
        .collect();

    for i in 1..=width {
      for j in 1..=height {
        y_index_table[i as usize][j as usize] = self.gen_y(Vec2::new(i, j), rng);
      }
    }

    for i in 1..=width {
      for j in 1..=height {
        let cur_y_index = y_index_table[i as usize][j as usize];
        let pos = Vec2::new(i, j);
        let max_neighboring = algorithm::dir(self.mode, pos)
          .iter()
          .map(|&dir| dir.wrapping_add(pos))
          .filter_map(|pos| {
            y_index_table.get(pos.x as usize).and_then(|line| line.get(pos.y as usize))
          })
          .min()
          .copied()
          .unwrap_or(cur_y_index);

        blocks.extend(
          (max_neighboring.min(cur_y_index)..=cur_y_index).map(|y_index| Block { pos, y_index })
        )
      }
    }

    BV { blocks, width, height }
  }
}
