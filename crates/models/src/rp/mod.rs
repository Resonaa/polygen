mod face;

pub use face::Face;

/// 3D representation of a GM.
#[derive(Clone, Debug)]
pub struct RP {
  pub faces: Vec<Face>
}
