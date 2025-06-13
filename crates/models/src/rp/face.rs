use glam::Vec3A;

#[derive(Debug, Default, Clone, Copy)]
pub struct Face {
  pub position: Vec3A,
  pub nomal: Vec3A,
  pub sides: usize,
  pub radius: f32
}
