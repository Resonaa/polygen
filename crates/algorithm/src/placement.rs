use model::types::{FaceVec, GMMode};
use model::{Face, Plane, PlaneDir, Vec3};

pub trait Placement {
  fn place(&self, mode: GMMode) -> Face;
}

impl Placement for Plane {
  fn place(&self, mode: GMMode) -> Face {
    let sides = match self.dir {
      PlaneDir::Top | PlaneDir::Bottom => mode.sides(),
      _ => 4
    };

    let radius = match self.dir {
      PlaneDir::Top | PlaneDir::Bottom => 1.,
      _ => match mode {
        GMMode::Square => 1.,
        _ => unimplemented!()
      }
    };

    let delta = match mode {
      GMMode::Square => match self.dir {
        PlaneDir::Top => Vec3::new(0., 2_f64.sqrt() / 2., 0.),
        PlaneDir::Bottom => Vec3::new(0., 2_f64.sqrt() / -2., 0.),
        PlaneDir::Rotated(r) => {
          let angle = 2. * FaceVec::acos(-1.) / (mode.sides() as FaceVec) * (r as FaceVec);
          println!("{}pi", angle / FaceVec::acos(-1.));
          Vec3::new(angle.cos(), 0., angle.sin()) * (2_f64.sqrt() / 2.)
        }
      },
      _ => unimplemented!()
    };

    let center = match mode {
      GMMode::Square => {
        let x = self.block.pos.x as FaceVec * 2_f64.sqrt();
        let y = self.block.y_index as FaceVec * 2_f64.sqrt();
        let z = self.block.pos.y as FaceVec * 2_f64.sqrt();

        Vec3::new(x, y, z)
      }
      _ => unimplemented!()
    };

    let position = center + delta;
    let normal = delta.normalized();

    Face { sides, position, normal, radius }
  }
}
