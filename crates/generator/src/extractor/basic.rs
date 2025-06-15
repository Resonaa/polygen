use std::ops::Deref;

use algorithm::Placement;
use model::{GM, GMConfig, PV, RP};

use crate::extractor::Extract;

pub struct BasicExtractor(pub GMConfig);

impl Deref for BasicExtractor {
  type Target = GMConfig;

  fn deref(&self) -> &Self::Target {
    &self.0
  }
}

impl Extract for BasicExtractor {
  fn extract(&self, pv: PV) -> (GM, RP) {
    let gm = GM::new(pv.len());
    let rp = RP(pv.iter().map(|p| p.place(self.mode)).collect());

    (gm, rp)
  }
}
