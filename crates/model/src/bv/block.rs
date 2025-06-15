use crate::Vec2;
use crate::types::{BlockVec, BlockYIndex};

#[derive(Debug, Default, Clone, Copy, Hash, PartialEq, Eq)]
pub struct Block {
  pub pos: Vec2<BlockVec>,
  pub y_index: BlockYIndex
}
