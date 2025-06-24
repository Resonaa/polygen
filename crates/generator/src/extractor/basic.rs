use std::collections::HashMap;
use std::ops::Deref;

use algorithm::{NextBlock, Placement, dir};
use model::types::LandId;
use model::{Block, GM, GMConfig, PV, Plane, PlaneDir, RP};

use crate::extractor::Extract;

pub struct BasicExtractor(pub GMConfig);

impl Deref for BasicExtractor {
  type Target = GMConfig;

  fn deref(&self) -> &Self::Target { &self.0 }
}

impl Extract for BasicExtractor {
  fn extract(&self, pv: PV) -> (GM, RP) {
    let mut gm = GM::new(pv.len());
    let rp = RP(pv.iter().map(|p| p.place(self.mode)).collect());

    let plane_to_id: HashMap<Plane, LandId> =
      pv.iter().enumerate().map(|(id, plane)| (*plane, id as LandId)).collect();

    let sides = self.mode.sides();

    for (from, plane) in pv.iter().enumerate() {
      let from = from as LandId;

      match plane.dir {
        PlaneDir::Top => {
          // Top planes connect to bottom & side planes on the higher block, other top
          // planes on neighboring blocks and side planes on current block.

          let higher_block = plane.next_block(self.mode);
          (0..self.mode.sides())
            .map(PlaneDir::Side)
            .chain([PlaneDir::Bottom].into_iter())
            .map(|dir| Plane { block: higher_block, dir })
            .chain(
              (0..self.mode.sides())
                .map(|d| plane.block.pos.wrapping_add(dir(self.mode, plane.block.pos)[d as usize]))
                .map(|pos| Block { pos, y_index: plane.block.y_index })
                .map(|block| Plane { block, dir: PlaneDir::Top })
            )
            .chain(
              (0..self.mode.sides())
                .map(PlaneDir::Side)
                .map(|dir| Plane { block: plane.block, dir })
            )
            .filter_map(|plane| plane_to_id.get(&plane))
            .for_each(|&to| gm.add_edge(from, to));
        }
        PlaneDir::Side(d) => {
          // Side planes connect to top & bottom plane on the current block,
          // top plane on next lower block, bottom plane on next higher block,
          // side planes of same side on higher and lower blocks,
          // and neighboring side planes on the current block.

          let next_block = plane.next_block(self.mode);
          [PlaneDir::Top, PlaneDir::Bottom]
            .into_iter()
            .map(|dir| Plane { block: plane.block, dir })
            .chain(
              [
                Plane {
                  block: Block { pos: next_block.pos, y_index: next_block.y_index - 1 },
                  dir: PlaneDir::Top
                },
                Plane {
                  block: Block { pos: next_block.pos, y_index: next_block.y_index + 1 },
                  dir: PlaneDir::Bottom
                },
                Plane {
                  block: Block { pos: plane.block.pos, y_index: plane.block.y_index + 1 },
                  dir: plane.dir
                },
                Plane {
                  block: Block { pos: plane.block.pos, y_index: plane.block.y_index - 1 },
                  dir: plane.dir
                },
                Plane {
                  block: plane.block,
                  dir: PlaneDir::Side(if d == sides - 1 { 0 } else { d + 1 })
                },
                Plane {
                  block: plane.block,
                  dir: PlaneDir::Side(if d == 0 { sides - 1 } else { d - 1 })
                }
              ]
              .into_iter()
            )
            .filter_map(|plane| plane_to_id.get(&plane))
            .for_each(|&to| gm.add_edge(from, to));
        }
        _ => unimplemented!()
      }
    }

    (gm, rp)
  }
}
