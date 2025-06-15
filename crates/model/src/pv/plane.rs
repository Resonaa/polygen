use crate::Block;
use crate::types::FaceSides;

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq)]
pub enum PlaneDir {
  #[default]
  Top,
  Bottom,
  Rotated(FaceSides)
}

#[derive(Debug, Default, Clone, Copy)]
pub struct Plane {
  pub block: Block,
  pub dir: PlaneDir
}
