use crate::Vec3;
use crate::types::{FaceRaduis, FaceSides, FaceVec};

#[derive(rkyv::Archive, rkyv::Deserialize, rkyv::Serialize, Debug, Clone)]
pub struct Face {
  pub position: Vec3<FaceVec>,
  pub normal: Vec3<FaceVec>,
  pub sides: FaceSides,
  pub radius: FaceRaduis
}
