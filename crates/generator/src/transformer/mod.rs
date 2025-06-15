use model::{BV, PV};

pub mod basic;

pub trait Transform {
  fn transform(&self, bv: BV) -> PV;
}
