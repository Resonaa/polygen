use model::types::{BlockVec, GMMode};
use model::{Block, Plane, PlaneDir, Vec2, vec2};

pub(crate) const SUB1: BlockVec = !1 + 1;

/*    <   dir index
z ^     \
  |       \
  |        |
  |-------->
 O        x
*/

const SQUARE: [Vec2<BlockVec>; 4] = [vec2![1, 0], vec2![0, 1], vec2![SUB1, 0], vec2![0, SUB1]];

pub const fn dir(mode: GMMode, _pos: Vec2<BlockVec>) -> &'static [Vec2<BlockVec>] {
  match mode {
    GMMode::Square => &SQUARE,
    _ => unimplemented!()
  }
}

pub trait NextBlock {
  fn next_block(&self, mode: GMMode) -> Block;
}

impl NextBlock for Plane {
  fn next_block(&self, mode: GMMode) -> Block {
    let Block { pos, y_index } = self.block;

    match self.dir {
      PlaneDir::Top => Block { pos, y_index: y_index + 1 },
      PlaneDir::Bottom => Block { pos, y_index: y_index - 1 },
      PlaneDir::Side(d) => Block {
        pos: self.block.pos.wrapping_add(dir(mode, pos).get(d as usize).copied().unwrap()),
        y_index
      }
    }
  }
}

#[cfg(test)]
mod tests {
  use super::SUB1;

  #[test]
  fn is_minus_1() {
    assert_eq!(SUB1.wrapping_add(2), 1);
  }
}
