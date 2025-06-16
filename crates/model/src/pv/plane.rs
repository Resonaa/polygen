use crate::Block;
use crate::types::FaceSides;

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Hash)]
pub enum PlaneDir {
  #[default]
  Top,
  Bottom,
  Side(FaceSides)
}

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Plane {
  pub block: Block,
  pub dir: PlaneDir
}
