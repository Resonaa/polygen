use model::{GM, PV, RP};

pub mod basic;

pub trait Extract {
  fn extract(&self, pv: PV) -> (GM, RP);
}
