use std::collections::HashSet;
use std::ops::Deref;

use algorithm::NextBlock;
use model::{BV, GMConfig, PV, Plane, PlaneDir};

use crate::transformer::Transform;

pub struct BasicTransformer(pub GMConfig);

impl Deref for BasicTransformer {
  type Target = GMConfig;

  fn deref(&self) -> &Self::Target {
    &self.0
  }
}

impl Transform for BasicTransformer {
  fn transform(&self, bv: BV) -> PV {
    let BV { blocks, width, height } = bv;

    let mut pv = PV::new();

    let block_hash: HashSet<_> = blocks.iter().collect();

    for block in &blocks {
      pv.extend(
        (0..self.mode.sides()).map(PlaneDir::Side).chain([PlaneDir::Top].into_iter()).filter_map(
          |dir| {
            let plane = Plane { dir, block: *block };
            let next = plane.next_block(self.mode);

            // duplicated plane
            if block_hash.contains(&next) {
              return None;
            }

            // useless plane
            if matches!(dir, PlaneDir::Side(_))
              && (!(next.pos.x > 0
                && next.pos.x <= width
                && next.pos.y > 0
                && next.pos.y <= height)
                || block.y_index == 1)
            {
              return None;
            }

            Some(plane)
          }
        )
      );
    }

    pv
  }
}
