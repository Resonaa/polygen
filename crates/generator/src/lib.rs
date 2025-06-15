use model::{GM, GMName, GMProfile, RP};
use rand::SeedableRng;

use crate::builder::Build;
use crate::designer::Design;
use crate::extractor::Extract;
use crate::transformer::Transform;

mod builder;
mod designer;
mod extractor;
mod transformer;

pub fn generate(profile: GMProfile) -> (GM, RP) {
  let mut rng = rand_chacha::ChaCha20Rng::from_os_rng();

  let bv = match profile.name {
    GMName::PureRandom => builder::basic::BasicBuilder(profile.config).build(&mut rng),
    _ => unimplemented!()
  };

  let pv = transformer::basic::BasicTransformer(profile.config).transform(bv);

  let (mut gm, rp) = extractor::basic::BasicExtractor(profile.config).extract(pv);

  match profile.name {
    GMName::PureRandom => {
      designer::pure_random::PureRandomDesigner(profile.config).design(&mut gm, &mut rng);
    }
    _ => unimplemented!()
  }

  (gm, rp)
}

#[macro_export]
macro_rules! interpolate {
  ($name:ident, $min:literal, $max:literal, $t:ty ) => {
    const fn $name(ratio: model::types::GMConfigRatio) -> $t {
      $min + ((($max - $min) as model::types::GMConfigRatio) * ratio) as $t
    }
  };
}
